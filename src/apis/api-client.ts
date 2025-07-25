import axios, { AxiosInstance, AxiosError } from 'axios';
import { MosiaConfig, APIResponse, ErrorResponse } from '../types';
import { DEFAULT_CONFIG } from '../config';

/**
 * Internal API client for making HTTP requests to the Mosaia API
 * 
 * This class handles all HTTP communication with the Mosaia API, including
 * request configuration, error handling, and response processing.
 * 
 * @example
 * ```typescript
 * const client = new APIClient(config);
 * const users = await client.GET<UserInterface[]>('/user');
 * const newUser = await client.POST<UserInterface>('/user', userData);
 * ```
 */
export default class APIClient {
    private client: AxiosInstance;
    private config: MosiaConfig;

    /**
     * Creates a new API client instance
     * 
     * @param config - Configuration object containing API settings
     * @param config.apiURL - Base URL for API requests
     * @param config.apiKey - API key for authentication
     */
    constructor(config: MosiaConfig) {
        this.config = config;
        this.client = axios.create({
            baseURL: config.apiURL,
            headers: {
                'Authorization': `${DEFAULT_CONFIG.AUTH.TOKEN_PREFIX} ${config.apiKey}`,
                'Content-Type': DEFAULT_CONFIG.API.CONTENT_TYPE,
            },
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => this.handleError(error)
        );
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
    async GET<T>(path: string, params?: object): Promise<APIResponse<T>> {
        try {
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
    async POST<T>(path: string, data?: object): Promise<APIResponse<T>> {
        try {
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
    async PUT<T>(path: string, data?: object): Promise<APIResponse<T>> {
        try {
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
    async DELETE<T>(path: string, params?: object): Promise<APIResponse<T>> {
        try {
            const res = await this.client.delete(path, { params });

            return Promise.resolve(res.data);
        } catch (error) { 
            return Promise.reject(error);
        }
    }
}