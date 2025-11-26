import { OrgPermissionInterface } from '../types';
import { BaseModel } from './base';

/**
 * OrgPermission class for managing organization-level permissions
 * 
 * This class represents an organization-level permission in the Mosaia platform, which
 * associates users, agents, or clients with access policies within an organization.
 * OrgPermissions enable fine-grained access control at the organization level.
 * 
 * Features:
 * - Organization-scoped permissions
 * - User, agent, and client associations
 * - Policy-based access control
 * - Permission lifecycle management
 * 
 * @remarks
 * Organization permissions are crucial for:
 * - Team member access control
 * - Resource sharing within organizations
 * - Multi-tenant access management
 * - Compliance and auditing
 * - Role-based access control
 * 
 * @example
 * Basic permission creation:
 * ```typescript
 * import { OrgPermission } from 'mosaia-node-sdk';
 * 
 * // Create a permission for a user
 * const permission = new OrgPermission({
 *   org: 'org-id',
 *   user: 'user-id',
 *   policy: 'policy-id'
 * });
 * 
 * await permission.save();
 * ```
 * 
 * @example
 * Permission for a client:
 * ```typescript
 * // Create a permission for a client
 * const clientPermission = new OrgPermission({
 *   org: 'org-id',
 *   client: 'client-id',
 *   policy: 'policy-id'
 * });
 * 
 * await clientPermission.save();
 * ```
 * 
 * @extends BaseModel<OrgPermissionInterface>
 * @category Models
 */
export default class OrgPermission extends BaseModel<OrgPermissionInterface> {
    /**
     * Creates a new OrgPermission instance
     * 
     * Initializes an organization-level permission with the provided configuration data.
     * Permissions associate users, agents, or clients with access policies within an organization.
     * 
     * @param data - Configuration data including:
     *               - org: Organization ID
     *               - user: User ID (optional, if associating with a user)
     *               - client: Client ID (optional, if associating with a client)
     *               - policy: Access policy ID or object
     * @param uri - Optional custom URI path for the permission endpoint
     * 
     * @example
     * User permission:
     * ```typescript
     * const permission = new OrgPermission({
     *   org: 'org-123',
     *   user: 'user-456',
     *   policy: 'policy-789'
     * });
     * ```
     * 
     * @example
     * Client permission:
     * ```typescript
     * const permission = new OrgPermission({
     *   org: 'org-123',
     *   client: 'client-456',
     *   policy: 'policy-789'
     * }, '/org/iam/permission');
     * ```
     */
    constructor(data: Partial<OrgPermissionInterface>, uri?: string) {
        super(data, uri || '/iam/permission');
    }
}

