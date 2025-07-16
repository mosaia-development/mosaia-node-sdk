import APIClient from './api-client';
import { MosiaConfig, OrganizationInterface, GetOrgsPayload, GetOrgPayload, APIResponse } from '../types';

export default class Organizations {
    private client: APIClient;

    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all organizations
     */
    async getAll(params?: {
        limit?: number;
        offset?: number;
        search?: string;
        active?: boolean;
    }): Promise<APIResponse<GetOrgsPayload>> {
        return this.client.GET<GetOrgsPayload>('/org', params);
    }

    /**
     * Get organization by ID
     */
    async getById(id: string): Promise<APIResponse<GetOrgPayload>> {
        return this.client.GET<GetOrgPayload>(`/org/${id}`);
    }

    /**
     * Create a new organization
     */
    async create(org: Omit<OrganizationInterface, 'id'>): Promise<APIResponse<GetOrgPayload>> {
        return this.client.POST<GetOrgPayload>('/org', org);
    }

    /**
     * Update organization by ID
     */
    async update(id: string, org: Partial<OrganizationInterface>): Promise<APIResponse<GetOrgPayload>> {
        return this.client.PUT<GetOrgPayload>(`/org/${id}`, org);
    }

    /**
     * Delete organization by ID
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/org/${id}`, params);
    }

    /**
     * Upload organization profile image
     */
    async uploadProfileImage(id: string, file: File): Promise<APIResponse<GetOrgPayload>> {
        const formData = new FormData();
        formData.append('file', file);
        
        // Note: This would need to be implemented with proper file upload handling
        // For now, returning a placeholder
        throw new Error('File upload not implemented in this version');
    }
} 