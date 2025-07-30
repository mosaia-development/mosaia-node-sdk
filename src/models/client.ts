import { ClientInterface } from '../types';
import { BaseModel } from './base';

/**
 * Client class for managing OAuth client instances in the Mosaia SDK
 * 
 * Represents an OAuth client application that can authenticate with the Mosaia API
 * through various authentication flows. OAuth clients enable secure access to
 * platform resources for external applications.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - OAuth client data management and validation
 * - Client configuration and settings management
 * - Integration with the Mosaia API for client operations
 * - OAuth flow support and authentication handling
 * 
 * @example
 * ```typescript
 * import { Client } from 'mosaia-node-sdk';
 * 
 * // Create a client instance
 * const client = new Client({
 *   name: 'My Application',
 *   client_id: 'my-app-client-id',
 *   client_secret: 'my-app-client-secret',
 *   redirect_uris: ['https://myapp.com/callback'],
 *   scopes: ['read', 'write']
 * });
 * 
 * // Access client data
 * console.log('Client ID:', client.client_id);
 * console.log('Client Name:', client.name);
 * ```
 * 
 * @extends BaseModel<ClientInterface>
 */
export default class Client extends BaseModel<ClientInterface> {
    /**
     * Creates a new Client instance
     * 
     * Initializes an OAuth client with the provided configuration data and optional URI.
     * The client represents an OAuth application that can authenticate with the platform.
     * 
     * @param data - OAuth client configuration data
     * @param uri - Optional URI path for the client endpoint. Defaults to '/client'
     * 
     * @example
     * ```typescript
     * const client = new Client({
     *   name: 'My App',
     *   client_id: 'app-client-id',
     *   redirect_uris: ['https://myapp.com/callback']
     * });
     * ```
     */
    constructor(data: Partial<ClientInterface>, uri?: string) {
        super(data, uri || '/client');
    }
}