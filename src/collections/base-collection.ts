import {
    MosaiaConfig,
    QueryParams,
    BatchAPIResponse
} from '../types';
import APIClient from '../utils/api-client';
import { ConfigurationManager } from '../config';

/**
 * Base Collection class that provides common functionality for all collection clients
 * 
 * This abstract class serves as the foundation for all collection classes in the SDK.
 * It provides standardized CRUD operations, configuration management, error handling,
 * and model instantiation capabilities.
 * 
 * Features:
 * - Standardized CRUD operations (GET, POST)
 * - Automatic configuration management
 * - Consistent error handling
 * - Response processing and type safety
 * - Model instantiation and hydration
 * - Pagination support
 * - Query parameter handling
 * 
 * @template T - The interface type for the entity (e.g., UserInterface, AgentInterface)
 * @template M - The model class type (e.g., User, Agent)
 * @template GetPayload - The payload type for GET responses (e.g., GetUsersPayload)
 * @template CreatePayload - The payload type for POST responses (e.g., GetUserPayload)
 * 
 * @example
 * Basic collection implementation:
 * ```typescript
 * class Users extends BaseCollection<UserInterface, User, GetUsersPayload, GetUserPayload> {
 *   constructor() {
 *     super('/user', User);
 *   }
 * }
 * 
 * const users = new Users();
 * const allUsers = await users.get({ limit: 10 });
 * const newUser = await users.create({ email: 'user@example.com' });
 * ```
 * 
 * @example
 * With custom endpoint:
 * ```typescript
 * class OrgUsers extends BaseCollection<OrgUserInterface, OrgUser> {
 *   constructor(orgId: string) {
 *     super(`/org/${orgId}/user`, OrgUser);
 *   }
 * }
 * ```
 * 
 * @category Collections
 */
export abstract class BaseCollection<
    T,
    M,
    GetPayload = any,
    CreatePayload = any
