import {
    GetUsersPayload,
    GetUserPayload,
    UserInterface,
} from '../types';
import { User } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Users API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing user accounts in the Mosaia platform.
 * Users represent individual accounts that can access the platform, manage
 * resources, and interact with AI agents and applications.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve users with filtering and pagination
 * - Create new user accounts
 * - Update existing user profiles and settings
 * - Delete user accounts
 * - Manage user metadata and preferences
 * - Handle user-specific configurations and permissions
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const users = mosaia.users;
 * 
 * // Get all users
 * const allUsers = await users.get();
 * 
 * // Get a specific user
 * const user = await users.get({}, 'user-id');
 * 
 * // Create a new user
 * const newUser = await users.create({
 *   username: 'john_doe',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   description: 'Software developer'
 * });
 * ```
 * 
 * @extends BaseCollection<UserInterface, User, GetUsersPayload, GetUserPayload>
 */
export default class Users extends BaseCollection<
    UserInterface,
    User,
    GetUsersPayload,
    GetUserPayload
> {
    /**
     * Creates a new Users API client instance
     * 
     * Initializes the users client with the appropriate endpoint URI
     * and model class for handling user operations.
     * 
     * The constructor sets up the API endpoint to `/user` (or `${uri}/user` if a base URI is provided),
     * which corresponds to the Mosaia API's users endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/user`.
     *              If not provided, defaults to `/user`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/user)
     * const users = new Users();
     * 
     * // Create with custom base URI
     * const users = new Users('/api/v1');
     * // This will use endpoint: /api/v1/user
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/user`, User);
    }
}