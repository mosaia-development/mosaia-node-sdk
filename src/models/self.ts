import {
    MosaiaConfig,
    SelfInterface,
    UserInterface
} from '../types';
import { BaseModel } from './base';
import User from './user';

/**
 * Self class for managing current user/entity information in the Mosaia SDK
 * 
 * Represents the current authenticated entity's information, including user data,
 * organization relationships, and client information. This class provides access
 * to the current user's profile and associated entities.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - Current user data management and access
 * - User profile information retrieval
 * - Organization and client relationship access (commented out for future implementation)
 * - Integration with the Mosaia API for self operations
 * 
 * @example
 * ```typescript
 * import { Self } from 'mosaia-node-sdk';
 * 
 * // Create a self instance with current user data
 * const self = new Self({
 *   user: {
 *     id: 'current-user-id',
 *     name: 'John Doe',
 *     email: 'john@example.com'
 *   }
 * });
 * 
 * // Access current user information
 * const currentUser = self.user;
 * if (currentUser) {
 *   console.log('Current user:', currentUser.name);
 *   console.log('User email:', currentUser.email);
 * }
 * 
 * // Update user information
 * self.user = {
 *   id: 'current-user-id',
 *   name: 'John Doe Updated',
 *   email: 'john.updated@example.com'
 * };
 * ```
 * 
 * @extends BaseModel<SelfInterface>
 */
export default class Self extends BaseModel<SelfInterface> {
    /**
     * Creates a new Self instance
     * 
     * Initializes a self instance with the provided data representing the current
     * authenticated entity's information.
     * 
     * @param data - Self interface data containing current user/entity information
     * 
     * @example
     * ```typescript
     * const self = new Self({
     *   user: {
     *     id: 'user-123',
     *     name: 'Jane Doe',
     *     email: 'jane@example.com'
     *   }
     * });
     * ```
     */
    constructor(data: Partial<SelfInterface>) {
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
     * const currentUser = self.user;
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
     * Updates the current user data in the self instance.
     * 
     * @param user - User interface data to set as the current user
     * 
     * @example
     * ```typescript
     * self.user = {
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
     * const currentOrg = self.org;
     * if (currentOrg) {
     *   console.log('Current organization:', currentOrg.name);
     * }
     * ```
     */
    // get org(): Organization | null {
    //     if (this.data.org) {
    //         return new Organization(this.data.org, this.config);
    //     }
    //     return null;
    // }

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
     * const orgUser = self.orgUser;
     * if (orgUser) {
     *   console.log('Organization role:', orgUser.permission);
     * }
     * ```
     */
    // get orgUser(): OrgUser | null {
    //     if (this.data.orgUser) {
    //         return new OrgUser(this.data.orgUser, this.config);
    //     }
    //     return null;
    // }

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
     * const currentClient = self.client;
     * if (currentClient) {
     *   console.log('Client name:', currentClient.name);
     *   console.log('Client ID:', currentClient.client_id);
     * }
     * ```
     */
    // get client(): Client | null {
    //     if (this.data.client) {
    //         return new Client(this.data.client, this.config);
    //     }
    //     return null;
    // }
}