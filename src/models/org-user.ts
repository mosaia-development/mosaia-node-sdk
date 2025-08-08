import {
    AuthResponse,
    OrganizationInterface,
    OrgUserInterface,
    UserInterface
} from '../types';
import { BaseModel } from './base';
import Organization from './organization';
import User from './user';
import { MosaiaConfig } from '../types';

/**
 * OrgUser class for managing organization-user relationships
 * 
 * This class represents the relationship between a user and an organization
 * in the Mosaia platform. It manages permissions, roles, and access control
 * within organizational contexts, enabling fine-grained control over user
 * access to organizational resources.
 * 
 * Features:
 * - Permission management
 * - Role-based access control
 * - Session handling
 * - User-org relationship lifecycle
 * - Access control enforcement
 * 
 * @remarks
 * Organization-user relationships are crucial for:
 * - Multi-tenant access control
 * - Team member management
 * - Resource sharing
 * - Activity tracking
 * - Compliance and auditing
 * 
 * The class supports various permission levels:
 * - Owner: Full control over organization
 * - Admin: Administrative access
 * - Member: Standard access
 * - Guest: Limited access
 * 
 * @example
 * Basic relationship setup:
 * ```typescript
 * import { OrgUser } from 'mosaia-node-sdk';
 * 
 * // Create a new team member relationship
 * const teamMember = new OrgUser({
 *   org: 'acme-org',
 *   user: 'john-doe',
 *   permission: 'member',
 *   metadata: {
 *     department: 'engineering',
 *     role: 'developer'
 *   }
 * });
 * 
 * await teamMember.save();
 * ```
 * 
 * @example
 * Managing access and sessions:
 * ```typescript
 * // Get user and organization details
 * const user = teamMember.user;
 * const org = teamMember.org;
 * 
 * // Create an authenticated session
 * const config = await teamMember.session();
 * const mosaia = new Mosaia(config);
 * 
 * // Check access and permissions
 * if (teamMember.isActive()) {
 *   console.log(`${user.name} is active in ${org.name}`);
 *   console.log(`Permission level: ${teamMember.permission}`);
 * } else {
 *   // Remove access if needed
 *   await teamMember.disable();
 *   console.log('Access removed');
 * }
 * ```
 * 
 * @extends BaseModel<OrgUserInterface>
 * @category Models
 */
export default class OrgUser extends BaseModel<OrgUserInterface> {
    /**
     * Creates a new organization-user relationship
     * 
     * Initializes a relationship between a user and an organization with
     * specified permissions and metadata. This relationship controls the
     * user's access and capabilities within the organization.
     * 
     * @param data - Configuration data including:
     *               - org: Organization ID or data
     *               - user: User ID or data
     *               - permission: Access level ('owner', 'admin', 'member', 'guest')
     *               - metadata: Custom metadata object
     * @param uri - Optional custom URI path for the relationship endpoint
     * 
     * @example
     * Basic member setup:
     * ```typescript
     * const member = new OrgUser({
     *   org: 'acme-org',
     *   user: 'jane-doe',
     *   permission: 'member'
     * });
     * ```
     * 
     * @example
     * Admin with metadata:
     * ```typescript
     * const admin = new OrgUser({
     *   org: 'tech-corp',
     *   user: 'admin-user',
     *   permission: 'admin',
     *   metadata: {
     *     department: 'IT',
     *     role: 'system-admin',
     *     access_level: 'full',
     *     joined_date: new Date().toISOString()
     *   }
     * }, '/enterprise/org-user');
     * ```
     */
    constructor(data: Partial<OrgUserInterface>, uri?: string) {
        super(data, uri || '/org');
    }

