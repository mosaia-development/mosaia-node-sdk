import {
    MosaiaConfig,
    QueryParams,
    APIResponse,
    ErrorResponse
} from '../types';
import APIClient from './api-client';
import { ConfigurationManager } from '../config';

/**
 * Base API class that provides common functionality for all API clients
 * 
 * This abstract class provides:
 * - Common CRUD operations (GET, POST, PUT, DELETE)
 * - Configuration management
 * - Error handling
 * - Response processing
 * - Model instantiation
 * 
 * @template T - The interface type for the entity
 * @template M - The model class type
 * @template GetPayload - The payload type for GET responses
 * @template CreatePayload - The payload type for POST responses
 */
export abstract class BaseAPI<
    T,
    M,
    GetPayload = any,
    CreatePayload = any
> {
    protected client: APIClient;
    protected configManager: ConfigurationManager;
    protected uri: string;
    protected ModelClass: new (data: Partial<T>, uri?: string) => M;

    /**
     * Creates a new Base API instance
     * 
     * @param uri - The API endpoint path (e.g., '/user', '/agent')
     * @param ModelClass - The model class constructor to use for creating instances
     */
    constructor(uri: string, ModelClass: new (data: Partial<T>) => M) {
        this.configManager = ConfigurationManager.getInstance();
        this.client = new APIClient();
        this.uri = uri;
        this.ModelClass = ModelClass;
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
     * @returns Promise that resolves to an array of entities, a single entity, or null
     */
    async get(params?: QueryParams, id?: string): Promise<M[] | M | null> {
        try {
            let uri = this.uri;
            if (id) uri = `${uri}/${id}`;
            
            const response = await this.client.GET<GetPayload>(uri, params);

            // Handle the case where response might be undefined or null
            if (!response || !response.data) {
                throw new Error('Invalid response from API');
            }

            const { data, error } = response;

            if (error) {
                throw new Error(String(error.message || 'Unknown error'));
            }
            
            // Handle array response (list of entities)
            if (Array.isArray(data)) {
                return data.map((item) => new this.ModelClass(item, uri));
            }
            
            // Handle single entity response
            if (data) {
                return new this.ModelClass(data, uri);
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
     * @param entity - Entity data for the new entity (ID will be generated)
     * @returns Promise that resolves to the created entity
     */
    async create(entity: Omit<T, 'id'>): Promise<M> {
        try {
            const response = await this.client.POST<CreatePayload>(this.uri, entity);

            // Handle the case where response might be undefined or null
            if (!response || !response.data) {
                throw new Error('Invalid response from API');
            }
            const { data, error } = response;

            if (error) {
                throw new Error(String(error.message || 'Unknown error'));
            }
            
            return new this.ModelClass(data);
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
} 