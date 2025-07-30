import APIClient from './api-client';
import { MosiaConfig, AccessPolicyInterface, OrgPermissionInterface, UserPermissionInterface, GetAccessPoliciesPayload, GetAccessPolicyPayload, GetOrgPermissionsPayload, GetOrgPermissionPayload, GetUserPermissionsPayload, GetUserPermissionPayload, APIResponse } from '../types';

/**
 * Permissions API client for managing access policies and permissions
 * 
 * This class provides methods for managing Identity and Access Management (IAM)
 * resources including access policies, organization permissions, and user permissions.
 * Supports fine-grained access control across the platform.
 * 
 * @example
 * ```typescript
 * const permissions = new Permissions(config);
 * 
 * // Get all access policies
 * const policies = await permissions.getAccessPolicies();
 * 
 * // Create new access policy
 * const newPolicy = await permissions.createAccessPolicy({
 *   name: 'Admin Access',
 *   effect: 'allow',
 *   actions: ['read', 'write', 'delete'],
 *   resources: ['*']
 * });
 * 
 * // Get organization permissions
 * const orgPermissions = await permissions.getOrgPermissions({ org: 'org-123' });
 * 
 * // Create user permission
 * const userPermission = await permissions.createUserPermission({
 *   user: 'user-456',
 *   client: 'client-789',
 *   policy: 'policy-123'
 * });
 * ```
 */
export default class Permissions {
    private client: APIClient;

    /**
     * Creates a new Permissions API client instance
     * 
     * @param config - Configuration object containing API settings
     */
    constructor() {
        this.client = new APIClient();
    }

    /**
     * Get all access policies with optional filtering and pagination
     * 
     * Retrieves a list of access policies from the platform with support for
     * filtering, searching, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of policies to return
     * @param params.offset - Number of policies to skip for pagination
     * @param params.search - Search term to filter policies by name
     * @param params.active - Filter by active status (true/false)
     * @returns Promise that resolves to a paginated list of access policies
     * 
     * @example
     * ```typescript
     * // Get all access policies
     * const allPolicies = await permissions.getAccessPolicies();
     * 
     * // Get first 10 active policies
     * const activePolicies = await permissions.getAccessPolicies({ 
     *   limit: 10, 
     *   offset: 0, 
     *   active: true 
     * });
     * 
     * // Search for admin policies
     * const adminPolicies = await permissions.getAccessPolicies({ 
     *   search: 'admin',
     *   limit: 20 
     * });
     * ```
     */
    async getAccessPolicies(params?: {
        limit?: number;
        offset?: number;
        search?: string;
        active?: boolean;
    }): Promise<APIResponse<GetAccessPoliciesPayload>> {
        return this.client.GET<GetAccessPoliciesPayload>('/iam/policy', params);
    }

    /**
     * Get a specific access policy by its ID
     * 
     * Retrieves detailed information about a single access policy from the platform.
     * 
     * @param id - The unique identifier of the access policy
     * @returns Promise that resolves to the access policy data
     * 
     * @example
     * ```typescript
     * const policy = await permissions.getAccessPolicy('policy-123');
     * console.log('Policy name:', policy.data.name);
     * console.log('Effect:', policy.data.effect);
     * console.log('Actions:', policy.data.actions);
     * console.log('Resources:', policy.data.resources);
     * ```
     */
    async getAccessPolicy(id: string): Promise<APIResponse<GetAccessPolicyPayload>> {
        return this.client.GET<GetAccessPolicyPayload>(`/iam/policy/${id}`);
    }

