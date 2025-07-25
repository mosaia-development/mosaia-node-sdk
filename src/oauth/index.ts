import crypto from 'crypto';
import { OAuthConfig, OAuthTokenResponse, OAuthErrorResponse } from '../types';
import { DEFAULT_CONFIG } from '../config';

/**
 * OAuth client for handling OAuth2 Authorization Code flow with PKCE
 * 
 * This class implements the OAuth2 Authorization Code flow with PKCE (Proof Key for Code Exchange)
 * for secure authentication, even for public clients. It handles the complete OAuth flow including
 * authorization URL generation, token exchange, and token refresh.
 * 
 * @example
 * ```typescript
 * const oauth = new OAuth({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 *   appURL: 'https://mosaia.ai',
 *   scopes: ['read', 'write']
 * });
 * 
 * const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();
 * // Redirect user to url, then exchange the returned code for a token
 * const token = await oauth.exchangeCodeForToken(code, codeVerifier);
 * ```
 */
export class OAuth {
    private config: OAuthConfig;

    /**
     * Creates a new OAuth instance
     * 
     * @param config - OAuth configuration object
     * @param config.clientId - OAuth client ID
     * @param config.redirectUri - Redirect URI for the OAuth flow
     * @param config.appURL - App URL for authorization endpoints
     * @param config.scopes - Optional array of scopes to request
     * @param config.state - Optional state parameter for CSRF protection
     */
    constructor(config: OAuthConfig) {
        this.config = config;
    }

    /**
     * Generates a PKCE code verifier and code challenge
     * 
     * This method creates a cryptographically secure random code verifier and its
     * corresponding SHA256 hash (code challenge) for PKCE flow security.
     * 
     * @returns Object containing the code verifier and code challenge
     * @returns {string} returns.code_verifier - The code verifier (must be stored securely)
     * @returns {string} returns.code_challenge - The code challenge (sent to authorization server)
     * @private
     */
    private generatePKCE(): { code_verifier: string; code_challenge: string } {
        // Generate code verifier
        const codeVerifier = crypto.randomBytes(32)
            .toString('base64')
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 128);

        // Generate code challenge
        const codeChallenge = crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        return {
            code_verifier: codeVerifier,
            code_challenge: codeChallenge
        };
    }

    /**
     * Generates the authorization URL for the OAuth flow
     * 
     * This method creates the authorization URL that users should be redirected to
     * for OAuth authentication. It also generates and returns the code verifier
     * that must be stored securely and used later for token exchange.
     * 
     * @returns Object containing the authorization URL and code verifier
     * @returns {string} returns.url - The authorization URL to redirect users to
     * @returns {string} returns.codeVerifier - The code verifier (must be stored securely)
     * 
     * @example
     * ```typescript
     * const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();
     * 
     * // Store codeVerifier securely (session, database, etc.)
     * sessionStorage.setItem('codeVerifier', codeVerifier);
     * 
     * // Redirect user to authorization URL
     * window.location.href = url;
     * ```
     */
    getAuthorizationUrlAndCodeVerifier(): { url: string; codeVerifier: string } {
        const { code_verifier, code_challenge } = this.generatePKCE();
        
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            code_challenge: code_challenge,
            code_challenge_method: 'S256',
            ...(this.config.scopes && { scope: this.config.scopes.join(' ') }),
            ...(this.config.state && { state: this.config.state })
        });

        return {
            url: `${this.config.appURL}/oauth?${params.toString()}`,
            codeVerifier: code_verifier
        };
    }

    /**
     * Exchanges the authorization code for an access token
     * 
     * This method exchanges the authorization code received from the OAuth redirect
     * for an access token using the PKCE code verifier for security.
     * 
     * @param code - The authorization code received from the OAuth redirect
     * @param codeVerifier - The code verifier that was generated and stored during authorization
     * @returns Promise that resolves to the OAuth token response
     * @throws {OAuthErrorResponse} When the token exchange fails (invalid code, expired code, etc.)
     * 
     * @example
     * ```typescript
     * // After user authorizes and you receive the code from redirect
     * const code = new URLSearchParams(window.location.search).get('code');
     * const codeVerifier = sessionStorage.getItem('codeVerifier');
     * 
     * if (code && codeVerifier) {
     *   const token = await oauth.exchangeCodeForToken(code, codeVerifier);
     *   console.log('Access token:', token.access_token);
     *   console.log('Refresh token:', token.refresh_token);
     * }
     * ```
     */
    async exchangeCodeForToken(code: string, codeVerifier: string): Promise<OAuthTokenResponse> {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            code: code,
            code_verifier: codeVerifier,
            grant_type: 'authorization_code'
        });

        try {
            const response = await fetch(`${DEFAULT_CONFIG.API.BASE_URL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });

            const data = await response.json();

            if (!response.ok) {
                throw data as OAuthErrorResponse;
            }

            return data as OAuthTokenResponse;
        } catch (error) {
            throw error as OAuthErrorResponse;
        }
    }

    /**
     * Refreshes an access token using a refresh token
     * 
     * This method exchanges a refresh token for a new access token when the current
     * access token expires. This allows for long-term authentication without requiring
     * user re-authentication.
     * 
     * @param refreshToken - The refresh token received from the initial token exchange
     * @returns Promise that resolves to a new OAuth token response
     * @throws {OAuthErrorResponse} When the refresh fails (invalid refresh token, expired, etc.)
     * 
     * @example
     * ```typescript
     * // When access token expires, use refresh token to get new tokens
     * try {
     *   const newToken = await oauth.refreshToken(refreshToken);
     *   console.log('New access token:', newToken.access_token);
     *   console.log('New refresh token:', newToken.refresh_token);
     * } catch (error) {
     *   // Refresh token expired, user needs to re-authenticate
     *   console.error('Token refresh failed:', error);
     * }
     * ```
     */
    async refreshToken(refreshToken: string): Promise<OAuthTokenResponse> {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        });

        try {
            const response = await fetch(`${DEFAULT_CONFIG.API.BASE_URL}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });

            const data = await response.json();

            if (!response.ok) {
                throw data as OAuthErrorResponse;
            }

            return data as OAuthTokenResponse;
        } catch (error) {
            throw error as OAuthErrorResponse;
        }
    }
}
