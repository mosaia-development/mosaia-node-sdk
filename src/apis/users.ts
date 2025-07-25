import APIClient from './api-client';
import { MosiaConfig, UserInterface, GetUsersPayload, GetUserPayload, APIResponse } from '../types';

/**
 * Users API client for managing user accounts
 * 
 * This class provides methods for creating, reading, updating, and deleting user accounts
 * on the Mosaia platform. It supports user management operations including profile
 * management, session handling, and user-specific functionality.
 * 
 * @example
 * ```typescript
 * const users = new Users(config);
 * 
 * // Get all users with pagination
 * const allUsers = await users.getAll({ limit: 10, offset: 0 });
 * 
 * // Get specific user
 * const user = await users.getById('user-id');
 * 
 * // Create new user
 * const newUser = await users.create({
 *   email: 'user@example.com',
 *   first_name: 'John',
 *   last_name: 'Doe'
 * });
 * ```
 */
export default class Users {
    private client: APIClient;

    /**
     * Creates a new Users API client instance
     * 
     * @param config - Configuration object containing API settings
     */
    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all users with optional filtering and pagination
     * 
     * Retrieves a list of users from the platform with support for filtering,
     * searching, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of users to return (default: API default)
     * @param params.offset - Number of users to skip for pagination (default: 0)
     * @param params.search - Search term to filter users by name or email
     * @param params.active - Filter by active status (true/false)
     * @returns Promise that resolves to a paginated list of users
     * 
     * @example
     * ```typescript
     * // Get all users
     * const allUsers = await users.getAll();
     * 
     * // Get first 10 active users
     * const activeUsers = await users.getAll({ 
     *   limit: 10, 
     *   offset: 0, 
     *   active: true 
     * });
     * 
     * // Search for users by name or email
     * const searchResults = await users.getAll({ 
     *   search: 'john',
     *   limit: 20 
     * });
     * ```
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
     * Get a specific user by their ID
     * 
     * Retrieves detailed information about a single user from the platform.
     * 
     * @param id - The unique identifier of the user
     * @returns Promise that resolves to the user data
     * 
     * @example
     * ```typescript
     * const user = await users.getById('user-123');
     * console.log('User name:', user.data.first_name, user.data.last_name);
     * console.log('User email:', user.data.email);
     * ```
     */
    async getById(id: string): Promise<APIResponse<GetUserPayload>> {
        return this.client.GET<GetUserPayload>(`/user/${id}`);
    }

    /**
     * Create a new user account
     * 
     * Creates a new user account on the platform with the provided information.
     * 
     * @param user - User data for the new account (ID is automatically generated)
     * @param user.email - Email address for the user (required)
     * @param user.first_name - User's first name (optional)
     * @param user.last_name - User's last name (optional)
     * @param user.org - Organization ID to associate with the user (optional)
     * @param user.active - Whether the user account is active (optional, default: true)
     * @returns Promise that resolves to the created user data
     * 
     * @example
     * ```typescript
     * const newUser = await users.create({
     *   email: 'john.doe@example.com',
     *   first_name: 'John',
     *   last_name: 'Doe',
     *   org: 'org-123',
     *   active: true
     * });
     * 
     * console.log('Created user ID:', newUser.data.id);
     * ```
     */
    async create(user: Omit<UserInterface, 'id'>): Promise<APIResponse<GetUserPayload>> {
        return this.client.POST<GetUserPayload>('/user', user);
    }

    /**
     * Update an existing user account
     * 
     * Updates the information for an existing user account. Only the provided
     * fields will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the user to update
     * @param user - Partial user data containing only the fields to update
     * @returns Promise that resolves to the updated user data
     * 
     * @example
     * ```typescript
     * // Update user's name
     * const updatedUser = await users.update('user-123', {
     *   first_name: 'Jane',
     *   last_name: 'Smith'
     * });
     * 
     * // Update user's organization
     * const updatedUser = await users.update('user-123', {
     *   org: 'new-org-456'
     * });
     * 
     * // Deactivate user account
     * const updatedUser = await users.update('user-123', {
     *   active: false
     * });
     * ```
     */
    async update(id: string, user: Partial<UserInterface>): Promise<APIResponse<GetUserPayload>> {
        return this.client.PUT<GetUserPayload>(`/user/${id}`, user);
    }

    /**
     * Delete a user account
     * 
     * Removes a user account from the platform. By default, this performs a soft delete
     * (marks the user as inactive). Use the force parameter for hard deletion.
     * 
     * @param id - The unique identifier of the user to delete
     * @param params - Optional parameters for deletion behavior
     * @param params.force - If true, performs a hard delete instead of soft delete (default: false)
     * @returns Promise that resolves when the user is successfully deleted
     * 
     * @example
     * ```typescript
     * // Soft delete (mark as inactive)
     * await users.delete('user-123');
     * 
     * // Hard delete (permanently remove)
     * await users.delete('user-123', { force: true });
     * ```
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/user/${id}`, params);
    }

    /**
     * Get a session token for a user
     * 
     * Generates a session token for a specific user, which can be used for
     * authentication in subsequent API calls.
     * 
     * @param id - The unique identifier of the user
     * @returns Promise that resolves to an object containing the session token
     * 
     * @example
     * ```typescript
     * const session = await users.getSession('user-123');
     * console.log('Session token:', session.data.token);
     * 
     * // Use the token for authenticated requests
     * const authenticatedClient = new APIClient({
     *   ...config,
     *   apiKey: session.data.token
     * });
     * ```
     */
    async getSession(id: string): Promise<APIResponse<{ token: string }>> {
        return this.client.GET<{ token: string }>(`/user/${id}/session`);
    }

    /**
     * Upload a profile image for a user
     * 
     * Uploads a profile image file for a specific user. This method is currently
     * a placeholder and will throw an error indicating that file upload functionality
     * is not yet implemented.
     * 
     * @param id - The unique identifier of the user
     * @param file - The image file to upload
     * @returns Promise that resolves to the updated user data
     * @throws {Error} When file upload functionality is not implemented
     * 
     * @example
     * ```typescript
     * // This method is not yet implemented
     * try {
     *   const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     *   const file = fileInput.files[0];
     *   const updatedUser = await users.uploadProfileImage('user-123', file);
     * } catch (error) {
     *   console.log('File upload not yet supported');
     * }
     * ```
     */
    async uploadProfileImage(id: string, file: File): Promise<APIResponse<GetUserPayload>> {
        const formData = new FormData();
        formData.append('file', file);
        
        // Note: This would need to be implemented with proper file upload handling
        // For now, returning a placeholder
        throw new Error('File upload not implemented in this version');
    }
} 