import {
    AccessPolicyInterface,
    GetAccessPoliciesPayload,
    GetAccessPolicyPayload
} from '../types';
import { AccessPolicy } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Access Policies API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing access control policies in the Mosaia platform.
 * Access policies define fine-grained permissions for resources and actions, implementing
 * role-based access control (RBAC) with support for allow/deny effects.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve access policies with filtering and pagination
 * - Create new access control policies
 * - Update existing policy configurations
 * - Delete access policies
 * - Manage policy effects (allow/deny)
 * - Handle action and resource definitions
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const accessPolicies = mosaia.accessPolicies;
 * 
 * // Get all access policies
 * const allPolicies = await accessPolicies.get();
 * 
 * // Get a specific access policy
 * const policy = await accessPolicies.get({}, 'policy-id');
 * 
 * // Create a new access policy
 * const newPolicy = await accessPolicies.create({
 *   name: 'Admin Access',
 *   effect: 'allow',
 *   actions: ['users:read', 'users:write'],
 *   resources: ['users', 'organizations']
 * });
 * ```
 * 
 * @extends BaseCollection<AccessPolicyInterface, AccessPolicy, GetAccessPoliciesPayload, GetAccessPolicyPayload>
 */
export default class AccessPolicies extends BaseCollection<
    AccessPolicyInterface,
    AccessPolicy,
    GetAccessPoliciesPayload,
    GetAccessPolicyPayload
> {
    /**
     * Creates a new Access Policies API client instance
     * 
     * Initializes the access policies client with the appropriate endpoint URI
     * and model class for handling access policy operations.
     * 
     * The constructor sets up the API endpoint to `/iam/policy` (or `${uri}/iam/policy` if a base URI is provided),
     * which corresponds to the Mosaia API's access policies endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/iam/policy`.
     *              If not provided, defaults to `/iam/policy`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/iam/policy)
     * const accessPolicies = new AccessPolicies();
     * 
     * // Create with custom base URI (e.g., for org-scoped access)
     * const accessPolicies = new AccessPolicies('/org/org-id');
     * // This will use endpoint: /org/org-id/iam/policy
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/iam/policy`, AccessPolicy);
    }
}

