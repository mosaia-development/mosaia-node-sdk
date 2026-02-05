import { MosaiaConfig } from '../types';
import APIClient from '../utils/api-client';
import { ConfigurationManager } from '../config';

/**
 * Base model class that provides common functionality for all models
 * 
 * This abstract class serves as the foundation for all model classes in the SDK.
 * It provides standardized data management, CRUD operations, and serialization
 * capabilities that are inherited by all specific model implementations.
 * 
 * Features:
 * - Automatic property mapping from data
 * - CRUD operations (save, delete)
 * - Configuration management
 * - Data validation and type safety
 * - JSON serialization
 * - API payload generation
 * - Error handling
 * 
 * @template T - The interface type that this model implements (e.g., UserInterface)
 * 
 * @example
 * Basic model implementation:
 * ```typescript
 * class User extends BaseModel<UserInterface> {
 *   constructor(data: Partial<UserInterface>) {
 *     super(data, '/user');
 *   }
 *   
 *   // Add custom methods
 *   async updateEmail(email: string): Promise<void> {
 *     await this.save({ email });
 *   }
 * }
 * ```
 * 
 * @example
 * Using model instances:
 * ```typescript
 * // Create a new user instance
 * const user = new User({
 *   email: 'user@example.com',
 *   firstName: 'John'
 * });
 * 
 * // Update properties
 * user.update({ lastName: 'Doe' });
 * 
 * // Save changes
 * await user.save();
 * 
 * // Convert to JSON
 * const data = user.toJSON();
 * ```
 * 
 * @category Models
 */
export abstract class BaseModel<T> {
    protected apiClient: APIClient;
    protected configManager: ConfigurationManager;
    protected data: Partial<T>;
    protected uri: string = '';

    constructor(data: Partial<T>, uri?: string) {
        this.data = data;
        if (uri) this.uri = uri;
        this.configManager = ConfigurationManager.getInstance();

        Object.keys(data).forEach(key => {
            // Don't set properties that already have getter methods defined
            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);
            if (!descriptor || (descriptor.get === undefined && descriptor.set === undefined)) {
                (this as any)[key] = (data as any)[key];
            }
        });
        // Create API client (uses ConfigurationManager internally)
        this.apiClient = new APIClient();
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
     * Check if the entity is active
     * 
     * This method checks the active status of the entity. Most entities in the
     * system can be active or inactive, which affects their availability and
     * usability in the platform.
     * 
     * @returns True if the entity is active, false otherwise
     * 
     * @example
     * ```typescript
     * const user = new User(userData);
     * if (user.isActive()) {
     *   // Perform operations with active user
     * } else {
     *   console.log('User is inactive');
     * }
     * ```
     */
    isActive(): boolean {
        return (this.data as any).active === true;
    }

    /**
     * Convert model instance to interface data
     * 
     * This method serializes the model instance to a plain object that matches
     * the interface type. This is useful for:
     * - Sending data to the API
     * - Storing data in a database
     * - Passing data between components
     * - Debugging model state
     * 
     * @returns The model data as a plain object matching the interface type
     * 
     * @example
     * ```typescript
     * const user = new User({
     *   email: 'user@example.com',
     *   firstName: 'John'
     * });
     * 
     * const data = user.toJSON();
     * console.log(data); // { email: '...', firstName: '...' }
     * 
     * // Use with JSON.stringify
     * const json = JSON.stringify(user);
     * ```
     */
    toJSON(): T {
        return this.data as T;
    }

    /**
     * Convert model instance to API payload
     * 
     * This method creates a payload suitable for API requests by:
     * - Converting the model to a plain object
     * - Removing read-only fields (like 'id')
     * - Ensuring proper data format for the API
     * 
     * @returns A clean object suitable for API requests
     * 
     * @example
     * ```typescript
     * const user = new User({
     *   id: '123',           // Will be removed from payload
     *   email: 'new@example.com',
     *   firstName: 'John'
     * });
     * 
     * const payload = user.toAPIPayload();
     * // payload = { email: '...', firstName: '...' }
     * // Note: 'id' is removed as it's read-only
     * 
     * await apiClient.POST('/users', payload);
     * ```
     */
    toAPIPayload(): Partial<T> {
        const data = { ...this.data };
        // Remove read-only fields
        delete (data as any).id;
        return data;
    }

