import APIClient from './api-client';
import { MosiaConfig, ClientInterface, GetClientsPayload, GetClientPayload, APIResponse } from '../types';

export default class Clients {
    private client: APIClient;

    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all clients
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
     * Get client by ID
     */
    async getById(id: string): Promise<APIResponse<GetClientPayload>> {
        return this.client.GET<GetClientPayload>(`/client/${id}`);
    }

    /**
     * Create a new client
     */
    async create(client: Omit<ClientInterface, 'id'>): Promise<APIResponse<GetClientPayload>> {
        return this.client.POST<GetClientPayload>('/client', client);
    }

    /**
     * Update client by ID
     */
    async update(id: string, client: Partial<ClientInterface>): Promise<APIResponse<GetClientPayload>> {
        return this.client.PUT<GetClientPayload>(`/client/${id}`, client);
    }

    /**
     * Delete client by ID
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/client/${id}`, params);
    }
} 