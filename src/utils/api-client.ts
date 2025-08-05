import MosaiaAuth from '../auth/auth';
import {
    MosaiaConfig,
    APIResponse,
    ErrorResponse
} from '../types';
import { DEFAULT_CONFIG, ConfigurationManager } from '../config';
import { isTimestampExpired } from '../utils';

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
    private baseURL: string = '';
    private headers: Record<string, string> = {};
    private configManager: ConfigurationManager;
    private config?: MosaiaConfig;

    /**
     * Creates a new API client instance
     * 
     * Uses the ConfigurationManager to get configuration settings.
     * No longer requires config parameter as it uses the centralized configuration.
     */
    constructor(config?: MosaiaConfig) {
        if (config) this.config = config;
        this.configManager = ConfigurationManager.getInstance();
        this.initializeClient();
    }

    /**
     * Initialize the client with current configuration
     * 
     * @private
     */
    private async initializeClient(): Promise<void> {
        try {
            let config = this.config;

            if (!this.config) config = this.configManager.getConfig();        
            // Parse and validate expiration timestamp if it exists
            if (config?.session?.exp && isTimestampExpired(config.session.exp)) {
                const auth = new MosaiaAuth();

                const refreshedConfig = await auth.refreshToken();
                this.configManager.setConfig(refreshedConfig);
                config = refreshedConfig;
            }

            if (!config) throw new Error('No valid config found');

            this.baseURL = `${config.apiURL || DEFAULT_CONFIG.API.BASE_URL}/v${config.version || DEFAULT_CONFIG.API.VERSION}`;
            this.headers = {
                'Authorization': `${DEFAULT_CONFIG.AUTH.TOKEN_PREFIX} ${config.apiKey || ''}`,
                'Content-Type': DEFAULT_CONFIG.API.CONTENT_TYPE,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update the client configuration
     * 
     * Reinitializes the client with updated configuration.
     * This is useful when configuration changes at runtime.
     * 
     * @private
     */
    private async updateClientConfig(): Promise<void> {
        try {
            await this.initializeClient();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Handles HTTP errors and converts them to standardized error responses
     * 
     * @param error - Error object
     * @param status - HTTP status code
     * @returns Promise that rejects with a standardized error response
     * @private
     */
    private handleError(error: Error, status?: number): Promise<never> {
        const errorResponse: ErrorResponse = {
            message: error.message || DEFAULT_CONFIG.ERRORS.UNKNOWN_ERROR,
            code: 'UNKNOWN_ERROR',
            status: status || DEFAULT_CONFIG.ERRORS.DEFAULT_STATUS_CODE,
        };
        return Promise.reject(errorResponse);
    }

    /**
     * Builds query string from parameters object
     * 
     * @param params - Query parameters object
     * @returns URLSearchParams string
     * @private
     */
    private buildQueryString(params?: object): string {
        if (!params) return '';
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        return searchParams.toString();
    }

    /**
     * Makes an HTTP request using fetch API
     * 
     * @param method - HTTP method
     * @param path - API endpoint path
     * @param data - Request body data
     * @param params - Query parameters
     * @returns Promise that resolves to the API response data
     * @private
     */
    private async makeRequest<T>(
        method: string, 
        path: string, 
        data?: object, 
        params?: object
    ): Promise<APIResponse<T> | any> {
        // Update client config in case it changed
        await this.updateClientConfig();
        const url = new URL(this.baseURL + path);
        
        if (params) {
            const queryString = this.buildQueryString(params);
            if (queryString) {
                url.search = queryString;
            }
        }

        const requestOptions: RequestInit = {
            method: method.toUpperCase(),
            headers: this.headers,
        };

        if (data && method !== 'GET') {
            requestOptions.body = JSON.stringify(data);
        }        

        // Log request if verbose mode is enabled
        if (this.config?.verbose) {
            console.log(`🚀 HTTP Request: ${method.toUpperCase()} ${url.toString()}`);
            console.log('🔑 Headers:', this.headers);
    
            if (params) {
                console.log('📋 Query Params:', params);
            }
            if (data) {
                console.log('📦 Request Body:', data);
            }
        }

        try {
            const response = await fetch(url.toString(), requestOptions);

            // Log response if verbose mode is enabled
            if (this.config?.verbose) {
                console.log(`✅ HTTP Response: ${response.status} ${method.toUpperCase()} ${path}`);
            }

            // Handle 204 No Content responses
            if (response.status === 204) {
                if (this.config?.verbose) {
                    console.log('📄 Response Data: No Content (204)');
                }
                return undefined as T;
            }

            // Check if response is ok (status in 200-299 range)
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: response.statusText };
                }

                if (this.config?.verbose) {
                    console.error(`❌ HTTP Error: ${response.status} ${method.toUpperCase()} ${path}`);
                    console.error('🚨 Error Details:', {
                        message: errorData.message || response.statusText,
                        status: response.status,
                        statusText: response.statusText,
                        data: errorData
                    });
                    
                    // Log meta and error parameters if they exist in error response
                    if (errorData?.meta) {
                        console.log('📊 Response Meta:', errorData.meta);
                    }
                    if (errorData?.error) {
                        console.log('🚨 Response Error:', errorData.error);
                    }
                }

                return this.handleError(
                    new Error(errorData.message || response.statusText), 
                    response.status
                );
            }

            // Parse response data
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (this.config?.verbose) {
                console.log('📄 Response Data:', responseData);
                
                // Log meta and error parameters if they exist
                if (responseData?.meta) {
                    console.log('📊 Response Meta:', responseData.meta);
                }
                if (responseData?.error) {
                    console.log('🚨 Response Error:', responseData.error);
                }
            }

            // If response has an error parameter, reject the promise
            if (responseData?.error) {
                return Promise.reject(responseData.error);
            }

            if (responseData?.error) delete responseData.error;
            if (responseData?.meta) delete responseData.meta;

            // Return only the data and paging portion
            return responseData;
        } catch (error) {
            if (this.config?.verbose) {
                console.error(`❌ Request Error: ${method.toUpperCase()} ${path}`, error);
            }
            throw error;
        }
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
        return this.makeRequest<T>('GET', path, undefined, params);
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
        return this.makeRequest<T>('POST', path, data);
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
        return this.makeRequest<T>('PUT', path, data);
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
        return this.makeRequest<T>('DELETE', path, undefined, params);
    }
}