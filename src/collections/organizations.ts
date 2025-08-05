import {
    OrganizationInterface,
    GetOrgsPayload,
    GetOrgPayload
} from '../types';
import { Organization } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Organizations API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing organizations in the Mosaia platform.
 * Organizations are containers for grouping users, applications, and resources,
 * enabling team collaboration and resource management at scale.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve organizations with filtering and pagination
 * - Create new organizations
 * - Update existing organization settings and properties
 * - Delete organizations
 * - Manage organization metadata and configurations
 * - Handle organization-specific permissions and access control
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const organizations = mosaia.organizations;
 * 
 * // Get all organizations
 * const allOrgs = await organizations.get();
 * 
 * // Get a specific organization
 * const org = await organizations.get({}, 'org-id');
 * 
 * // Create a new organization
 * const newOrg = await organizations.create({
 *   name: 'Acme Corporation',
 *   short_description: 'Leading technology company',
 *   long_description: 'A comprehensive technology company specializing in AI solutions',
 *   image: 'https://example.com/logo.png'
 * });
 * ```
 * 
 * @extends BaseCollection<OrganizationInterface, Organization, GetOrgsPayload, GetOrgPayload>
 */
export default class Organizations extends BaseCollection<
    OrganizationInterface,
    Organization,
    GetOrgsPayload,    
    GetOrgPayload
> {
    /**
     * Creates a new Organizations API client instance
     * 
     * Initializes the organizations client with the appropriate endpoint URI
     * and model class for handling organization operations.
     * 
     * The constructor sets up the API endpoint to `/org` (or `${uri}/org` if a base URI is provided),
     * which corresponds to the Mosaia API's organizations endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/org`.
     *              If not provided, defaults to `/org`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/org)
     * const organizations = new Organizations();
     * 
     * // Create with custom base URI
     * const organizations = new Organizations('/api/v1');
     * // This will use endpoint: /api/v1/org
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/org`, Organization);
    }
}