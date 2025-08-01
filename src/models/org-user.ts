import {
    AuthResponse,
    OrganizationInterface,
    OrgUserInterface,
    UserInterface
} from '../types';
import { BaseModel } from './base';
import Mosaia from '../index';
import Organization from './organization';
import User from './user';

/**
 * OrgUser class for managing organization user relationship instances in the Mosaia SDK
 * 
 * Represents the relationship between a user and an organization, including
 * permissions, roles, and access control within organizational contexts.
 * This class provides methods for managing user-organization relationships
 * and accessing related user and organization data.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - Organization user relationship data management and validation
 * - Access to related user and organization instances
 * - Session management for organization users
 * - Relationship management (enable/disable)
 * - Integration with the Mosaia API for org-user operations
 * 
 * @example
 * ```typescript
 * import { OrgUser } from 'mosaia-node-sdk';
 * 
 * // Create an org user relationship instance
 * const orgUser = new OrgUser({
 *   org: 'org-id',
 *   user: 'user-id',
 *   permission: 'admin'
 * });
 * 
 * // Access related user and organization data
 * const user = orgUser.user;
 * const organization = orgUser.org;
 * 
 * // Get a session for this org user
 * const mosaia = await orgUser.session();
 * 
 * // Disable the relationship
 * await orgUser.disable();
 * ```
 * 
 * @extends BaseModel<OrgUserInterface>
 */
export default class OrgUser extends BaseModel<OrgUserInterface> {
    /**
     * Creates a new OrgUser instance
     * 
     * Initializes an organization user relationship with the provided data and optional URI.
     * The org user represents the relationship between a user and an organization.
     * 
     * @param data - Organization user relationship data
     * @param uri - Optional URI path for the org user endpoint. Defaults to '/org'
     * 
     * @example
     * ```typescript
     * const orgUser = new OrgUser({
     *   org: 'acme-corp',
     *   user: 'john-doe',
     *   permission: 'member'
     * });
     * ```
     */
    constructor(data: Partial<OrgUserInterface>, uri?: string) {
        super(data, uri || '/org');
    }

    /**
     * Get the user associated with this organization relationship
     * 
     * Returns a User instance representing the user in this organization relationship.
     * 
     * @returns User instance for the associated user
     * @throws {Error} When user data is not available
     * 
     * @example
     * ```typescript
     * const user = orgUser.user;
     * console.log('User name:', user.name);
     * console.log('User email:', user.email);
     * ```
     */
    get user(): User {
        if (!this.data.user) {
            throw new Error('User data not available');
        }
        return new User(this.data.user as Partial<UserInterface>);
    }

    /**
     * Set the user data for this organization relationship
     * 
     * Updates the user data associated with this organization relationship.
     * 
     * @param data - User interface data to set
     * 
     * @example
     * ```typescript
     * orgUser.user = {
     *   id: 'new-user-id',
     *   name: 'Jane Doe',
     *   email: 'jane@example.com'
     * };
     * ```
     */
    set user(data: UserInterface) {
        this.update({ user: data as any });
    }

    /**
     * Get the organization associated with this user relationship
     * 
     * Returns an Organization instance representing the organization in this relationship.
     * 
     * @returns Organization instance for the associated organization
     * @throws {Error} When organization data is not available
     * 
     * @example
     * ```typescript
     * const organization = orgUser.org;
     * console.log('Org name:', organization.name);
     * console.log('Org description:', organization.short_description);
     * ```
     */
    get org(): Organization {
        if (!this.data.org) {
            throw new Error('Organization data not available');
        }
        return new Organization(this.data.org as Partial<OrganizationInterface>);
    }

    /**
     * Set the organization data for this user relationship
     * 
     * Updates the organization data associated with this user relationship.
     * 
     * @param data - Organization interface data to set
     * 
     * @example
     * ```typescript
     * orgUser.org = {
     *   id: 'new-org-id',
     *   name: 'New Organization',
     *   short_description: 'A new organization'
     * };
     * ```
     */
    set org(data: OrganizationInterface) {
        this.update({ org: data as any });
    }

    /**
     * Get a session for this organization user
     * 
     * Retrieves an authentication session for the organization user relationship,
     * returning a configured Mosaia instance with the appropriate access tokens.
     * 
     * @returns Promise that resolves to a configured Mosaia instance
     * @throws {Error} When session retrieval fails or network errors occur
     * 
     * @example
     * ```typescript
     * try {
     *   const mosaia = await orgUser.session();
     *   console.log('Session established successfully');
     *   
     *   // Use the session to access organization resources
     *   const agents = await mosaia.agents.get();
     * } catch (error) {
     *   console.error('Session failed:', error.message);
     * }
     * ```
     */
    async session(): Promise<Mosaia> {
        try {
            const {
                data,
                error
            } = await this.apiClient.GET<AuthResponse>(`${this.uri}/session`);

            if (error) {
                throw new Error(error.message);
            }

            const config = {
                ...this.config,
                apiKey: data.access_token,
                session: data
            }
            return Promise.resolve(new Mosaia(config));
        } catch (error) {
            console.log('error:', error);
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Disable the organization user relationship
     * 
     * Deactivates the relationship between the user and organization,
     * effectively removing the user's access to the organization.
     * 
     * @returns Promise that resolves when the relationship is disabled
     * @throws {Error} When disable operation fails or network errors occur
     * 
     * @example
     * ```typescript
     * try {
     *   await orgUser.disable();
     *   console.log('User removed from organization successfully');
     * } catch (error) {
     *   console.error('Failed to remove user:', error.message);
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