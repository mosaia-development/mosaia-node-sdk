import crypto from 'crypto';
import { OAuthConfig, OAuthTokenResponse, OAuthErrorResponse } from '../types';
import { DEFAULT_CONFIG } from '../config';

export class OAuth {
    private config: OAuthConfig;

    constructor(config: OAuthConfig) {
        this.config = config;
    }

    /**
     * Generates a PKCE code verifier and code challenge
     * @returns {Object} Object containing code_verifier and code_challenge
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
     * @returns {Object} Object containing the authorization URL and code verifier
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
     * @param code The authorization code received from the redirect
     * @param codeVerifier The code verifier that was used in the authorization request
     * @returns {Promise<OAuthTokenResponse>} The token response
     * @throws {OAuthErrorResponse} If the token exchange fails
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
     * @param refreshToken The refresh token
     * @returns {Promise<OAuthTokenResponse>} The new token response
     * @throws {OAuthErrorResponse} If the refresh fails
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
