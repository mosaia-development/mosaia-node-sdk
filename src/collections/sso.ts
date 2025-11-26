import { SSORequestInterface, SSOResponseInterface } from '../types';
import APIClient from '../utils/api-client';

/**
 * SSO API client for the Mosaia SDK
 * 
 * Provides single sign-on (SSO) authentication functionality for OAuth providers.
 * This allows users to authenticate using external OAuth accounts (Google, GitHub, etc.).
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const sso = mosaia.sso;
 * 
 * // Authenticate with SSO
 * const result = await sso.authenticate({
 *   mosaia_user: { id: 'user-id' },
 *   oauth_account: {
 *     type: 'oauth',
 *     provider: 'google'
 *   }
 * });
 * 
 * console.log('SSO token:', result.token);
 * ```
 */
export default class SSO {
    private apiClient: APIClient;
    private uri: string;

    constructor(uri = '') {
        this.uri = `${uri}/sso`;
        this.apiClient = new APIClient();
    }

    /**
     * Authenticate using SSO
     * 
     * Authenticates a user using an external OAuth provider account.
     * Returns a token that can be used for subsequent API requests.
     * 
     * @param request - SSO authentication request object containing:
     *   - `mosaia_user`: User information object with `id` property
     *   - `oauth_account`: OAuth account information object with:
     *     - `type`: OAuth account type (e.g., 'oauth')
     *     - `provider`: OAuth provider name (e.g., 'google', 'github')
     * @returns Promise resolving to SSO response with authentication token
     * 
     * @example
     * ```typescript
     * // Authenticate with Google OAuth
     * const result = await sso.authenticate({
     *   mosaia_user: { id: 'user-123' },
     *   oauth_account: {
     *     type: 'oauth',
     *     provider: 'google'
     *   }
     * });
     * 
     * // Use the token for authentication
     * const mosaia = new Mosaia({
     *   session: {
     *     accessToken: result.token,
     *     authType: 'oauth'
     *   }
     * });
     * ```
     * 
     * @throws {Error} When authentication fails
     */
    async authenticate(request: SSORequestInterface): Promise<SSOResponseInterface> {
        try {
            const response = await this.apiClient.POST<SSOResponseInterface>(this.uri, request);
            return response.data || response as SSOResponseInterface;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
}

