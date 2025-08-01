import crypto from 'crypto';
import {
    OAuthConfig,
    OAuthErrorResponse,
    MosaiaConfig
} from '../types';
import {
    ConfigurationManager,
    DEFAULT_CONFIG
} from '../config';

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
    /**
     * OAuth configuration object
     * 
     * @type {OAuthConfig}
     */
    public config: OAuthConfig;

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
        const configManager = ConfigurationManager.getInstance();
        const defaultConfig = configManager.getConfig();

        if (!config.appURL) config.appURL = DEFAULT_CONFIG.APP.URL;
        if (defaultConfig) {
            if (!config.clientId) config.clientId = defaultConfig.clientId;
            if (!config.apiURL) config.apiURL = defaultConfig.apiURL;
            if (!config.apiVersion) config.apiVersion = defaultConfig.version;
        }
        if (!config.clientId) {
            throw new Error('clientId is required in OAuth config');
        }
        if (!config.apiURL) {
            throw new Error('apiURL is required in OAuth config');
        }
        if (!config.apiVersion) {
            throw new Error('apiVersion is required in OAuth config');
        }
        if (!config.scopes || config.scopes.length === 0) {
            throw new Error('scopes are required in OAuth config');
        }
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
        // Generate code verifier using base64url encoding (RFC 7636 compliant)
        // Use 96 bytes to ensure we get 128 characters after base64url encoding
        const codeVerifier = crypto.randomBytes(96)
            .toString('base64url');

        // Generate code challenge using SHA256 hash and base64url encoding
        const codeChallenge = crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');

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
            client_id: this.config.clientId!,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            code_challenge: code_challenge,
            code_challenge_method: 'S256',
            ...(this.config.scopes && this.config.scopes.length > 0 && { scope: this.config.scopes.join(',') }),
            ...(this.config.state && { state: this.config.state })
        });

        return {
            url: `${this.config.appURL!}/oauth?${params.toString()}`,
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
     *   const mosaiaConfig = await oauth.exchangeCodeForToken(code, codeVerifier);
     *   mosaia.config = mosaiaConfig;
     *   console.log('Access token:', mosaiaConfig.apiKey);
     *   console.log('Refresh token:', mosaiaConfig.refreshToken);
     * }
     * ```
     */
    async authenticateWithCodeAndVerifier(code: string, codeVerifier: string): Promise<MosaiaConfig> {
        const params = new URLSearchParams({
            client_id: this.config.clientId!,
            redirect_uri: this.config.redirectUri,
            code: code,
            code_verifier: codeVerifier,
            grant_type: 'authorization_code'
        });

        try {
            const {
                apiURL,
                apiVersion
            } = this.config;
            const response = await fetch(`${apiURL}/v${apiVersion}/auth/token`, {
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

            const sesson = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                sub: data.sub,
                iat: data.iat,
                exp: data.exp,
                authType: 'oauth' as const
            };

            return Promise.resolve({
                ...this.config,
                apiKey: sesson.accessToken,
                session: sesson
            });
        } catch (error) {
            throw error as OAuthErrorResponse;
        }
    }
}
