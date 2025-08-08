import {
    SessionInterface,
    UserInterface,
    OrganizationInterface,
    OrgUserInterface,
    ClientInterface,
    SessionPermissionsInterface
} from '../types';
import { BaseModel } from './base';
import User from './user';
import Organization from './organization';
import OrgUser from './org-user';
import Client from './client';

/**
 * Session class for managing authenticated contexts
 * 
 * This class represents an authenticated session in the Mosaia platform.
 * It manages the current context including user identity, organization
 * membership, client information, and permissions.
 * 
 * Features:
 * - Identity management
 * - Context switching
 * - Permission tracking
 * - Relationship access
 * - Client authentication
 * 
 * @remarks
 * Sessions provide access to:
 * - Current user profile
 * - Active organization
 * - Organization membership
 * - OAuth client context
 * - Permission scopes
 * 
 * The session maintains the active context for:
 * - API requests
 * - Resource access
 * - Permission checks
 * - Identity verification
 * 
 * @example
 * Basic session usage:
 * ```typescript
 * import { Session } from 'mosaia-node-sdk';
 * 
 * // Create authenticated session
 * const session = new Session({
 *   user: {
 *     id: 'user-123',
 *     name: 'John Developer',
 *     email: 'john@example.com'
 *   },
 *   org: {
 *     id: 'org-456',
 *     name: 'Tech Corp'
 *   }
 * });
 * 
 * // Access session context
 * const user = session.user;
 * const org = session.org;
 * 
 * console.log(`${user.name} @ ${org.name}`);
 * ```
 * 
 * @example
 * Permission checking:
 * ```typescript
 * // Check access and permissions
 * const perms = session.permissions;
 * if (perms?.canManageUsers) {
 *   // Add team member
 *   const orgUser = session.orgUser;
 *   await orgUser.orgs.create({
 *     user: 'new-user',
 *     permission: 'member'
 *   });
 * }
 * 
 * // Switch organization context
 * session.org = newOrg;
 * session.orgUser = newOrgUser;
 * 
 * // Verify client
 * const client = session.client;
 * if (client?.isActive()) {
 *   console.log('Client authenticated');
 *   console.log('Scopes:', client.scopes);
 * }
 * ```
 * 
 * @extends BaseModel<SessionInterface>
 * @category Models
 */
export default class Session extends BaseModel<SessionInterface> {
    /**
     * Creates a new authenticated session
     * 
     * Initializes a session with the provided authentication context. The
     * session manages the current user's identity, organization membership,
     * and access permissions.
     * 
     * @param data - Session data including:
     *               - user: Current user details
     *               - org: Active organization
     *               - org_user: Organization membership
     *               - client: OAuth client context
     *               - permissions: Access permissions
     * 
     * @example
     * Basic user session:
     * ```typescript
     * const session = new Session({
     *   user: {
     *     id: 'user-123',
     *     name: 'Jane Developer',
     *     email: 'jane@example.com'
     *   }
     * });
     * ```
     * 
     * @example
     * Full organization context:
     * ```typescript
     * const session = new Session({
     *   user: {
     *     id: 'user-123',
     *     name: 'Jane Developer'
     *   },
     *   org: {
     *     id: 'org-456',
     *     name: 'Tech Corp'
     *   },
     *   org_user: {
     *     permission: 'admin'
     *   },
     *   client: {
     *     id: 'client-789',
     *     name: 'Web Dashboard'
     *   },
     *   permissions: {
     *     canManageUsers: true,
     *     canManageApps: true
     *   }
     * });
     * ```
     */
        constructor(data: Partial<SessionInterface>) {
        super(data);
    }

