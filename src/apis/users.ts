import APIClient from './api-client';
import { MosiaConfig, UserInterface, GetUsersPayload, GetUserPayload, APIResponse } from '../types';

export default class Users {
    private client: APIClient;

    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all users
     */
    async getAll(params?: {
        limit?: number;
        offset?: number;
        search?: string;
        active?: boolean;
    }): Promise<APIResponse<GetUsersPayload>> {
        return this.client.GET<GetUsersPayload>('/user', params);
    }

    /**
     * Get user by ID
     */
    async getById(id: string): Promise<APIResponse<GetUserPayload>> {
        return this.client.GET<GetUserPayload>(`/user/${id}`);
    }

    /**
     * Create a new user
     */
    async create(user: Omit<UserInterface, 'id'>): Promise<APIResponse<GetUserPayload>> {
        return this.client.POST<GetUserPayload>('/user', user);
    }

    /**
     * Update user by ID
     */
    async update(id: string, user: Partial<UserInterface>): Promise<APIResponse<GetUserPayload>> {
        return this.client.PUT<GetUserPayload>(`/user/${id}`, user);
    }

    /**
     * Delete user by ID
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/user/${id}`, params);
    }

    /**
     * Get user session token
     */
    async getSession(id: string): Promise<APIResponse<{ token: string }>> {
        return this.client.GET<{ token: string }>(`/user/${id}/session`);
    }

    /**
     * Upload user profile image
     */
    async uploadProfileImage(id: string, file: File): Promise<APIResponse<GetUserPayload>> {
        const formData = new FormData();
        formData.append('file', file);
        
        // Note: This would need to be implemented with proper file upload handling
        // For now, returning a placeholder
        throw new Error('File upload not implemented in this version');
    }
} 