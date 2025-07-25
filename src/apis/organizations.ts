import APIClient from './api-client';
import { MosiaConfig, OrganizationInterface, GetOrgsPayload, GetOrgPayload, APIResponse } from '../types';

/**
 * Organizations API client for managing organizations
 * 
 * This class provides methods for creating, reading, updating, and deleting
 * organizations on the Mosaia platform. Organizations can contain multiple
 * users, applications, and other resources.
 * 
 * @example
 * ```typescript
 * const organizations = new Organizations(config);
 * 
 * // Get all organizations
 * const allOrgs = await organizations.getAll();
 * 
 * // Get specific organization
 * const org = await organizations.getById('org-id');
 * 
 * // Create new organization
 * const newOrg = await organizations.create({
 *   name: 'My Organization',
 *   short_description: 'Description'
 * });
 * ```
 */
export default class Organizations {
    private client: APIClient;

    /**
     * Creates a new Organizations API client instance
     * 
     * @param config - Configuration object containing API settings
     */
    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all organizations with optional filtering and pagination
     * 
     * Retrieves a list of organizations from the platform with support for
     * filtering, searching, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of organizations to return
     * @param params.offset - Number of organizations to skip for pagination
     * @param params.search - Search term to filter organizations by name
     * @param params.active - Filter by active status (true/false)
     * @returns Promise that resolves to a paginated list of organizations
     * 
     * @example
     * ```typescript
     * // Get all organizations
     * const allOrgs = await organizations.getAll();
     * 
     * // Get first 10 active organizations
     * const activeOrgs = await organizations.getAll({ 
     *   limit: 10, 
     *   offset: 0, 
     *   active: true 
     * });
     * 
     * // Search for organizations
     * const searchResults = await organizations.getAll({ 
     *   search: 'tech',
     *   limit: 20 
     * });
     * ```
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
     * Get a specific organization by its ID
     * 
     * Retrieves detailed information about a single organization from the platform.
     * 
     * @param id - The unique identifier of the organization
     * @returns Promise that resolves to the organization data
     * 
     * @example
     * ```typescript
     * const org = await organizations.getById('org-123');
     * console.log('Organization name:', org.data.name);
     * console.log('Description:', org.data.short_description);
     * ```
     */
    async getById(id: string): Promise<APIResponse<GetOrgPayload>> {
        return this.client.GET<GetOrgPayload>(`/org/${id}`);
    }

    /**
     * Create a new organization
     * 
     * Creates a new organization on the platform with the provided information.
     * 
     * @param org - Organization data for the new organization (ID will be generated)
     * @param org.name - Organization name (required)
     * @param org.short_description - Brief description of the organization
     * @param org.long_description - Detailed description of the organization
     * @param org.image - URL to organization's logo/image
     * @returns Promise that resolves to the created organization data
     * 
     * @example
     * ```typescript
     * const newOrg = await organizations.create({
     *   name: 'Acme Corporation',
     *   short_description: 'Leading technology company',
     *   long_description: 'Acme Corporation is a leading technology company...',
     *   image: 'https://example.com/logo.png'
     * });
     * 
     * console.log('Created organization ID:', newOrg.data.id);
     * ```
     */
    async create(org: Omit<OrganizationInterface, 'id'>): Promise<APIResponse<GetOrgPayload>> {
        return this.client.POST<GetOrgPayload>('/org', org);
    }

    /**
     * Update an existing organization
     * 
     * Updates the information for an existing organization. Only the provided
     * fields will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the organization to update
     * @param org - Partial organization data containing only the fields to update
     * @returns Promise that resolves to the updated organization data
     * 
     * @example
     * ```typescript
     * // Update organization name
     * const updatedOrg = await organizations.update('org-123', {
     *   name: 'Updated Organization Name'
     * });
     * 
     * // Update organization description
     * const updatedOrg = await organizations.update('org-123', {
     *   short_description: 'Updated description'
     * });
     * 
     * // Deactivate organization
     * const updatedOrg = await organizations.update('org-123', {
     *   active: false
     * });
     * ```
     */
    async update(id: string, org: Partial<OrganizationInterface>): Promise<APIResponse<GetOrgPayload>> {
        return this.client.PUT<GetOrgPayload>(`/org/${id}`, org);
    }

    /**
     * Delete an organization
     * 
     * Removes an organization from the platform. By default, this performs a soft delete
     * (marks the organization as inactive). Use the force parameter for hard deletion.
     * 
     * @param id - The unique identifier of the organization to delete
     * @param params - Optional parameters for deletion behavior
     * @param params.force - If true, performs a hard delete instead of soft delete
     * @returns Promise that resolves when the organization is successfully deleted
     * 
     * @example
     * ```typescript
     * // Soft delete (mark as inactive)
     * await organizations.delete('org-123');
     * 
     * // Hard delete (permanently remove)
     * await organizations.delete('org-123', { force: true });
     * ```
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/org/${id}`, params);
    }

    /**
     * Upload a profile image for an organization
     * 
     * Uploads a profile image file for a specific organization. This method is currently
     * a placeholder and will throw an error indicating that file upload functionality
     * is not yet implemented.
     * 
     * @param id - The unique identifier of the organization
     * @param file - The image file to upload
     * @returns Promise that resolves to the updated organization data
     * @throws {Error} When file upload functionality is not implemented
     * 
     * @example
     * ```typescript
     * // This method is not yet implemented
     * try {
     *   const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     *   const file = fileInput.files[0];
     *   const updatedOrg = await organizations.uploadProfileImage('org-123', file);
     * } catch (error) {
     *   console.log('File upload not yet supported');
     * }
     * ```
     */
    async uploadProfileImage(id: string, file: File): Promise<APIResponse<GetOrgPayload>> {
        const formData = new FormData();
        formData.append('file', file);
        
        // Note: This would need to be implemented with proper file upload handling
        // For now, returning a placeholder
        throw new Error('File upload not implemented in this version');
    }
} 