    /**
     * Get the associated user details
     * 
     * This getter provides access to the user's details within the context
     * of the organization relationship. It returns a User instance that
     * can be used to access and manage user-specific data.
     * 
     * @returns User instance with full user details
     * @throws {Error} When user data is not available in the relationship
     * 
     * @example
     * Basic user access:
     * ```typescript
     * const user = orgUser.user;
     * console.log(`Member: ${user.name} (${user.email})`);
     * ```
     * 
     * @example
     * Detailed user information:
     * ```typescript
     * try {
     *   const user = orgUser.user;
     *   console.log('User Details:');
     *   console.log(`Name: ${user.name}`);
     *   console.log(`Email: ${user.email}`);
     *   console.log(`Status: ${user.isActive() ? 'Active' : 'Inactive'}`);
     *   console.log(`Last Login: ${user.last_login_at}`);
     * } catch (error) {
     *   console.error('User data not available:', error.message);
     * }
     * ```
     */
    get user(): User {
        if (!this.data.user) {
            throw new Error('User data not available');
        }
        return new User(this.data.user as Partial<UserInterface>);
    }

    /**
     * Set the associated user details
     * 
     * This setter updates the user details within the organization relationship.
     * It's typically used when reassigning the relationship to a different user
     * or updating user details in bulk.
     * 
     * @param data - Complete user data including:
     *               - id: User's unique identifier
     *               - name: User's full name
     *               - email: User's email address
     *               - metadata: Additional user data
     * 
     * @example
     * Basic user update:
     * ```typescript
     * orgUser.user = {
     *   id: 'user-123',
     *   name: 'Jane Smith',
     *   email: 'jane.smith@example.com'
     * };
     * ```
     * 
     * @example
     * Detailed user update:
     * ```typescript
     * orgUser.user = {
     *   id: 'user-456',
     *   name: 'John Developer',
     *   email: 'john@example.com',
     *   metadata: {
     *     title: 'Senior Developer',
     *     skills: ['typescript', 'node.js'],
     *     start_date: '2024-01-01'
     *   }
     * };
     * 
     * // Save changes
     * await orgUser.save();
     * ```
     */
    set user(data: UserInterface) {
        this.update({ user: data as any });
    }

    /**
     * Get the associated organization details
     * 
     * This getter provides access to the organization's details within the
     * context of the user relationship. It returns an Organization instance
     * that can be used to access and manage organization-specific data.
     * 
     * @returns Organization instance with full organization details
     * @throws {Error} When organization data is not available in the relationship
     * 
     * @example
     * Basic organization access:
     * ```typescript
     * const org = orgUser.org;
     * console.log(`Organization: ${org.name}`);
     * console.log(`Description: ${org.short_description}`);
     * ```
     * 
     * @example
     * Detailed organization information:
     * ```typescript
     * try {
     *   const org = orgUser.org;
     *   console.log('Organization Details:');
     *   console.log(`Name: ${org.name}`);
     *   console.log(`Description: ${org.short_description}`);
     *   console.log(`Status: ${org.isActive() ? 'Active' : 'Inactive'}`);
     *   console.log(`Members: ${org.member_count}`);
     *   
     *   if (org.metadata?.industry) {
     *     console.log(`Industry: ${org.metadata.industry}`);
     *   }
     * } catch (error) {
     *   console.error('Organization data not available:', error.message);
     * }
     * ```
     */
    get org(): Organization {
        if (!this.data.org) {
            throw new Error('Organization data not available');
        }
        return new Organization(this.data.org as Partial<OrganizationInterface>);
    }

    /**
     * Set the associated organization details
     * 
     * This setter updates the organization details within the user relationship.
     * It's typically used when reassigning the relationship to a different
     * organization or updating organization details in bulk.
     * 
     * @param data - Complete organization data including:
     *               - id: Organization's unique identifier
     *               - name: Organization name
     *               - short_description: Brief description
     *               - metadata: Additional organization data
     * 
     * @example
     * Basic organization update:
     * ```typescript
     * orgUser.org = {
     *   id: 'org-123',
     *   name: 'Acme Corporation',
     *   short_description: 'Leading tech company'
     * };
     * ```
     * 
     * @example
     * Detailed organization update:
     * ```typescript
     * orgUser.org = {
     *   id: 'org-456',
     *   name: 'Tech Innovators',
     *   short_description: 'AI and ML solutions',
     *   long_description: 'Cutting-edge AI/ML solutions for enterprises',
     *   metadata: {
     *     industry: 'technology',
     *     size: 'enterprise',
     *     founded: '2020',
     *     locations: ['San Francisco', 'London']
     *   }
     * };
     * 
     * // Save changes
     * await orgUser.save();
     * ```
     */
    set org(data: OrganizationInterface) {
        this.update({ org: data as any });
    }