    /**
     * Get the current authenticated user
     * 
     * This getter provides access to the current user's profile and identity
     * information. It returns a User instance that can be used to access
     * and manage user-specific data.
     * 
     * @returns User instance for the authenticated user, or null if not available
     * @throws {Error} When user data is malformed
     * 
     * @example
     * Basic user access:
     * ```typescript
     * const user = session.user;
     * if (user) {
     *   console.log(`Authenticated as: ${user.name}`);
     *   console.log(`Email: ${user.email}`);
     *   console.log(`Status: ${user.isActive() ? 'Active' : 'Inactive'}`);
     * } else {
     *   console.log('Not authenticated');
     * }
     * ```
     * 
     * @example
     * Profile management:
     * ```typescript
     * async function updateUserProfile(session: Session) {
     *   const user = session.user;
     *   if (!user) {
     *     throw new Error('Not authenticated');
     *   }
     *   
     *   // Update profile
     *   user.update({
     *     name: 'Updated Name',
     *     metadata: {
     *       title: 'Senior Developer',
     *       department: 'Engineering'
     *     }
     *   });
     *   
     *   await user.save();
     *   console.log('Profile updated successfully');
     * }
     * ```
     */
    get user(): User | null {
        if (this.data.user) {
            return new User(this.data.user);
        }
        return null;
    }

    /**
     * Set the current authenticated user
     * 
     * This setter updates the current user context in the session. It's
     * typically used when switching users or updating user information
     * after authentication changes.
     * 
     * @param user - Complete user data including:
     *               - id: User's unique identifier
     *               - name: User's full name
     *               - email: User's email address
     *               - metadata: Additional user data
     * 
     * @example
     * Basic user switch:
     * ```typescript
     * session.user = {
     *   id: 'user-123',
     *   name: 'New User',
     *   email: 'new@example.com'
     * };
     * ```
     * 
     * @example
     * Detailed user context:
     * ```typescript
     * session.user = {
     *   id: 'user-456',
     *   name: 'Jane Smith',
     *   email: 'jane@example.com',
     *   metadata: {
     *     title: 'Engineering Manager',
     *     department: 'R&D',
     *     location: 'San Francisco',
     *     timezone: 'America/Los_Angeles'
     *   }
     * };
     * 
     * // Verify switch
     * const user = session.user;
     * console.log(`Switched to: ${user.name}`);
     * ```
     */
    set user(user: UserInterface) {
        this.data.user = user;
    }

    /**
     * Get the current active organization
     * 
     * This getter provides access to the current organization context in
     * the session. It returns an Organization instance that can be used
     * to access and manage organization-specific resources.
     * 
     * @returns Organization instance for active organization, or null if not available
     * @throws {Error} When organization data is malformed
     * 
     * @example
     * Basic organization access:
     * ```typescript
     * const org = session.org;
     * if (org) {
     *   console.log(`Organization: ${org.name}`);
     *   console.log(`Description: ${org.short_description}`);
     *   console.log(`Status: ${org.isActive() ? 'Active' : 'Inactive'}`);
     * } else {
     *   console.log('No organization context');
     * }
     * ```
     * 
     * @example
     * Resource management:
     * ```typescript
     * async function manageOrgResources(session: Session) {
     *   const org = session.org;
     *   if (!org) {
     *     throw new Error('No organization context');
     *   }
     *   
     *   // Access organization resources
     *   const [agents, apps, models] = await Promise.all([
     *     org.agents.get(),
     *     org.apps.get(),
     *     org.models.get()
     *   ]);
     *   
     *   console.log('Organization Resources:');
     *   console.log(`- ${agents.length} AI agents`);
     *   console.log(`- ${apps.length} applications`);
     *   console.log(`- ${models.length} models`);
     * }
     * ```
     */
    get org(): Organization | null {
        if (this.data.org) {
            return new Organization(this.data.org);
        }
        return null;
    }

    /**
     * Set the current active organization
     * 
     * This setter updates the current organization context in the session.
     * It's typically used when switching between organizations or updating
     * organization information.
     * 
     * @param org - Complete organization data including:
     *              - id: Organization's unique identifier
     *              - name: Organization name
     *              - short_description: Brief description
     *              - metadata: Additional organization data
     * 
     * @example
     * Basic organization switch:
     * ```typescript
     * session.org = {
     *   id: 'org-123',
     *   name: 'New Organization',
     *   short_description: 'Updated context'
     * };
     * ```
     * 
     * @example
     * Detailed organization context:
     * ```typescript
     * session.org = {
     *   id: 'org-456',
     *   name: 'Enterprise Corp',
     *   short_description: 'Global enterprise solutions',
     *   long_description: 'Leading provider of enterprise AI solutions',
     *   metadata: {
     *     industry: 'technology',
     *     size: 'enterprise',
     *     region: 'global',
     *     features: ['agents', 'apps', 'models']
     *   }
     * };
     * 
     * // Update related context
     * session.orgUser = {
     *   permission: 'admin',
     *   metadata: {
     *     role: 'organization-admin'
     *   }
     * };
     * ```
     */
    set org(org: OrganizationInterface) {
        this.data.org = org;
    }

