import { ScopeInterface, GetScopesPayload } from '../types';
import APIClient from '../utils/api-client';

/**
 * Scopes API client for the Mosaia SDK
 * 
 * Provides access to permission scopes available in the Mosaia platform.
 * Scopes define the permissions that can be granted to OAuth clients and users.
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const scopes = mosaia.scopes;
 * 
 * // Get all available scopes
 * const result = await scopes.get();
 * console.log('Available scopes:', result.data.scopes);
 * ```
 */
export default class Scopes {
    private apiClient: APIClient;
    private uri: string;

    constructor(uri = '') {
        this.uri = `${uri}/scope`;
        this.apiClient = new APIClient();
    }

    /**
     * Get all available permission scopes
     * 
     * Retrieves a list of all permission scopes available in the platform.
     * These scopes can be used for OAuth authorization and permission management.
     * 
     * @returns Promise resolving to scopes list
     * 
     * @example
     * ```typescript
     * const result = await scopes.get();
     * result.data.scopes.forEach(scope => {
     *   console.log(`Scope: ${scope.name} - ${scope.description}`);
     * });
     * ```
     * 
     * @throws {Error} When API request fails
     */
    async get(): Promise<GetScopesPayload> {
        try {
            const response = await this.apiClient.GET<GetScopesPayload>(this.uri);
            return response.data || response as GetScopesPayload;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
}

