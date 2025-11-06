import { ClientInterface } from '../types';
import { BaseModel } from './base';

/**
 * Client class for managing OAuth client applications
 * 
 * This class represents an OAuth client application that can authenticate with
 * the Mosaia API through various OAuth flows. It manages client credentials,
 * redirect URIs, and scopes for secure API access.
 * 
 * Features:
 * - OAuth client management
 * - Secure credential handling
 * - Redirect URI configuration
 * - Scope management
 * - Flow configuration
 * 
 * @remarks
 * OAuth clients are essential for:
 * - Third-party application integration
 * - Secure API access
 * - User authentication flows
 * - Resource authorization
 * - Access token management
 * 
 * The class supports multiple OAuth 2.0 flows:
 * - Authorization Code (with PKCE)
 * - Client Credentials
 * - Resource Owner Password
 * 
 * @example
 * Basic client setup:
 * ```typescript
 * import { Client } from 'mosaia-node-sdk';
 * 
 * // Create an OAuth client for web application
 * const webClient = new Client({
 *   name: 'Web Dashboard',
 *   client_id: process.env.CLIENT_ID,
 *   client_secret: process.env.CLIENT_SECRET,
 *   redirect_uris: ['https://app.example.com/oauth/callback'],
 *   scopes: ['read:users', 'write:data']
 * });
 * 
 * await webClient.save();
 * ```
 * 
 * @example
 * Service account setup:
 * ```typescript
 * // Create a service account client
 * const serviceClient = new Client({
 *   name: 'Background Service',
 *   client_id: process.env.SERVICE_CLIENT_ID,
 *   client_secret: process.env.SERVICE_CLIENT_SECRET,
 *   grant_types: ['client_credentials'],
 *   scopes: ['service:full'],
 *   metadata: {
 *     service: 'data-processor',
 *     environment: 'production'
 *   }
 * });
 * 
 * if (serviceClient.isActive()) {
 *   console.log('Service client ready');
 *   console.log('Available scopes:', serviceClient.scopes);
 * }
 * ```
 * 
 * @extends BaseModel<ClientInterface>
 * @category Models
 */
export default class Client extends BaseModel<ClientInterface> {
    /**
     * Creates a new OAuth client instance
     * 
     * Initializes an OAuth client application with the provided configuration.
     * The client manages authentication and authorization for accessing the
     * Mosaia API securely.
     * 
     * @param data - Configuration data including:
     *               - name: Client application name
     *               - client_id: OAuth client ID
     *               - client_secret: OAuth client secret
     *               - redirect_uris: Authorized redirect URIs
     *               - scopes: Authorized scope list
     *               - grant_types: Supported OAuth grant types
     *               - metadata: Custom metadata object
     * @param uri - Optional custom URI path for the client endpoint
     * 
     * @example
     * Web application client:
     * ```typescript
     * const webClient = new Client({
     *   name: 'Web App',
     *   client_id: process.env.CLIENT_ID,
     *   client_secret: process.env.CLIENT_SECRET,
     *   redirect_uris: [
     *     'https://app.example.com/oauth/callback',
     *     'http://localhost:3000/callback'  // Development
     *   ],
     *   scopes: ['read:users', 'write:data']
     * });
     * ```
     * 
     * @example
     * Machine-to-machine client:
     * ```typescript
     * const serviceClient = new Client({
     *   name: 'API Service',
     *   client_id: process.env.SERVICE_CLIENT_ID,
     *   client_secret: process.env.SERVICE_CLIENT_SECRET,
     *   grant_types: ['client_credentials'],
     *   scopes: ['service:full'],
     *   metadata: {
     *     type: 'service-account',
     *     owner: 'system'
     *   }
     * }, '/service/client');
     * ```
     */
    constructor(data: Partial<ClientInterface>, uri?: string) {
        super(data, uri || '/client');
    }
}