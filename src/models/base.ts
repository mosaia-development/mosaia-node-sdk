import {
    MosaiaConfig,
    BaseEntity
} from '../types';
import APIClient from '../apis/api-client';
import { ConfigurationManager } from '../config';

/**
 * Base model class that provides common functionality for all models
 * 
 * This class provides:
 * - Common CRUD operations
 * - Configuration management
 * - API client access
 * - Data validation
 * - JSON serialization
 * - Data update functionality
 * - Static factory methods
 * 
 * @template T - The interface type that this model implements
 */
export abstract class BaseModel<T> {
    protected client: APIClient;
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
        this.client = new APIClient();
    }

    /**
     * Get the current configuration
     */
    protected get config(): MosaiaConfig {
        return this.configManager.getConfig();
    }

    /**
     * Check if app is active
     */
    isActive(): boolean {
        return (this.data as any).active === true;
    }

    /**
     * Convert model instance to interface data
     * 
     * @returns The model data as the interface type
     */
    toJSON(): T {
        return this.data as T;
    }

    /**
     * Convert model instance to API payload (excludes read-only fields)
     * 
     * @returns The model data suitable for API requests
     */
    toAPIPayload(): Partial<T> {
        const data = { ...this.data };
        // Remove read-only fields
        delete (data as any).id;
        return data;
    }

    /**
     * Update model data
     * 
     * @param updates - The properties to update
     */
    update(updates: Partial<T>): void {
        this.data = { ...this.data, ...updates };
        // Update instance properties
        Object.assign(this, updates);
    }



    /**
     * Create a new instance
     * 
     * @returns Promise that resolves to the created model instance
     */
    async create(): Promise<T> {
        try {
            const response = await this.client.POST<T>(this.uri, this.toAPIPayload() as any);
            // Update the model's data with the response
            this.update(response.data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Save an existing instance
     * 
     * @param id - The instance ID
     * @param data - The update data
     * @returns Promise that resolves to the updated model instance
     */
    async save(): Promise<T> {
        try {
            if (!this.hasId()) {
                throw new Error('Entity ID is required for update');
            }
            const response = await this.client.PUT<T>(`${this.uri}/${(this as any).id}`, this.toJSON() as any);
            // Update the model's data with the response
            this.update(response.data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Delete an instance
     * 
     * @param id - The instance ID
     * @returns Promise that resolves when deletion is successful
     */
    async delete(): Promise<void> {
        try {
            if (!this.hasId()) {
                throw new Error('Entity ID is required for deletion');
            }
            await this.client.DELETE<void>(`${this.uri}/${(this as any).id}`);
            // Clear the model's data after deletion
            this.clearData();
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Clear all model data (useful after deletion or reset)
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
     * @returns True if the model has an ID
     */
    protected hasId(): boolean {
        return !!(this as any).id;
    }

    /**
     * Get the model ID
     * 
     * @returns The model ID or undefined
     */
    protected getId(): string | undefined {
        if (!this.hasId()) {
            throw new Error('Entity ID is required');
        }
        return (this as any).id;
    }

    /**
     * Get the model URI
     * 
     * @returns The model URI
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
     * @param error - The error to handle
     * @returns Standardized error
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