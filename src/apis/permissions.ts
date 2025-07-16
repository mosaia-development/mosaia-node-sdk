import APIClient from './api-client';
import { MosiaConfig, AccessPolicyInterface, OrgPermissionInterface, UserPermissionInterface, GetAccessPoliciesPayload, GetAccessPolicyPayload, GetOrgPermissionsPayload, GetOrgPermissionPayload, GetUserPermissionsPayload, GetUserPermissionPayload, APIResponse } from '../types';

export default class Permissions {
    private client: APIClient;

    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    // Access Policy operations
    async getAccessPolicies(params?: {
        limit?: number;
        offset?: number;
        search?: string;
        active?: boolean;
    }): Promise<APIResponse<GetAccessPoliciesPayload>> {
        return this.client.GET<GetAccessPoliciesPayload>('/iam/policy', params);
    }

    async getAccessPolicy(id: string): Promise<APIResponse<GetAccessPolicyPayload>> {
        return this.client.GET<GetAccessPolicyPayload>(`/iam/policy/${id}`);
    }

    async createAccessPolicy(policy: Omit<AccessPolicyInterface, 'id'>): Promise<APIResponse<GetAccessPolicyPayload>> {
        return this.client.POST<GetAccessPolicyPayload>('/iam/policy', policy);
    }

    async updateAccessPolicy(id: string, policy: Partial<AccessPolicyInterface>): Promise<APIResponse<GetAccessPolicyPayload>> {
        return this.client.PUT<GetAccessPolicyPayload>(`/iam/policy/${id}`, policy);
    }

    async deleteAccessPolicy(id: string): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/iam/policy/${id}`);
    }

    // Org Permission operations
    async getOrgPermissions(params?: {
        limit?: number;
        offset?: number;
        org?: string;
        user?: string;
        client?: string;
    }): Promise<APIResponse<GetOrgPermissionsPayload>> {
        return this.client.GET<GetOrgPermissionsPayload>('/iam/permission', params);
    }

    async getOrgPermission(id: string): Promise<APIResponse<GetOrgPermissionPayload>> {
        return this.client.GET<GetOrgPermissionPayload>(`/iam/permission/${id}`);
    }

    async createOrgPermission(permission: Omit<OrgPermissionInterface, 'id'>): Promise<APIResponse<GetOrgPermissionPayload>> {
        return this.client.POST<GetOrgPermissionPayload>('/iam/permission', permission);
    }

    async updateOrgPermission(id: string, permission: Partial<OrgPermissionInterface>): Promise<APIResponse<GetOrgPermissionPayload>> {
        return this.client.PUT<GetOrgPermissionPayload>(`/iam/permission/${id}`, permission);
    }

    async deleteOrgPermission(id: string): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/iam/permission/${id}`);
    }

    // User Permission operations
    async getUserPermissions(params?: {
        limit?: number;
        offset?: number;
        user?: string;
        client?: string;
    }): Promise<APIResponse<GetUserPermissionsPayload>> {
        return this.client.GET<GetUserPermissionsPayload>('/user/permission', params);
    }

    async getUserPermission(id: string): Promise<APIResponse<GetUserPermissionPayload>> {
        return this.client.GET<GetUserPermissionPayload>(`/user/permission/${id}`);
    }

    async createUserPermission(permission: Omit<UserPermissionInterface, 'id'>): Promise<APIResponse<GetUserPermissionPayload>> {
        return this.client.POST<GetUserPermissionPayload>('/user/permission', permission);
    }

    async updateUserPermission(id: string, permission: Partial<UserPermissionInterface>): Promise<APIResponse<GetUserPermissionPayload>> {
        return this.client.PUT<GetUserPermissionPayload>(`/user/permission/${id}`, permission);
    }

    async deleteUserPermission(id: string): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/user/permission/${id}`);
    }
} 