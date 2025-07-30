import axios, { AxiosInstance, AxiosError } from 'axios';
import { MosaiaConfig, APIResponse, ErrorResponse } from '../types';
import { DEFAULT_CONFIG, ConfigurationManager } from '../config';

/**
 * Internal API client for making HTTP requests to the Mosaia API
 * 
 * This class handles all HTTP communication with the Mosaia API, including
 * request configuration, error handling, and response processing.
 * 
 * @example
 * ```typescript
 * const client = new APIClient();
 * const users = await client.GET<UserInterface[]>('/user');
 * const newUser = await client.POST<UserInterface>('/user', userData);
 * ```
 */
export default class APIClient {
    private client!: AxiosInstance;
    private configManager: ConfigurationManager;

    /**
     * Creates a new API client instance
     * 
     * Uses the ConfigurationManager to get configuration settings.
     * No longer requires config parameter as it uses the centralized configuration.
     */
    constructor() {
        this.configManager = ConfigurationManager.getInstance();
        this.initializeClient();
    }

    /**
     * Initialize the Axios client with current configuration
     * 
     * @private
     */
    private initializeClient(): void {
        const config = this.configManager.getConfig();
        
        this.client = axios.create({
            baseURL: `${config.apiURL || DEFAULT_CONFIG.API.BASE_URL}/v${config.version || DEFAULT_CONFIG.API.VERSION}`,
            headers: {
                'Authorization': `${DEFAULT_CONFIG.AUTH.TOKEN_PREFIX} ${config.apiKey || ''}`,
                'Content-Type': DEFAULT_CONFIG.API.CONTENT_TYPE,
            },
        });

        // Add request interceptor for logging (only if enabled)
        if (config.verbose) {
            this.client.interceptors.request.use(
                (config) => {
                    console.log(`🚀 HTTP Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
                    if (config.params) {
                        console.log('📋 Query Params:', config.params);
                    }
                    if (config.data) {
                        console.log('📦 Request Body:', config.data);
                    }
                    return config;
                },
                (error) => {
                    console.error('❌ Request Error:', error);
                    return Promise.reject(error);
                }
            );

            // Add response interceptor for logging and error handling
            this.client.interceptors.response.use(
                (response) => {
                    console.log(`✅ HTTP Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
                    console.log('📄 Response Data:', response.data);
                    return response;
                },
                (error: AxiosError) => {
                    console.error(`❌ HTTP Error: ${error.response?.status || 'NO_STATUS'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
                    console.error('🚨 Error Details:', {
                        message: error.message,
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data
                    });
                    return this.handleError(error);
                }
            );
        } else {
            // Add response interceptor for error handling only (no logging)
            this.client.interceptors.response.use(
                (response) => response,
                (error: AxiosError) => this.handleError(error)
            );
        }
    }

    /**
     * Get the current configuration
     * 
     * @returns The current configuration object
     * @private
     */
    private get config(): MosaiaConfig {
        return this.configManager.getConfig();
    }

    /**
     * Update the client configuration
     * 
     * Reinitializes the Axios client with updated configuration.
     * This is useful when configuration changes at runtime.
     * 
     * @private
     */
    private updateClientConfig(): void {
        this.initializeClient();
    }

    /**
     * Handles HTTP errors and converts them to standardized error responses
     * 
     * @param error - Axios error object
     * @returns Promise that rejects with a standardized error response
     * @private
     */
    private handleError(error: AxiosError): Promise<never> {
        const errorResponse: ErrorResponse = {
            message: error.message || DEFAULT_CONFIG.ERRORS.UNKNOWN_ERROR,
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status || DEFAULT_CONFIG.ERRORS.DEFAULT_STATUS_CODE,
        };
        return Promise.reject(errorResponse);
    }

    /**
     * Makes a GET request to the API
     * 
     * @param path - API endpoint path (e.g., '/user', '/org')
     * @param params - Optional query parameters
     * @returns Promise that resolves to the API response data
     * 
     * @example
     * ```typescript
     * const users = await client.GET<UserInterface[]>('/user');
     * const user = await client.GET<UserInterface>('/user/123');
     * const filteredUsers = await client.GET<UserInterface[]>('/user', { limit: 10, offset: 0 });
     * ```
     */
    async GET<T>(path: string, params?: object): Promise<APIResponse<T> | any> {
        try {
            // Update client config in case it changed
            this.updateClientConfig();
            
            const res = await this.client.get(path, { params });

            return Promise.resolve(res.data);
        } catch (error) { 
            return Promise.reject(error);
        }
    }

    /**
     * Makes a POST request to the API
     * 
     * @param path - API endpoint path (e.g., '/user', '/org')
     * @param data - Request body data
     * @returns Promise that resolves to the API response data
     * 
     * @example
     * ```typescript
     * const newUser = await client.POST<UserInterface>('/user', {
     *   email: 'user@example.com',
     *   first_name: 'John',
     *   last_name: 'Doe'
     * });
     * ```
     */
    async POST<T>(path: string, data?: object): Promise<APIResponse<T> | any> {
        try {
            // Update client config in case it changed
            this.updateClientConfig();
            
            const res = await this.client.post(path, data);

            return Promise.resolve(res.data);
        } catch (error) { 
            return Promise.reject(error);
        }
    }
    
    /**
     * Makes a PUT request to the API
     * 
     * @param path - API endpoint path (e.g., '/user/123', '/org/456')
     * @param data - Request body data for updates
     * @returns Promise that resolves to the API response data
     * 
     * @example
     * ```typescript
     * const updatedUser = await client.PUT<UserInterface>('/user/123', {
     *   first_name: 'Jane'
     * });
     * ```
     */
    async PUT<T>(path: string, data?: object): Promise<APIResponse<T> | any> {
        try {
            // Update client config in case it changed
            this.updateClientConfig();
            
            const res = await this.client.put(path, data);

            return Promise.resolve(res.data);
        } catch (error) { 
            return Promise.reject(error);
        }
    }

    /**
     * Makes a DELETE request to the API
     * 
     * @param path - API endpoint path (e.g., '/user/123', '/org/456')
     * @param params - Optional query parameters
     * @returns Promise that resolves to the API response data
     * 
     * @example
     * ```typescript
     * await client.DELETE<void>('/user/123');
     * await client.DELETE<void>('/org/456', { force: true });
     * ```
     */
    async DELETE<T>(path: string, params?: object): Promise<APIResponse<T> | any> {
        try {
            // Update client config in case it changed
            this.updateClientConfig();
            
            const res = await this.client.delete(path, { params });

            // Handle 204 No Content responses
            if (res.status === 204) {
                return Promise.resolve({
                    meta: {
                        status: 204,
                        message: 'Success'
                    },
                    data: undefined as T,
                    error: {
                        message: '',
                        code: '',
                        status: 204
                    }
                });
            }

            return Promise.resolve(res.data);
        } catch (error) { 
            return Promise.reject(error);
        }
    }
}