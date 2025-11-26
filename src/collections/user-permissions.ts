import {
    UserPermissionInterface,
    GetUserPermissionsPayload,
    GetUserPermissionPayload
} from '../types';
import { UserPermission } from '../models';
import { BaseCollection } from './base-collection';

/**
 * User Permissions API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing user-level permissions in the Mosaia platform.
 * User permissions associate clients with access policies for a specific user, enabling
 * fine-grained access control at the user level.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve user permissions with filtering and pagination
 * - Create new user permissions
 * - Update existing permission configurations
 * - Delete user permissions
 * - Manage client associations
 * - Handle policy-based access control
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const userPermissions = mosaia.userPermissions;
 * 
 * // Get all user permissions
 * const allPermissions = await userPermissions.get();
 * 
 * // Get a specific user permission
 * const permission = await userPermissions.get({}, 'permission-id');
 * 
 * // Create a new user permission
 * const newPermission = await userPermissions.create({
 *   user: 'user-id',
 *   client: 'client-id',
 *   policy: 'policy-id'
 * });
 * ```
 * 
 * @extends BaseCollection<UserPermissionInterface, UserPermission, GetUserPermissionsPayload, GetUserPermissionPayload>
 */
export default class UserPermissions extends BaseCollection<
    UserPermissionInterface,
    UserPermission,
    GetUserPermissionsPayload,
    GetUserPermissionPayload
> {
    /**
     * Creates a new User Permissions API client instance
     * 
     * Initializes the user permissions client with the appropriate endpoint URI
     * and model class for handling permission operations.
     * 
     * The constructor sets up the API endpoint to `/iam/permission` (or `${uri}/iam/permission` if a base URI is provided),
     * which corresponds to the Mosaia API's user permissions endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/iam/permission`.
     *              If not provided, defaults to `/iam/permission`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/iam/permission)
     * const userPermissions = new UserPermissions();
     * 
     * // Create with custom base URI (e.g., for user-scoped access)
     * const userPermissions = new UserPermissions('/user/user-id');
     * // This will use endpoint: /user/user-id/iam/permission
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/iam/permission`, UserPermission);
    }
}