> {
    protected apiClient: APIClient;
    protected configManager: ConfigurationManager;
    protected uri: string;
    protected ModelClass: new (data: Partial<T>, uri?: string) => M;

    /**
     * Creates a new Base Collection instance
     * 
     * Initializes a collection with the specified API endpoint and model class.
     * The collection will use these to handle CRUD operations and instantiate
     * model objects from API responses.
     * 
     * @param uri - The API endpoint path (e.g., '/user', '/agent')
     * @param ModelClass - The model class constructor for creating instances
     * 
     * @example
     * ```typescript
     * class Users extends BaseCollection<UserInterface, User> {
     *   constructor() {
     *     // Initialize with /user endpoint and User model
     *     super('/user', User);
     *   }
     * }
     * ```
     * 
     * @throws {Error} When API client initialization fails
     */
    constructor(uri: string, ModelClass: new (data: Partial<T>) => M) {
        this.configManager = ConfigurationManager.getInstance();
        this.apiClient = new APIClient();
        this.uri = uri;
        this.ModelClass = ModelClass;
    }

    /**
     * Get the current configuration from the ConfigurationManager
     * 
     * This protected getter provides access to the current SDK configuration,
     * including API keys, URLs, and other settings.
     * 
     * @returns The current MosaiaConfig object
     * 
     * @example
     * ```typescript
     * protected someMethod() {
     *   const config = this.config;
     *   console.log('Using API URL:', config.apiURL);
     * }
     * ```
     * 
     * @protected
     */
    protected get config(): MosaiaConfig {
        return this.configManager.getConfig();
    }

    /**
     * Get entities with optional filtering and pagination
     * 
     * This method retrieves entities from the API. When called without an ID,
     * it returns a list of entities with optional filtering and pagination.
     * When called with an ID, it returns a specific entity.
     * 
     * @param params - Optional query parameters for filtering and pagination
     * @param params.limit - Maximum number of items to return
     * @param params.offset - Number of items to skip (for pagination)
     * @param params.q - Search query for text-based filtering
     * @param params.active - Filter by active status
     * @param params.tags - Array of tags to filter by
     * @param id - Optional specific entity ID to retrieve
     * @returns Promise resolving to:
     *          - BatchAPIResponse<M> when getting multiple entities
     *          - M when getting a single entity by ID
     *          - null when entity is not found
     * 
     * @example
     * Get multiple entities with filtering:
     * ```typescript
     * const result = await collection.get({
     *   limit: 10,
     *   offset: 0,
     *   q: 'search term',
     *   active: true,
     *   tags: ['tag1', 'tag2']
     * });
     * 
     * console.log('Items:', result.data);
     * console.log('Total:', result.paging?.total);
     * ```
     * 
     * @example
     * Get single entity by ID:
     * ```typescript
     * const entity = await collection.get({}, 'entity-id');
     * if (entity) {
     *   console.log('Found:', entity.id);
     * } else {
     *   console.log('Entity not found');
     * }
     * ```
     * 
     * @throws {Error} When API request fails or response is invalid
     */
    // Overload for getting a single entity by ID
    async get(params: QueryParams | undefined, id: string): Promise<M | null>;
    // Overload for getting multiple entities (batch response)
    async get(params?: QueryParams): Promise<BatchAPIResponse<M>>;
    // Implementation
    async get(params?: QueryParams, id?: string): Promise<BatchAPIResponse<M> | M | null> {
        try {
            let baseUri = this.uri;
            let uri = baseUri
            if (id) uri = `${uri}/${id}`;
            
            const response = await this.apiClient.GET<GetPayload>(uri, params);

            // Handle the case where response might be undefined or null
            if (!response || !response.data) {
                throw new Error('Invalid response from API');
            }

            const {
                data,
                paging
            } = response;
            
            // Handle array response (list of entities)
            if (Array.isArray(data)) {
                return {
                    data: data.map((item) => new this.ModelClass(item, baseUri)),
                    paging
                };
            }
            
            // Handle single entity response
            if (data) {
                return new this.ModelClass(data, baseUri);
            }
            
            return null;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Create a new entity
     * 
     * This method creates a new entity in the system. The entity ID will be
     * automatically generated by the server. The method returns a new model
     * instance initialized with the created entity's data.
     * 
     * @param entity - Entity data for the new entity (without ID)
     * @returns Promise resolving to a new model instance
     * 
     * @example
     * Create a new user:
     * ```typescript
     * const newUser = await users.create({
     *   email: 'user@example.com',
     *   firstName: 'John',
     *   lastName: 'Doe',
     *   active: true
     * });
     * 
     * console.log('Created user:', newUser.id);
     * ```
     * 
     * @example
     * Create with external ID:
     * ```typescript
     * const newAgent = await agents.create({
     *   name: 'Customer Support',
     *   shortDescription: 'AI agent for support',
     *   external_id: 'agent-123',
     *   extensors: {
     *     customField: 'value'
     *   }
     * });
     * ```
     * 
     * @throws {Error} When API request fails or response is invalid
     * @throws {Error} When required fields are missing
     */
    async create(entity: Omit<T, 'id'>): Promise<M> {
        try {
            const response = await this.apiClient.POST<CreatePayload>(this.uri, entity);

            // Handle the case where response might be undefined or null
            if (!response || !response.data) {
                throw new Error('Invalid response from API');
            }
            const { data } = response;
            
            return new this.ModelClass(data);
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Update an existing entity
     * 
     * This method updates an existing entity in the system. Only the fields
     * provided in the update data will be updated.
     * 
     * @param id - The entity ID to update
     * @param updates - Partial entity data for the update (only provided fields will be updated)
     * @param params - Optional query parameters for the request
     * @returns Promise resolving to the updated model instance
     * 
     * @example
     * Update user's email:
     * ```typescript
     * const updatedUser = await users.update('user-id', {
     *   email: 'newemail@example.com'
     * });
     * ```
     * 
     * @example
     * Update multiple fields:
     * ```typescript
     * const updatedAgent = await agents.update('agent-id', {
     *   name: 'Updated Agent Name',
     *   shortDescription: 'Updated description',
     *   active: false
     * });
     * ```
     * 
     * @throws {Error} When API request fails or response is invalid
     * @throws {Error} When entity ID is not provided
     */
    async update(id: string, updates: Partial<T>, params?: QueryParams): Promise<M> {
        try {
            if (!id) {
                throw new Error('Entity ID is required for update');
            }

            const response = await this.apiClient.PUT<CreatePayload>(`${this.uri}/${id}`, updates, params);

            // Handle the case where response might be undefined or null
            if (!response || !response.data) {
                throw new Error('Invalid response from API');
            }
            const { data } = response;
            
            return new this.ModelClass(data, `${this.uri}/${id}`);
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Delete an entity
     * 
     * This method permanently deletes an entity from the system. This action
     * cannot be undone.
     * 
     * @param id - The entity ID to delete
     * @param params - Optional query parameters object. Can include:
     *   - `force`: Force deletion even if entity has dependencies (boolean)
     * @returns Promise that resolves when deletion is successful
     * 
     * @example
     * Basic deletion:
     * ```typescript
     * await users.delete('user-id');
     * ```
     * 
     * @example
     * Force delete:
     * ```typescript
     * await organizations.delete('org-id', { force: true });
     * ```
     * 
     * @throws {Error} When API request fails or entity not found
     * @throws {Error} When entity ID is not provided
     */
    async delete(id: string, params?: QueryParams): Promise<void> {
        try {
            if (!id) {
                throw new Error('Entity ID is required for deletion');
            }

            await this.apiClient.DELETE<void>(`${this.uri}/${id}`, params);
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
} 