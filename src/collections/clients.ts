import {
    ClientInterface,
    GetClientsPayload,
    GetClientPayload,
} from '../types';
import { Client } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Clients API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing OAuth clients in the Mosaia platform.
 * Clients represent OAuth applications that can authenticate with the Mosaia API,
 * enabling secure access to platform resources through various authentication flows.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve OAuth clients with filtering and pagination
 * - Create new OAuth client applications
 * - Update existing client configurations
 * - Delete OAuth clients
 * - Manage client secrets and redirect URIs
 * - Handle OAuth scopes and permissions
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const clients = mosaia.clients;
 * 
 * // Get all OAuth clients
 * const allClients = await clients.get();
 * 
 * // Get a specific OAuth client
 * const client = await clients.get({}, 'client-id');
 * 
 * // Create a new OAuth client
 * const newClient = await clients.create({
 *   name: 'My Application',
 *   client_id: 'my-app-client-id',
 *   client_secret: 'my-app-client-secret',
 *   redirect_uris: ['https://myapp.com/callback'],
 *   scopes: ['read', 'write']
 * });
 * ```
 * 
 * @extends BaseCollection<ClientInterface, Client, GetClientsPayload, GetClientPayload>
 */
export default class Clients extends BaseCollection<
    ClientInterface,
    Client,
    GetClientsPayload,
    GetClientPayload
> {
    /**
     * Creates a new Clients API client instance
     * 
     * Initializes the clients API client with the appropriate endpoint URI
     * and model class for handling OAuth client operations.
     * 
     * The constructor sets up the API endpoint to `/client` (or `${uri}/client` if a base URI is provided),
     * which corresponds to the Mosaia API's OAuth clients endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/client`.
     *              If not provided, defaults to `/client`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/client)
     * const clients = new Clients();
     * 
     * // Create with custom base URI
     * const clients = new Clients('/api/v1');
     * // This will use endpoint: /api/v1/client
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/client`, Client);
    }
}