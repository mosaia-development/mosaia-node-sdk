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
 * session class for managing current user/entity information in the Mosaia SDK
 * 
 * Represents the current authenticated entity's information, including user data,
 * organization relationships, and client information. This class provides access
 * to the current user's profile and associated entities.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - Current user data management and access
 * - User profile information retrieval
 * - Organization and client relationship access (commented out for future implementation)
 * - Integration with the Mosaia API for session operations
 * 
 * @example
 * ```typescript
 * import { session } from 'mosaia-node-sdk';
 * 
 * // Create a session instance with current user data
 * const session = new session({
 *   user: {
 *     id: 'current-user-id',
 *     name: 'John Doe',
 *     email: 'john@example.com'
 *   }
 * });
 * 
 * // Access current user information
 * const currentUser = session.user;
 * if (currentUser) {
 *   console.log('Current user:', currentUser.name);
 *   console.log('User email:', currentUser.email);
 * }
 * 
 * // Update user information
 * session.user = {
 *   id: 'current-user-id',
 *   name: 'John Doe Updated',
 *   email: 'john.updated@example.com'
 * };
 * ```
 * 
 * @extends BaseModel<SessionInterface>
 */
export default class Session extends BaseModel<SessionInterface> {
    /**
     * Creates a new Session instance
     * 
     * Initializes a session instance with the provided data representing the current
     * authenticated entity's information.
     * 
     * @param data - Session interface data containing current user/entity information
     * 
     * @example
     * ```typescript
     * const session = new Session({
     *   user: {
     *     id: 'user-123',
     *     name: 'Jane Doe',
     *     email: 'jane@example.com'
     *   }
     * });
     * ```
     */
        constructor(data: Partial<SessionInterface>) {
        super(data);
    }

    /**
     * Get the current user information
     * 
     * Returns a User instance representing the current authenticated user,
     * or null if no user data is available.
     * 
     * @returns User instance for the current user, or null if not available
     * 
     * @example
     * ```typescript
     * const currentUser = session.user;
     * if (currentUser) {
     *   console.log('Logged in as:', currentUser.name);
     *   console.log('User ID:', currentUser.id);
     * } else {
     *   console.log('No user data available');
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
     * Set the current user information
     * 
     * Updates the current user data in the session instance.
     * 
     * @param user - User interface data to set as the current user
     * 
     * @example
     * ```typescript
     * session.user = {
     *   id: 'new-user-id',
     *   name: 'Updated Name',
     *   email: 'updated@example.com'
     * };
     * ```
     */
    set user(user: UserInterface) {
        this.data.user = user;
    }

    /**
     * Get the current organization information
     * 
     * Returns an Organization instance representing the current organization context,
     * or null if no organization data is available.
     * 
     * @returns Organization instance for the current organization, or null if not available
     * 
     * @example
     * ```typescript
     * const currentOrg = session.org;
     * if (currentOrg) {
     *   console.log('Current organization:', currentOrg.name);
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
     * Set the current organization information
     * 
     * Updates the current organization data in the session instance.
     * 
     * @param org - Organization interface data to set as the current organization
     */
    set org(org: OrganizationInterface) {
        this.data.org = org;
    }

    /**
     * Get the current organization user relationship
     * 
     * Returns an OrgUser instance representing the current user's relationship
     * with the current organization, or null if not available.
     * 
     * @returns OrgUser instance for the current relationship, or null if not available
     * 
     * @example
     * ```typescript
     * const orgUser = session.orgUser;
     * if (orgUser) {
     *   console.log('Organization role:', orgUser.permission);
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
     * Set the current organization user relationship
     * 
     * Updates the current organization user relationship data in the session instance.
     * 
     * @param orgUser - OrgUser interface data to set as the current organization user relationship
     */
    set orgUser(orgUser: OrgUserInterface) {
        this.data.org_user = orgUser;
    }

    /**
     * Get the current client information
     * 
     * Returns a Client instance representing the current OAuth client context,
     * or null if no client data is available.
     * 
     * @returns Client instance for the current client, or null if not available
     * 
     * @example
     * ```typescript
     * const currentClient = session.client;
     * if (currentClient) {
     *   console.log('Client name:', currentClient.name);
     *   console.log('Client ID:', currentClient.client_id);
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
     * Set the current client information
     * 
     * Updates the current client data in the session instance.
     * 
     * @param client - Client interface data to set as the current client
     */
    set client(client: ClientInterface) {
        this.data.client = client;
    }

    /**
     * Get the current permission information
     * 
     * Returns the current permission data in the session instance.
     * 
     * @returns Permission data for the current session
     */
    get permissions(): SessionPermissionsInterface | null {
        if (!this.data.permissions) {
            return null;
        }
        return this.data.permissions;
    }
}