    /**
     * Get the current organization membership
     * 
     * This getter provides access to the current user's membership and role
     * within the active organization. It returns an OrgUser instance that
     * manages the relationship between user and organization.
     * 
     * @returns OrgUser instance for current membership, or null if not available
     * @throws {Error} When relationship data is malformed
     * 
     * @example
     * Basic membership check:
     * ```typescript
     * const membership = session.orgUser;
     * if (membership) {
     *   console.log(`Role: ${membership.permission}`);
     *   console.log(`Active: ${membership.isActive()}`);
     * } else {
     *   console.log('No organization membership');
     * }
     * ```
     * 
     * @example
     * Permission management:
     * ```typescript
     * async function checkAccess(session: Session) {
     *   const membership = session.orgUser;
     *   if (!membership) {
     *     throw new Error('No organization access');
     *   }
     *   
     *   // Check permissions
     *   const perms = session.permissions;
     *   if (perms?.canManageUsers) {
     *     // Manage team
     *     const team = await membership.orgs.get();
     *     console.log('Team Members:');
     *     team.forEach(member => {
     *       console.log(`- ${member.user.name} (${member.permission})`);
     *     });
     *   } else {
     *     console.log('Insufficient permissions');
     *   }
     * }
     * ```
     */
    get orgUser(): OrgUser | null {
        if (this.data.org_user) {
            return new OrgUser(this.data.org_user);
        }
        return null;
    }

    /**
     * Set the current organization membership
     * 
     * This setter updates the current user's membership and role within
     * the active organization. It's typically used when switching roles
     * or updating membership details.
     * 
     * @param orgUser - Complete membership data including:
     *                  - org: Organization reference
     *                  - user: User reference
     *                  - permission: Access level
     *                  - metadata: Additional membership data
     * 
     * @example
     * Basic role update:
     * ```typescript
     * session.orgUser = {
     *   org: 'org-123',
     *   user: 'user-456',
     *   permission: 'admin'
     * };
     * ```
     * 
     * @example
     * Detailed membership update:
     * ```typescript
     * session.orgUser = {
     *   org: 'org-123',
     *   user: 'user-456',
     *   permission: 'member',
     *   metadata: {
     *     department: 'engineering',
     *     title: 'Senior Developer',
     *     start_date: new Date().toISOString(),
     *     access_level: 'full',
     *     teams: ['frontend', 'platform']
     *   }
     * };
     * 
     * // Verify membership
     * const membership = session.orgUser;
     * if (membership?.isActive()) {
     *   console.log('Membership updated successfully');
     * }
     * ```
     */
    set orgUser(orgUser: OrgUserInterface) {
        this.data.org_user = orgUser;
    }

    /**
     * Get the current OAuth client
     * 
     * This getter provides access to the current OAuth client context in
     * the session. It returns a Client instance that manages authentication
     * and authorization for external applications.
     * 
     * @returns Client instance for current OAuth client, or null if not available
     * @throws {Error} When client data is malformed
     * 
     * @example
     * Basic client access:
     * ```typescript
     * const client = session.client;
     * if (client) {
     *   console.log(`Client: ${client.name}`);
     *   console.log(`ID: ${client.client_id}`);
     *   console.log(`Status: ${client.isActive() ? 'Active' : 'Inactive'}`);
     * } else {
     *   console.log('No client context');
     * }
     * ```
     * 
     * @example
     * Client verification:
     * ```typescript
     * async function verifyClient(session: Session) {
     *   const client = session.client;
     *   if (!client) {
     *     throw new Error('No client context');
     *   }
     *   
     *   // Check client configuration
     *   console.log('Client Configuration:');
     *   console.log(`Name: ${client.name}`);
     *   console.log(`ID: ${client.client_id}`);
     *   console.log(`Redirect URIs: ${client.redirect_uris.join(', ')}`);
     *   console.log(`Scopes: ${client.scopes.join(', ')}`);
     *   
     *   if (client.metadata?.type === 'service-account') {
     *     console.log('Service Account Details:');
     *     console.log(`Service: ${client.metadata.service}`);
     *     console.log(`Environment: ${client.metadata.environment}`);
     *   }
     * }
     * ```
     */
    get client(): Client | null {
        if (this.data.client) {
            return new Client(this.data.client);
        }
        return null;
    }