    /**
     * Create a new access policy
     * 
     * Creates a new access policy on the platform for defining permissions.
     * 
     * @param policy - Policy data for the new policy (ID will be generated)
     * @param policy.name - Policy name (required)
     * @param policy.effect - Policy effect ('allow' or 'deny') (required)
     * @param policy.actions - Array of actions the policy applies to (required)
     * @param policy.resources - Array of resources the policy applies to (required)
     * @param policy.conditions - Optional conditions for the policy
     * @returns Promise that resolves to the created access policy data
     * 
     * @example
     * ```typescript
     * const newPolicy = await permissions.createAccessPolicy({
     *   name: 'Read-Only Access',
     *   effect: 'allow',
     *   actions: ['read', 'list'],
     *   resources: ['apps/*', 'tools/*'],
     *   conditions: {
     *     StringEquals: {
     *       'user.role': 'viewer'
     *     }
     *   }
     * });
     * 
     * console.log('Created policy ID:', newPolicy.data.id);
     * ```
     */
    async createAccessPolicy(policy: Omit<AccessPolicyInterface, 'id'>): Promise<APIResponse<GetAccessPolicyPayload>> {
        return this.client.POST<GetAccessPolicyPayload>('/iam/policy', policy);
    }

    /**
     * Update an existing access policy
     * 
     * Updates an access policy with the provided data. Only the provided fields
     * will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the access policy to update
     * @param policy - Partial policy data containing only the fields to update
     * @returns Promise that resolves to the updated access policy data
     * 
     * @example
     * ```typescript
     * // Update policy name and actions
     * const updatedPolicy = await permissions.updateAccessPolicy('policy-123', {
     *   name: 'Updated Admin Access',
     *   actions: ['read', 'write', 'delete', 'admin']
     * });
     * 
     * // Update policy resources
     * const updatedPolicy = await permissions.updateAccessPolicy('policy-123', {
     *   resources: ['apps/*', 'tools/*', 'users/*']
     * });
     * 
     * // Change policy effect
     * const updatedPolicy = await permissions.updateAccessPolicy('policy-123', {
     *   effect: 'deny'
     * });
     * ```
     */
    async updateAccessPolicy(id: string, policy: Partial<AccessPolicyInterface>): Promise<APIResponse<GetAccessPolicyPayload>> {
        return this.client.PUT<GetAccessPolicyPayload>(`/iam/policy/${id}`, policy);
    }

