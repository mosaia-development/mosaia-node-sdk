import { UserPermissionInterface } from '../types';
import { BaseModel } from './base';

/**
 * UserPermission class for managing user-level permissions
 * 
 * This class represents a user-level permission in the Mosaia platform, which
 * associates clients with access policies for a specific user. UserPermissions
 * enable fine-grained access control at the user level.
 * 
 * Features:
 * - User-scoped permissions
 * - Client associations
 * - Policy-based access control
 * - Permission lifecycle management
 * 
 * @remarks
 * User permissions are crucial for:
 * - Client access control
 * - User-specific resource access
 * - OAuth client permissions
 * - API access management
 * - Compliance and auditing
 * 
 * @example
 * Basic permission creation:
 * ```typescript
 * import { UserPermission } from 'mosaia-node-sdk';
 * 
 * // Create a permission for a client
 * const permission = new UserPermission({
 *   user: 'user-id',
 *   client: 'client-id',
 *   policy: 'policy-id'
 * });
 * 
 * await permission.save();
 * ```
 * 
 * @extends BaseModel<UserPermissionInterface>
 * @category Models
 */
export default class UserPermission extends BaseModel<UserPermissionInterface> {
    /**
     * Creates a new UserPermission instance
     * 
     * Initializes a user-level permission with the provided configuration data.
     * Permissions associate clients with access policies for a specific user.
     * 
     * @param data - Configuration data including:
     *               - user: User ID
     *               - client: Client ID
     *               - policy: Access policy ID or object
     * @param uri - Optional custom URI path for the permission endpoint
     * 
     * @example
     * Basic permission:
     * ```typescript
     * const permission = new UserPermission({
     *   user: 'user-123',
     *   client: 'client-456',
     *   policy: 'policy-789'
     * });
     * ```
     */
    constructor(data: Partial<UserPermissionInterface>, uri?: string) {
        super(data, uri || '/iam/permission');
    }
}