    /**
     * Set the current OAuth client
     * 
     * This setter updates the current OAuth client context in the session.
     * It's typically used when switching clients or updating client
     * configuration for authentication.
     * 
     * @param client - Complete client data including:
     *                 - id: Client's unique identifier
     *                 - name: Client application name
     *                 - client_id: OAuth client ID
     *                 - client_secret: OAuth client secret
     *                 - redirect_uris: Authorized redirect URIs
     *                 - scopes: Authorized scopes
     *                 - metadata: Additional client data
     * 
     * @example
     * Basic client update:
     * ```typescript
     * session.client = {
     *   id: 'client-123',
     *   name: 'Web Dashboard',
     *   client_id: 'client-id',
     *   redirect_uris: ['https://app.example.com/callback']
     * };
     * ```
     * 
     * @example
     * Service account setup:
     * ```typescript
     * session.client = {
     *   id: 'client-456',
     *   name: 'Background Service',
     *   client_id: process.env.SERVICE_CLIENT_ID,
     *   client_secret: process.env.SERVICE_CLIENT_SECRET,
     *   grant_types: ['client_credentials'],
     *   scopes: ['service:full'],
     *   metadata: {
     *     type: 'service-account',
     *     service: 'data-processor',
     *     environment: 'production',
     *     rate_limit: 1000
     *   }
     * };
     * 
     * // Verify client
     * const client = session.client;
     * if (client?.isActive()) {
     *   console.log('Client configured successfully');
     * }
     * ```
     */
    set client(client: ClientInterface) {
        this.data.client = client;
    }

    /**
     * Get the current session permissions
     * 
     * This getter provides access to the current session's permission set.
     * It returns a permissions object that defines what actions the current
     * user can perform within the active organization context.
     * 
     * @returns Permission object defining allowed actions, or null if not available
     * @throws {Error} When permission data is malformed
     * 
     * @example
     * Basic permission check:
     * ```typescript
     * const perms = session.permissions;
     * if (perms) {
     *   console.log('User Permissions:');
     *   console.log(`- Manage Users: ${perms.canManageUsers}`);
     *   console.log(`- Manage Apps: ${perms.canManageApps}`);
     *   console.log(`- Manage Models: ${perms.canManageModels}`);
     * } else {
     *   console.log('No permission data available');
     * }
     * ```
     * 
     * @example
     * Permission-based operations:
     * ```typescript
     * async function performAdminTask(session: Session) {
     *   const perms = session.permissions;
     *   if (!perms) {
     *     throw new Error('No permission data');
     *   }
     *   
     *   // Check admin capabilities
     *   const canManageTeam = perms.canManageUsers;
     *   const canConfigureApps = perms.canManageApps;
     *   const canDeployModels = perms.canManageModels;
     *   
     *   if (canManageTeam && canConfigureApps && canDeployModels) {
     *     console.log('Full administrative access');
     *     
     *     // Perform admin tasks
     *     const org = session.org;
     *     if (org) {
     *       const [users, apps, models] = await Promise.all([
     *         org.orgs.get(),
     *         org.apps.get(),
     *         org.models.get()
     *       ]);
     *       
     *       console.log('Resource Summary:');
     *       console.log(`- ${users.length} team members`);
     *       console.log(`- ${apps.length} applications`);
     *       console.log(`- ${models.length} AI models`);
     *     }
     *   } else {
     *     console.log('Limited permissions:');
     *     console.log(`- Team management: ${canManageTeam}`);
     *     console.log(`- App configuration: ${canConfigureApps}`);
     *     console.log(`- Model deployment: ${canDeployModels}`);
     *   }
     * }
     * ```
     */
    get permissions(): SessionPermissionsInterface | null {
        if (!this.data.permissions) {
            return null;
        }
        return this.data.permissions;
    }
}