    /**
     * Delete an access policy
     * 
     * Removes an access policy from the platform.
     * 
     * @param id - The unique identifier of the access policy to delete
     * @returns Promise that resolves when the access policy is successfully deleted
     * 
     * @example
     * ```typescript
     * await permissions.deleteAccessPolicy('policy-123');
     * console.log('Access policy deleted successfully');
     * ```
     */
    async deleteAccessPolicy(id: string): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/iam/policy/${id}`);
    }

    /**
     * Get all organization permissions with optional filtering and pagination
     * 
     * Retrieves a list of organization permissions from the platform with support for
     * filtering by organization, user, or client, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of permissions to return
     * @param params.offset - Number of permissions to skip for pagination
     * @param params.org - Filter permissions by organization ID
     * @param params.user - Filter permissions by user ID
     * @param params.client - Filter permissions by client ID
     * @returns Promise that resolves to a paginated list of organization permissions
     * 
     * @example
     * ```typescript
     * // Get all organization permissions
     * const allOrgPermissions = await permissions.getOrgPermissions();
     * 
     * // Get permissions for specific organization
     * const orgPermissions = await permissions.getOrgPermissions({ 
     *   org: 'org-123',
     *   limit: 20 
     * });
     * 
     * // Get permissions for specific user in organization
     * const userOrgPermissions = await permissions.getOrgPermissions({ 
     *   org: 'org-123',
     *   user: 'user-456' 
     * });
     * ```
     */
    async getOrgPermissions(params?: {
        limit?: number;
        offset?: number;
        org?: string;
        user?: string;
        client?: string;
    }): Promise<APIResponse<GetOrgPermissionsPayload>> {
        return this.client.GET<GetOrgPermissionsPayload>('/iam/permission', params);
    }

    /**
     * Get a specific organization permission by its ID
     * 
     * Retrieves detailed information about a single organization permission from the platform.
     * 
     * @param id - The unique identifier of the organization permission
     * @returns Promise that resolves to the organization permission data
     * 
     * @example
     * ```typescript
     * const orgPermission = await permissions.getOrgPermission('permission-123');
     * console.log('Organization:', orgPermission.data.org);
     * console.log('User:', orgPermission.data.user);
     * console.log('Client:', orgPermission.data.client);
     * console.log('Policy:', orgPermission.data.policy);
     * ```
     */
    async getOrgPermission(id: string): Promise<APIResponse<GetOrgPermissionPayload>> {
        return this.client.GET<GetOrgPermissionPayload>(`/iam/permission/${id}`);
    }

    /**
     * Create a new organization permission
     * 
     * Creates a new organization permission on the platform for assigning
     * access policies to users or clients within an organization.
     * 
     * @param permission - Permission data for the new permission (ID will be generated)
     * @param permission.org - Organization ID the permission applies to (required)
     * @param permission.user - User ID the permission applies to (optional)
     * @param permission.client - Client ID the permission applies to (optional)
     * @param permission.policy - Access policy ID or object (required)
     * @returns Promise that resolves to the created organization permission data
     * 
     * @example
     * ```typescript
     * const newOrgPermission = await permissions.createOrgPermission({
     *   org: 'org-123',
     *   user: 'user-456',
     *   policy: 'policy-789'
     * });
     * 
     * console.log('Created org permission ID:', newOrgPermission.data.id);
     * 
     * // Create permission for a client
     * const clientPermission = await permissions.createOrgPermission({
     *   org: 'org-123',
     *   client: 'client-789',
     *   policy: 'policy-456'
     * });
     * ```
     */
    async createOrgPermission(permission: Omit<OrgPermissionInterface, 'id'>): Promise<APIResponse<GetOrgPermissionPayload>> {
        return this.client.POST<GetOrgPermissionPayload>('/iam/permission', permission);
    }

    /**
     * Update an existing organization permission
     * 
     * Updates an organization permission with the provided data. Only the provided fields
     * will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the organization permission to update
     * @param permission - Partial permission data containing only the fields to update
     * @returns Promise that resolves to the updated organization permission data
     * 
     * @example
     * ```typescript
     * // Update permission policy
     * const updatedPermission = await permissions.updateOrgPermission('permission-123', {
     *   policy: 'new-policy-456'
     * });
     * 
     * // Update permission user
     * const updatedPermission = await permissions.updateOrgPermission('permission-123', {
     *   user: 'new-user-789'
     * });
     * ```
     */
    async updateOrgPermission(id: string, permission: Partial<OrgPermissionInterface>): Promise<APIResponse<GetOrgPermissionPayload>> {
        return this.client.PUT<GetOrgPermissionPayload>(`/iam/permission/${id}`, permission);
    }

    /**
     * Delete an organization permission
     * 
     * Removes an organization permission from the platform.
     * 
     * @param id - The unique identifier of the organization permission to delete
     * @returns Promise that resolves when the organization permission is successfully deleted
     * 
     * @example
     * ```typescript
     * await permissions.deleteOrgPermission('permission-123');
     * console.log('Organization permission deleted successfully');
     * ```
     */
    async deleteOrgPermission(id: string): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/iam/permission/${id}`);
    }

    /**
     * Get all user permissions with optional filtering and pagination
     * 
     * Retrieves a list of user permissions from the platform with support for
     * filtering by user or client, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of permissions to return
     * @param params.offset - Number of permissions to skip for pagination
     * @param params.user - Filter permissions by user ID
     * @param params.client - Filter permissions by client ID
     * @returns Promise that resolves to a paginated list of user permissions
     * 
     * @example
     * ```typescript
     * // Get all user permissions
     * const allUserPermissions = await permissions.getUserPermissions();
     * 
     * // Get permissions for specific user
     * const userPermissions = await permissions.getUserPermissions({ 
     *   user: 'user-123',
     *   limit: 20 
     * });
     * 
     * // Get permissions for specific client
     * const clientPermissions = await permissions.getUserPermissions({ 
     *   client: 'client-456' 
     * });
     * ```
     */
    async getUserPermissions(params?: {
        limit?: number;
        offset?: number;
        user?: string;
        client?: string;
    }): Promise<APIResponse<GetUserPermissionsPayload>> {
        return this.client.GET<GetUserPermissionsPayload>('/user/permission', params);
    }

    /**
     * Get a specific user permission by its ID
     * 
     * Retrieves detailed information about a single user permission from the platform.
     * 
     * @param id - The unique identifier of the user permission
     * @returns Promise that resolves to the user permission data
     * 
     * @example
     * ```typescript
     * const userPermission = await permissions.getUserPermission('permission-123');
     * console.log('User:', userPermission.data.user);
     * console.log('Client:', userPermission.data.client);
     * console.log('Policy:', userPermission.data.policy);
     * ```
     */
    async getUserPermission(id: string): Promise<APIResponse<GetUserPermissionPayload>> {
        return this.client.GET<GetUserPermissionPayload>(`/user/permission/${id}`);
    }

    /**
     * Create a new user permission
     * 
     * Creates a new user permission on the platform for assigning
     * access policies to users for specific clients.
     * 
     * @param permission - Permission data for the new permission (ID will be generated)
     * @param permission.user - User ID the permission applies to (required)
     * @param permission.client - Client ID the permission applies to (required)
     * @param permission.policy - Access policy ID or object (required)
     * @returns Promise that resolves to the created user permission data
     * 
     * @example
     * ```typescript
     * const newUserPermission = await permissions.createUserPermission({
     *   user: 'user-123',
     *   client: 'client-456',
     *   policy: 'policy-789'
     * });
     * 
     * console.log('Created user permission ID:', newUserPermission.data.id);
     * 
     * // Create permission with policy object
     * const policyPermission = await permissions.createUserPermission({
     *   user: 'user-123',
     *   client: 'client-456',
     *   policy: {
     *     name: 'Custom Policy',
     *     effect: 'allow',
     *     actions: ['read'],
     *     resources: ['apps/*']
     *   }
     * });
     * ```
     */
    async createUserPermission(permission: Omit<UserPermissionInterface, 'id'>): Promise<APIResponse<GetUserPermissionPayload>> {
        return this.client.POST<GetUserPermissionPayload>('/user/permission', permission);
    }

    /**
     * Update an existing user permission
     * 
     * Updates a user permission with the provided data. Only the provided fields
     * will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the user permission to update
     * @param permission - Partial permission data containing only the fields to update
     * @returns Promise that resolves to the updated user permission data
     * 
     * @example
     * ```typescript
     * // Update permission policy
     * const updatedPermission = await permissions.updateUserPermission('permission-123', {
     *   policy: 'new-policy-456'
     * });
     * 
     * // Update permission client
     * const updatedPermission = await permissions.updateUserPermission('permission-123', {
     *   client: 'new-client-789'
     * });
     * ```
     */
    async updateUserPermission(id: string, permission: Partial<UserPermissionInterface>): Promise<APIResponse<GetUserPermissionPayload>> {
        return this.client.PUT<GetUserPermissionPayload>(`/user/permission/${id}`, permission);
    }

    /**
     * Delete a user permission
     * 
     * Removes a user permission from the platform.
     * 
     * @param id - The unique identifier of the user permission to delete
     * @returns Promise that resolves when the user permission is successfully deleted
     * 
     * @example
     * ```typescript
     * await permissions.deleteUserPermission('permission-123');
     * console.log('User permission deleted successfully');
     * ```
     */
    async deleteUserPermission(id: string): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/user/permission/${id}`);
    }
} 