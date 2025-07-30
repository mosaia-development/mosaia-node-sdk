import { GetUserPayload, UserInterface } from '../types';
import { BaseModel } from './base';
import {
    Agents,
    Apps,
    Clients,
    Models,
    OrgUsers,
    AgentGroups,
    Tools
} from '../apis';

/**
 * User class for managing user instances in the Mosaia SDK
 * 
 * Represents a user account in the Mosaia platform with access to various resources
 * such as agents, applications, tools, and organizations. Users can manage their
 * own resources and interact with the platform's AI capabilities.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - User data management and validation
 * - Access to user-scoped resources (agents, apps, tools, etc.)
 * - Profile image upload and management
 * - User-specific API client access
 * - Integration with the Mosaia API for user operations
 * 
 * @example
 * ```typescript
 * import { User } from 'mosaia-node-sdk';
 * 
 * // Create a user instance
 * const user = new User({
 *   username: 'john_doe',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   description: 'Software developer'
 * });
 * 
 * // Access user's agents
 * const userAgents = user.agents;
 * const agents = await userAgents.get();
 * 
 * // Access user's applications
 * const userApps = user.apps;
 * const apps = await userApps.get();
 * 
 * // Upload profile image
 * const file = new File(['image data'], 'profile.jpg', { type: 'image/jpeg' });
 * await user.uploadProfileImage(file);
 * ```
 * 
 * @extends BaseModel<UserInterface>
 */
export default class User extends BaseModel<UserInterface> {
    /**
     * Creates a new User instance
     * 
     * Initializes a user with the provided profile data and optional URI.
     * The user represents an account holder in the Mosaia platform.
     * 
     * @param data - User profile data
     * @param uri - Optional URI path for the user endpoint. Defaults to '/user'
     * 
     * @example
     * ```typescript
     * const user = new User({
     *   username: 'jane_doe',
     *   name: 'Jane Doe',
     *   email: 'jane@example.com'
     * });
     * ```
     */
    constructor(data: Partial<UserInterface>, uri?: string) {
        super(data, uri || '/user');
    }

    /**
     * Get user's agents API client
     * 
     * Provides access to manage agents owned by this user.
     * 
     * @returns Agents API client instance scoped to this user
     */
    get agents(): Agents {
        return new Agents(this.getUri());
    }

    /**
     * Get user's applications API client
     * 
     * Provides access to manage applications owned by this user.
     * 
     * @returns Apps API client instance scoped to this user
     */
    get apps(): Apps {
        return new Apps(this.getUri());
    }

    /**
     * Commented out for later implementation
     */
    // get billing(): Billing {
    //     return new Billing(this.getUri());
    // }

    /**
     * Get user's OAuth clients API client
     * 
     * Provides access to manage OAuth clients owned by this user.
     * 
     * @returns Clients API client instance scoped to this user
     */
    get clients(): Clients {
        return new Clients(this.getUri());
    }

    /**
     * Get user's agent groups API client
     * 
     * Provides access to manage agent groups owned by this user.
     * 
     * @returns AgentGroups API client instance scoped to this user
     */
    get groups(): AgentGroups {
        return new AgentGroups(this.getUri());
    }

    /**
     * Get user's models API client
     * 
     * Provides access to manage AI models owned by this user.
     * 
     * @returns Models API client instance scoped to this user
     */
    get models(): Models {
        return new Models(this.getUri());
    }

    /**
     * Get user's organization relationships API client
     * 
     * Provides access to manage the user's relationships with organizations.
     * Uses the '/org' endpoint to get organizations for this user.
     * 
     * @returns OrgUsers API client instance scoped to this user
     */
    get orgs(): OrgUsers {
        return new OrgUsers(this.getUri(), '/org');
    }

    /**
     * Get user's tools API client
     * 
     * Provides access to manage tools owned by this user.
     * 
     * @returns Tools API client instance scoped to this user
     */
    get tools(): Tools {
        return new Tools(this.getUri());
    }

    /**
     * Upload a profile image for the user
     * 
     * Uploads an image file to be used as the user's profile picture.
     * The image will be associated with the user account for display purposes.
     * 
     * @param file - Image file to upload (supports common image formats)
     * @returns Promise that resolves to the updated user instance
     * @throws {Error} When upload fails or network errors occur
     * 
     * @example
     * ```typescript
     * // Upload a profile picture
     * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     * const file = fileInput.files[0];
     * 
     * try {
     *   await user.uploadProfileImage(file);
     *   console.log('Profile image uploaded successfully');
     * } catch (error) {
     *   console.error('Upload failed:', error.message);
     * }
     * ```
     */
    async uploadProfileImage(file: File): Promise<User> {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const {
                data,
                error
            } = await this.client.POST<GetUserPayload>(`${this.getUri()}/profile/image/upload`, formData);
            
            if (error) {
                throw new Error(error.message);
            }
            this.update(data as any);
    
            return this;
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }
}