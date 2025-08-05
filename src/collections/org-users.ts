import {
    OrgUserInterface,
    GetOrgUsersPayload,
    GetOrgUserPayload
} from '../types';
import { OrgUser } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Organization Users API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing organization user relationships in the Mosaia platform.
 * Organization users represent the relationship between users and organizations,
 * including permissions, roles, and access control within organizational contexts.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve organization user relationships with filtering and pagination
 * - Create new organization user associations
 * - Update existing organization user permissions and settings
 * - Delete organization user relationships
 * - Manage user permissions within organizations
 * - Handle organization-specific user configurations
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const orgUsers = mosaia.orgUsers;
 * 
 * // Get all organization users
 * const allOrgUsers = await orgUsers.get();
 * 
 * // Get a specific organization user relationship
 * const orgUser = await orgUsers.get({}, 'org-user-id');
 * 
 * // Create a new organization user relationship
 * const newOrgUser = await orgUsers.create({
 *   org: 'org-id',
 *   user: 'user-id',
 *   permission: 'admin'
 * });
 * ```
 * 
  * @extends BaseCollection<OrgUserInterface, OrgUser, GetOrgUsersPayload, GetOrgUserPayload>
 */
export default class OrgUsers extends BaseCollection<
    OrgUserInterface,
    OrgUser,
    GetOrgUsersPayload,
    GetOrgUserPayload
> {
    /**
     * Creates a new Organization Users API client instance
     * 
     * Initializes the organization users client with the appropriate endpoint URI
     * and model class for handling organization user operations.
     * 
     * The constructor sets up the API endpoint based on the provided parameters:
     * - If only `uri` is provided: `${uri}/user`
     * - If both `uri` and `endpoint` are provided: `${uri}${endpoint}`
     * 
     * The endpoint parameter allows for flexible routing depending on the context:
     * - Use `/user` for organization parents (getting users within an org)
     * - Use `/org` for user parents (getting orgs for a user)
     * 
     * @param uri - Optional base URI path. If provided, will be prepended to the endpoint.
     * @param endpoint - Optional endpoint path. If provided, the endpoint will be `${uri}${endpoint}`.
     *                   Should be `/user` for org parents and `/org` for user parents.
     *                   Defaults to `/user` if not provided.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/user)
     * const orgUsers = new OrgUsers();
     * 
     * // Create with custom base URI
     * const orgUsers = new OrgUsers('/api/v1');
     * // This will use endpoint: /api/v1/user
     * 
     * // Create with custom endpoint for org context
     * const orgUsers = new OrgUsers('/api/v1', '/org');
     * // This will use endpoint: /api/v1/org
     * ```
     */
    constructor(uri = '', endpoint = '/user') {
        super(`${uri}${endpoint}`, OrgUser);
    }
}