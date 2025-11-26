import {
    OrgPermissionInterface,
    GetOrgPermissionsPayload,
    GetOrgPermissionPayload
} from '../types';
import { OrgPermission } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Org Permissions API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing organization-level permissions in the Mosaia platform.
 * Org permissions associate users, agents, or clients with access policies within an organization,
 * enabling fine-grained access control at the organization level.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve organization permissions with filtering and pagination
 * - Create new organization permissions
 * - Update existing permission configurations
 * - Delete organization permissions
 * - Manage user, agent, and client associations
 * - Handle policy-based access control
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const orgPermissions = mosaia.orgPermissions;
 * 
 * // Get all organization permissions
 * const allPermissions = await orgPermissions.get();
 * 
 * // Get a specific organization permission
 * const permission = await orgPermissions.get({}, 'permission-id');
 * 
 * // Create a new organization permission
 * const newPermission = await orgPermissions.create({
 *   org: 'org-id',
 *   user: 'user-id',
 *   policy: 'policy-id'
 * });
 * ```
 * 
 * @extends BaseCollection<OrgPermissionInterface, OrgPermission, GetOrgPermissionsPayload, GetOrgPermissionPayload>
 */
export default class OrgPermissions extends BaseCollection<
    OrgPermissionInterface,
    OrgPermission,
    GetOrgPermissionsPayload,
    GetOrgPermissionPayload
> {
    /**
     * Creates a new Org Permissions API client instance
     * 
     * Initializes the organization permissions client with the appropriate endpoint URI
     * and model class for handling permission operations.
     * 
     * The constructor sets up the API endpoint to `/iam/permission` (or `${uri}/iam/permission` if a base URI is provided),
     * which corresponds to the Mosaia API's organization permissions endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/iam/permission`.
     *              If not provided, defaults to `/iam/permission`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/iam/permission)
     * const orgPermissions = new OrgPermissions();
     * 
     * // Create with custom base URI (e.g., for org-scoped access)
     * const orgPermissions = new OrgPermissions('/org/org-id');
     * // This will use endpoint: /org/org-id/iam/permission
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/iam/permission`, OrgPermission);
    }
}