    /**
     * Update model data with new values
     * 
     * This method updates the model's data and instance properties with new values.
     * It performs a shallow merge of the updates with existing data, allowing for
     * partial updates of the model's properties.
     * 
     * @param updates - Object containing properties to update
     * 
     * @example
     * ```typescript
     * const user = new User({
     *   email: 'old@example.com',
     *   firstName: 'John'
     * });
     * 
     * // Update multiple properties
     * user.update({
     *   email: 'new@example.com',
     *   lastName: 'Doe'
     * });
     * 
     * // Save changes to API
     * await user.save();
     * ```
     * 
     * @remarks
     * This method only updates the local model instance. To persist changes
     * to the API, call {@link save} after updating.
     */
    update(updates: Partial<T>): void {
        this.data = { ...updates };
        // Update instance properties
        Object.assign(this, updates);
    }

    /**
     * Save the model instance to the API
     * 
     * This method persists the current state of the model to the API using a PUT
     * request. It requires the model to have an ID (existing instance). For new
     * instances, use the collection's create method instead.
     * 
     * The method:
     * 1. Validates the model has an ID
     * 2. Sends current data to the API
     * 3. Updates local instance with API response
     * 
     * @returns Promise resolving to the updated model data
     * 
     * @throws {Error} When model has no ID
     * @throws {Error} When API request fails
     * 
     * @example
     * ```typescript
     * const user = new User({
     *   id: '123',
     *   email: 'user@example.com'
     * });
     * 
     * // Update and save
     * user.update({ firstName: 'John' });
     * await user.save();
     * ```
     * 
     * @example
     * Error handling:
     * ```typescript
     * try {
     *   await user.save();
     * } catch (error) {
     *   if (error.message.includes('ID is required')) {
     *     // Handle missing ID error
     *   } else {
     *     // Handle API errors
     *   }
     * }
     * ```
     */
    async save(): Promise<T> {
        try {
            if (!this.hasId()) {
                throw new Error('Entity ID is required for update');
            }
            const response = await this.apiClient.PUT<T>(`${this.uri}/${(this as any).id}`, this.toJSON() as any);
            // Update the model's data with the response
            this.update(response.data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Delete the model instance from the API
     * 
     * This method permanently deletes the model instance from the API and clears
     * the local data. This operation cannot be undone.
     * 
     * The method:
     * 1. Validates the model has an ID
     * 2. Sends DELETE request to the API
     * 3. Clears local instance data on success
     * 
     * @param params - Optional query parameters for deletion (e.g., { delete: true, deleteS3: true })
     * @returns Promise that resolves when deletion is successful
     * 
     * @throws {Error} When model has no ID
     * @throws {Error} When API request fails
     * 
     * @example
     * Basic deletion:
     * ```typescript
     * const user = await users.get({}, 'user-id');
     * if (user) {
     *   await user.delete();
     *   // User is now deleted and instance is cleared
     * }
     * ```
     * 
     * @example
     * Error handling:
     * ```typescript
     * try {
     *   await user.delete();
     *   console.log('User deleted successfully');
     * } catch (error) {
     *   if (error.message.includes('ID is required')) {
     *     console.error('Cannot delete - no ID');
     *   } else {
     *     console.error('Deletion failed:', error.message);
     *   }
     * }
     * ```
     * 
     * @example
     * Delete with query parameters:
     * ```typescript
     * // Hard delete
     * await item.delete({ delete: true });
     * 
     * // Delete with S3 cleanup
     * await item.delete({ deleteS3: true, delete: true });
     * ```
     */
    async delete(params?: object): Promise<void> {
        try {
            if (!this.hasId()) {
                throw new Error('Entity ID is required for deletion');
            }
            await this.apiClient.DELETE<void>(`${this.uri}/${(this as any).id}`, params);
            // Clear the model's data after deletion
            this.clearData();
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Clear all model data
     * 
     * This protected method clears all data from the model instance while
     * preserving essential internal properties. It's used after deletion
     * or when resetting a model instance.
     * 
     * The method:
     * - Clears the data object
     * - Removes instance properties
     * - Preserves protected internal properties
     * 
     * @protected
     * 
     * @example
     * ```typescript
     * protected reset(): void {
     *   this.clearData();
     *   // Instance is now empty except for internal properties
     * }
     * ```
     */
    protected clearData(): void {
        this.data = {} as Partial<T>;
        // Clear instance properties except protected ones
        const protectedKeys = ['config', 'client', 'data'];
        Object.keys(this).forEach(key => {
            if (!protectedKeys.includes(key)) {
                delete (this as any)[key];
            }
        });
    }

    /**
     * Check if the model has an ID
     * 
     * This protected method checks if the model instance has a valid ID.
     * It's used internally to validate operations that require an ID.
     * 
     * @returns True if the model has an ID, false otherwise
     * @protected
     * 
     * @example
     * ```typescript
     * protected async validateUpdate(): Promise<void> {
     *   if (!this.hasId()) {
     *     throw new Error('Cannot update without ID');
     *   }
     *   // Continue with update
     * }
     * ```
     */
    protected hasId(): boolean {
        return !!(this as any).id;
    }

    /**
     * Get the model's ID
     * 
     * This protected method safely retrieves the model's ID, throwing an error
     * if the ID is not available. It's used internally by methods that require
     * an ID to operate.
     * 
     * @returns The model's ID
     * @throws {Error} When the model has no ID
     * @protected
     * 
     * @example
     * ```typescript
     * protected async fetchDetails(): Promise<void> {
     *   try {
     *     const id = this.getId();
     *     const details = await this.apiClient.GET(`/details/${id}`);
     *     this.update(details);
     *   } catch (error) {
     *     // Handle missing ID or API errors
     *   }
     * }
     * ```
     */
    protected getId(): string | undefined {
        if (!this.hasId()) {
            throw new Error('Entity ID is required');
        }
        return (this as any).id;
    }

    /**
     * Get the model's complete API URI
     * 
     * This protected method constructs the complete URI for API requests by
     * combining the base URI with the model's ID. It ensures the model has
     * an ID before constructing the URI.
     * 
     * @returns The complete API URI for this model instance
     * @throws {Error} When the model has no ID
     * @protected
     * 
     * @example
     * ```typescript
     * protected async fetchRelated(): Promise<void> {
     *   try {
     *     const uri = this.getUri();
     *     const related = await this.apiClient.GET(`${uri}/related`);
     *     return related;
     *   } catch (error) {
     *     // Handle missing ID or API errors
     *   }
     * }
     * ```
     */
    protected getUri(): string {
        if (!this.hasId()) {
            throw new Error('Entity ID is required');
        }
        return `${this.uri}/${this.getId()}`;
    }

    /**
     * Handle API errors consistently
     * 
     * This protected method provides standardized error handling for all
     * API operations. It ensures that errors are properly formatted and
     * contain meaningful messages.
     * 
     * The method handles:
     * - Error objects with messages
     * - Plain objects with message properties
     * - Unknown error types
     * 
     * @param error - The error to handle (can be any type)
     * @returns Standardized Error object
     * @protected
     * 
     * @example
     * ```typescript
     * protected async customOperation(): Promise<void> {
     *   try {
     *     await this.apiClient.POST('/endpoint', data);
     *   } catch (error) {
     *     throw this.handleError(error);
     *   }
     * }
     * ```
     */
    protected handleError(error: any): Error {
        if ((error as any).message) {
            return error;
        }
        
        if (typeof error === 'object' && error.message) {
            return new Error(error.message);
        }
        
        return new Error('Unknown error occurred');
    }
}