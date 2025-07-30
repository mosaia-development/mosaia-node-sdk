import {
    UserInterface,
    GetUsersPayload,
    GetUserPayload
} from '../types';
import { User } from '../models';
import { BaseAPI } from './base-api';

/**
 * Users API client for managing user accounts
 * 
 * This class provides methods for creating, reading, updating, and deleting
 * user accounts on the Mosaia platform. Users can be associated with
 * organizations and have various profile information.
 * 
 * @example
 * ```typescript
 * const users = new Users();
 * 
 * // Get all users
 * const allUsers = await users.getAll();
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
 * 
 * // Update user
 * const updatedUser = await users.update('user-id', {
 *   first_name: 'Jane'
 * });
 * 
 * // Delete user
 * await users.delete('user-id');
 * ```
 */
export default class Users extends BaseAPI<
    UserInterface,
    User,
    GetUsersPayload,
    GetUserPayload
> {
    constructor() {
        super('/user', User);
    }

    /**
     * Get user session
     * 
     * @param id - User ID to get session for
     * @returns Promise that resolves to session data
     */
    async getSession(id: string): Promise<{ token: string }> {
        const response = await this.client.GET<{ data: { token: string } }>(`${this.uri}/${id}/session`);
        if (!response || !response.data) {
            throw new Error('Invalid response from API');
        }
        return response.data.data;
    }
} 