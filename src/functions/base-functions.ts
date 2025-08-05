import { MosaiaConfig } from '../types';
import APIClient from '../utils/api-client';
import { ConfigurationManager } from '../config';

/**
 * Base functions class that provides common functionality for all function classes
 * 
 * This class provides:
 * - Configuration management
 * - API client access
 * - Common error handling
 * - Generic type support for payloads
 * 
 * @template T - The interface type for the entity
 * @template GetPayload - The payload type for GET responses
 * @template CreatePayload - The payload type for POST responses
 */
export abstract class BaseFunctions<T extends object = any, GetPayload = any, CreatePayload = any> {
    protected apiClient: APIClient;
    protected configManager: ConfigurationManager;
    protected uri: string = '';

    constructor(uri?: string) {
        this.configManager = ConfigurationManager.getInstance();
        // Create API client (uses ConfigurationManager internally)
        this.apiClient = new APIClient();
        if (uri) this.uri = uri;
    }

    /**
     * Get the current configuration
     */
    protected get config(): MosaiaConfig {
        return this.configManager.getConfig();
    }

    /**
     * Get entities with optional filtering and pagination
     * 
     * @param params - Optional query parameters for filtering and pagination
     * @param id - Optional specific entity ID to retrieve
     * @returns Promise that resolves to the entity data
     */
    async get(params?: object, id?: string): Promise<GetPayload> {
        try {
            let uri = this.uri;
            if (id) uri = `${uri}/${id}`;
            
            return this.apiClient.GET<GetPayload>(uri, params);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Create a new entity
     * 
     * @param entity - Entity data for the new entity (ID will be generated)
     * @returns Promise that resolves to the created entity
     */
    async create(entity: T, params?: object): Promise<CreatePayload> {
        try {
            let uri = this.uri;

            if (params) uri += `?${new URLSearchParams(params as any).toString()}`;
            return this.apiClient.POST<CreatePayload>(uri, entity);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Update an existing entity
     * 
     * @param id - The entity ID to update
     * @param entity - Entity data for the update
     * @returns Promise that resolves to the updated entity
     */
    async update(id: string, entity: Partial<T>, params?: object): Promise<CreatePayload> {
        try {
            let uri = `${this.uri}/${id}`;

            if (params) uri += `?${new URLSearchParams(params as any).toString()}`;
            return this.apiClient.PUT<CreatePayload>(uri, entity);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Delete an entity
     * 
     * @param id - The entity ID to delete
     * @param params - Optional query parameters
     * @returns Promise that resolves when deletion is successful
     */
    async delete(id: string, params?: object): Promise<void> {
        try {
            let uri = `${this.uri}/${id}`;

            if (params) uri += `?${new URLSearchParams(params as any).toString()}`;
            await this.apiClient.DELETE<void>(uri, params);
        } catch (error) {
            throw this.handleError(error);
        }
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