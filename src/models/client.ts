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
 * // Create an OAuth client for a web application.
 * // The client `name` is the public identifier (analogous to client_id); the secret
 * // is generated server-side on create and returned once.
 * const webClient = new Client({
 *   name: 'acme-web-dashboard',
 *   oauth: {
 *     active: true,
 *     authorized_redirect_uris: ['https://app.example.com/oauth/callback']
 *   }
 * });
 *
 * const saved = await webClient.save();
 * console.log('Save and store client secret:', saved.secret);
 * ```
 *
 * @example
 * Service account client:
 * ```typescript
 * // Machine-to-machine client. OAuth can be disabled when the client is used
 * // only with client-credentials / API-key flows.
 * const serviceClient = new Client({
 *   name: 'acme-data-processor',
 *   oauth: { active: false },
 *   tags: ['service', 'background']
 * });
 *
 * if (serviceClient.isActive()) {
 *   console.log('Service client ready:', serviceClient.name);
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
     *               - name: Client identifier (required, regex `[a-zA-Z0-9_:-]+`). Used as the OAuth `client_id`.
     *               - oauth.active: Whether to enable the OAuth authorize flow
     *               - oauth.authorized_redirect_uris: Accepted redirect URIs
     *               - tags: Free-form tags for grouping
     *               Note: `secret` and `refresh_key` are generated server-side and never supplied by clients.
     * @param uri - Optional custom URI path for the client endpoint
     *
     * @example
     * Web application client (OAuth enabled):
     * ```typescript
     * const webClient = new Client({
     *   name: 'acme-web-app',
     *   oauth: {
     *     active: true,
     *     authorized_redirect_uris: [
     *       'https://app.example.com/oauth/callback',
     *       'http://localhost:3000/callback'
     *     ]
     *   }
     * });
     * ```
     *
     * @example
     * Service account client (OAuth disabled):
     * ```typescript
     * const serviceClient = new Client({
     *   name: 'acme-api-service',
     *   oauth: { active: false },
     *   tags: ['service-account']
     * }, '/service/client');
     * ```
     */
    constructor(data: Partial<ClientInterface>, uri?: string) {
        super(data, uri || '/client');
    }
}