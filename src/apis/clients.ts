import APIClient from './api-client';
import { MosiaConfig, ClientInterface, GetClientsPayload, GetClientPayload, APIResponse } from '../types';

/**
 * Clients API client for managing OAuth clients
 * 
 * This class provides methods for creating, reading, updating, and deleting
 * OAuth clients on the Mosaia platform. OAuth clients are used for
 * authentication and authorization flows.
 * 
 * @example
 * ```typescript
 * const clients = new Clients(config);
 * 
 * // Get all clients
 * const allClients = await clients.getAll();
 * 
 * // Get specific client
 * const client = await clients.getById('client-id');
 * 
 * // Create new client
 * const newClient = await clients.create({
 *   name: 'My App Client',
 *   client_id: 'my-app-client',
 *   redirect_uris: ['https://myapp.com/callback'],
 *   scopes: ['read', 'write']
 * });
 * ```
 */
export default class Clients {
    private client: APIClient;

    /**
     * Creates a new Clients API client instance
     * 
     * @param config - Configuration object containing API settings
     */
    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all clients with optional filtering and pagination
     * 
     * Retrieves a list of OAuth clients from the platform with support for
     * filtering, searching, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of clients to return
     * @param params.offset - Number of clients to skip for pagination
     * @param params.search - Search term to filter clients by name
     * @param params.active - Filter by active status (true/false)
     * @param params.org - Filter clients by organization ID
     * @param params.user - Filter clients by user ID
     * @returns Promise that resolves to a paginated list of clients
     * 
     * @example
     * ```typescript
     * // Get all clients
     * const allClients = await clients.getAll();
     * 
     * // Get first 10 active clients
     * const activeClients = await clients.getAll({ 
     *   limit: 10, 
     *   offset: 0, 
     *   active: true 
     * });
     * 
     * // Search for clients
     * const searchResults = await clients.getAll({ 
     *   search: 'mobile',
     *   limit: 20 
     * });
     * ```
     */
    async getAll(params?: {
        limit?: number;
        offset?: number;
        search?: string;
        active?: boolean;
        org?: string;
        user?: string;
    }): Promise<APIResponse<GetClientsPayload>> {
        return this.client.GET<GetClientsPayload>('/client', params);
    }

    /**
     * Get a specific client by its ID
     * 
     * Retrieves detailed information about a single OAuth client from the platform.
     * 
     * @param id - The unique identifier of the client
     * @returns Promise that resolves to the client data
     * 
     * @example
     * ```typescript
     * const client = await clients.getById('client-123');
     * console.log('Client name:', client.data.name);
     * console.log('Client ID:', client.data.client_id);
     * console.log('Redirect URIs:', client.data.redirect_uris);
     * ```
     */
    async getById(id: string): Promise<APIResponse<GetClientPayload>> {
        return this.client.GET<GetClientPayload>(`/client/${id}`);
    }

    /**
     * Create a new OAuth client
     * 
     * Creates a new OAuth client on the platform for authentication flows.
     * 
     * @param client - Client data for the new client (ID will be generated)
     * @param client.name - Client name (required)
     * @param client.client_id - OAuth client identifier (required)
     * @param client.redirect_uris - Array of allowed redirect URIs (optional)
     * @param client.scopes - Array of allowed scopes (optional)
     * @param client.org - Organization ID the client belongs to (optional)
     * @param client.user - User ID the client belongs to (optional)
     * @returns Promise that resolves to the created client data
     * 
     * @example
     * ```typescript
     * const newClient = await clients.create({
     *   name: 'Mobile App Client',
     *   client_id: 'mobile-app-123',
     *   redirect_uris: [
     *     'https://myapp.com/callback',
     *     'myapp://oauth/callback'
     *   ],
     *   scopes: ['read', 'write', 'profile'],
     *   org: 'org-123',
     *   active: true
     * });
     * 
     * console.log('Created client ID:', newClient.data.id);
     * ```
     */
    async create(client: Omit<ClientInterface, 'id'>): Promise<APIResponse<GetClientPayload>> {
        return this.client.POST<GetClientPayload>('/client', client);
    }

    /**
     * Update an existing OAuth client
     * 
     * Updates a client with the provided data. Only the provided fields
     * will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the client to update
     * @param client - Partial client data containing only the fields to update
     * @returns Promise that resolves to the updated client data
     * 
     * @example
     * ```typescript
     * // Update client name and redirect URIs
     * const updatedClient = await clients.update('client-123', {
     *   name: 'Updated App Client',
     *   redirect_uris: ['https://newapp.com/callback']
     * });
     * 
     * // Update client scopes
     * const updatedClient = await clients.update('client-123', {
     *   scopes: ['read', 'write', 'admin']
     * });
     * 
     * // Deactivate client
     * const updatedClient = await clients.update('client-123', {
     *   active: false
     * });
     * ```
     */
    async update(id: string, client: Partial<ClientInterface>): Promise<APIResponse<GetClientPayload>> {
        return this.client.PUT<GetClientPayload>(`/client/${id}`, client);
    }

    /**
     * Delete an OAuth client
     * 
     * Removes an OAuth client from the platform. By default, this performs a soft delete
     * (marks the client as inactive). Use the force parameter for hard deletion.
     * 
     * @param id - The unique identifier of the client to delete
     * @param params - Optional parameters for deletion behavior
     * @param params.force - If true, performs a hard delete instead of soft delete
     * @returns Promise that resolves when the client is successfully deleted
     * 
     * @example
     * ```typescript
     * // Soft delete (mark as inactive)
     * await clients.delete('client-123');
     * 
     * // Hard delete (permanently remove)
     * await clients.delete('client-123', { force: true });
     * ```
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/client/${id}`, params);
    }
} 