    /**
     * Create an authenticated session for the organization user
     * 
     * This method creates a new authenticated session for the user within
     * the organization context. The session includes access tokens and
     * configuration needed to interact with organization resources.
     * 
     * The method:
     * 1. Validates the relationship is active
     * 2. Requests new access tokens
     * 3. Creates a configured session
     * 
     * @returns Promise resolving to MosaiaConfig with session details
     * @throws {Error} When session creation fails
     * @throws {Error} When relationship is inactive
     * @throws {Error} When network errors occur
     * 
     * @example
     * Basic session creation:
     * ```typescript
     * try {
     *   const config = await orgUser.session();
     *   const mosaia = new Mosaia(config);
     *   
     *   // Use the authenticated session
     *   const agents = await mosaia.agents.get();
     *   console.log(`Found ${agents.length} agents`);
     * } catch (error) {
     *   console.error('Session failed:', error.message);
     * }
     * ```
     * 
     * @example
     * Advanced session usage:
     * ```typescript
     * try {
     *   // Create authenticated session
     *   const config = await orgUser.session();
     *   const mosaia = new Mosaia(config);
     *   
     *   // Access organization resources
     *   const [agents, models, apps] = await Promise.all([
     *     mosaia.agents.get(),
     *     mosaia.models.get(),
     *     mosaia.apps.get()
     *   ]);
     *   
     *   console.log('Organization Resources:');
     *   console.log(`- ${agents.length} AI agents`);
     *   console.log(`- ${models.length} models`);
     *   console.log(`- ${apps.length} applications`);
     * } catch (error) {
     *   if (error.message.includes('inactive')) {
     *     console.error('User access is inactive');
     *   } else if (error.message.includes('unauthorized')) {
     *     console.error('Invalid permissions');
     *   } else {
     *     console.error('Session error:', error.message);
     *   }
     * }
     * ```
     */
    async session(): Promise<MosaiaConfig> {
        try {
            const {
                data,
                error
            } = await this.apiClient.GET<AuthResponse>(`${this.uri}/session`);

            if (error) {
                throw new Error(error.message);
            }

            return Promise.resolve({
                ...this.config,
                apiKey: data.access_token,
                session: data
            });
        } catch (error) {
            console.log('error:', error);
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Disable the organization-user relationship
     * 
     * This method deactivates the relationship between the user and organization,
     * effectively revoking the user's access to organization resources. This is
     * useful for:
     * - Removing team members
     * - Revoking access temporarily
     * - Managing user offboarding
     * 
     * The method:
     * 1. Validates the relationship exists
     * 2. Sends deactivation request
     * 3. Clears local session data
     * 
     * @returns Promise resolving when relationship is disabled
     * @throws {Error} When disable operation fails
     * @throws {Error} When relationship doesn't exist
     * @throws {Error} When network errors occur
     * 
     * @example
     * Basic deactivation:
     * ```typescript
     * try {
     *   await orgUser.disable();
     *   console.log('User access revoked successfully');
     * } catch (error) {
     *   console.error('Failed to revoke access:', error.message);
     * }
     * ```
     * 
     * @example
     * Managed offboarding:
     * ```typescript
     * async function offboardUser(orgUser: OrgUser): Promise<void> {
     *   try {
     *     // Get user details for logging
     *     const user = orgUser.user;
     *     const org = orgUser.org;
     *     
     *     // Revoke access
     *     await orgUser.disable();
     *     
     *     console.log('User offboarded successfully:');
     *     console.log(`- User: ${user.name} (${user.email})`);
     *     console.log(`- From: ${org.name}`);
     *     console.log(`- Time: ${new Date().toISOString()}`);
     *   } catch (error) {
     *     console.error('Offboarding failed:', error.message);
     *     throw error; // Re-throw for handling by caller
     *   }
     * }
     * ```
     */
    async disable(): Promise<void> {
        try {
            const { error } = await this.apiClient.DELETE<void>(`${this.getUri()}`);

            if (error) {
                throw new Error(error.message);
            }
            return Promise.resolve();
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }
}