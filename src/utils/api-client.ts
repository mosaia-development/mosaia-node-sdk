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
 * This class provides a centralized HTTP client for all API communication
 * with the Mosaia platform. It handles authentication, request formatting,
 * response processing, and error handling in a consistent manner.
 * 
 * Features:
 * - Automatic authentication header management
 * - Token refresh handling
 * - Request/response standardization
 * - Error handling and formatting
 * - Query parameter building
 * - Content type management
 * 
 * @remarks
 * The APIClient uses the ConfigurationManager for settings and automatically
 * handles token refresh when needed. It supports all standard HTTP methods
 * and provides type-safe responses through generics.
 * 
 * @example
 * Basic usage:
 * ```typescript
 * const client = new APIClient();
 * 
 * // GET request
 * const users = await client.GET<UserInterface[]>('/user');
 * 
 * // POST request
 * const newUser = await client.POST<UserInterface>('/user', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * 
 * // PUT request
 * const updatedUser = await client.PUT<UserInterface>('/user/123', {
 *   name: 'John Smith'
 * });
 * 
 * // DELETE request
 * await client.DELETE('/user/123');
 * ```
 * 
 * @example
 * With query parameters:
 * ```typescript
 * // GET with query parameters
 * const filteredUsers = await client.GET<UserInterface[]>('/user', {
 *   limit: 10,
 *   offset: 0,
 *   search: 'john',
 *   active: true
 * });
 * 
 * // DELETE with parameters
 * await client.DELETE('/user/123', {
 *   force: true,
 *   reason: 'account_deletion'
 * });
 * ```
 * 
 * @example
 * Error handling:
 * ```typescript
 * try {
 *   const user = await client.GET<UserInterface>('/user/123');
 *   console.log('User:', user.data);
 * } catch (error) {
 *   console.error('API Error:', error.message);
 *   console.error('Status:', error.status);
 *   console.error('Code:', error.code);
 * }
 * ```
 * 
 * @category Utilities
 */
export default class APIClient {
    private baseURL: string = '';
    private headers: Record<string, string> = {};
    private configManager: ConfigurationManager;
    private config?: MosaiaConfig;
    private skipTokenRefresh: boolean = false;

    /**
     * Creates a new API client instance
     * 
     * Initializes the API client with configuration from the ConfigurationManager.
     * The client automatically handles authentication and token refresh.
     * 
     * @param config - Optional configuration object (if not provided, uses ConfigurationManager)
     * @param skipTokenRefresh - Skip token refresh check to prevent circular dependencies
     * 
     * @example
     * Basic initialization:
     * ```typescript
     * const client = new APIClient();
     * ```
     * 
     * @example
     * With custom config:
     * ```typescript
     * const client = new APIClient({
     *   apiKey: 'your-api-key',
     *   apiURL: 'https://api.mosaia.ai',
     *   version: '1'
     * });
     * ```
     * 
     * @example
     * Skip token refresh (for auth flows):
     * ```typescript
     * const client = new APIClient(config, true);
     * ```
     */
    constructor(config?: MosaiaConfig, skipTokenRefresh: boolean = false) {
        if (config) this.config = config;
        this.configManager = ConfigurationManager.getInstance();
        this.skipTokenRefresh = skipTokenRefresh;
        this.initializeClient(skipTokenRefresh);
    }

    /**
     * Initialize the client with current configuration
     * 
     * Sets up the base URL, headers, and authentication for the API client.
     * Handles token refresh if the current token is expired.
     * 
     * @param skipTokenRefresh - Skip token refresh check to prevent circular dependencies
     * @private
     */
    private async initializeClient(skipTokenRefresh?: boolean): Promise<void> {
        try {
            let config = this.config;

            if (!this.config) config = this.configManager.getConfig();        
            // Parse and validate expiration timestamp if it exists
            // Skip token refresh check when called from MosaiaAuth to prevent circular dependency
            const shouldSkipRefresh = skipTokenRefresh !== undefined ? skipTokenRefresh : this.skipTokenRefresh;
            if (!shouldSkipRefresh && config?.session?.exp && isTimestampExpired(config.session.exp)) {
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
     * Reinitializes the client with updated configuration settings.
     * This is useful when configuration changes at runtime, such as
     * when tokens are refreshed or API settings are updated.
     * 
     * @private
     */
    private async updateClientConfig(): Promise<void> {
        try {
            await this.initializeClient(this.skipTokenRefresh);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Handles HTTP errors and converts them to standardized error responses
     * 
     * This method processes various types of errors and converts them to a
     * consistent format for error handling throughout the SDK.
     * 
     * @param error - Error object from HTTP request
     * @param status - HTTP status code (optional)
     * @returns Promise that rejects with a standardized error response
     * 
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
     * Retrieves data from the specified API endpoint. Supports query parameters
     * for filtering, pagination, and other request options.
     * 
     * @template T - The expected response data type
     * @param path - API endpoint path (e.g., '/user', '/org', '/agent')
     * @param params - Optional query parameters for filtering and pagination
     * @returns Promise that resolves to the API response data
     * 
     * @example
     * Basic GET request:
     * ```typescript
     * const users = await client.GET<UserInterface[]>('/user');
     * const user = await client.GET<UserInterface>('/user/123');
     * ```
     * 
     * @example
     * With query parameters:
     * ```typescript
     * const filteredUsers = await client.GET<UserInterface[]>('/user', {
     *   limit: 10,
     *   offset: 0,
     *   search: 'john',
     *   active: true
     * });
     * 
     * const userAgents = await client.GET<AgentInterface[]>('/agent', {
     *   user: 'user-123',
     *   tags: ['support', 'ai']
     * });
     * ```
     * 
     * @example
     * Error handling:
     * ```typescript
     * try {
     *   const user = await client.GET<UserInterface>('/user/123');
     *   console.log('User data:', user.data);
     * } catch (error) {
     *   console.error('Failed to fetch user:', error.message);
     * }
     * ```
     */
    async GET<T>(path: string, params?: object): Promise<APIResponse<T> | any> {
        return this.makeRequest<T>('GET', path, undefined, params);
    }

    /**
     * Makes a POST request to the API
     * 
     * Creates new resources or performs actions that require data submission.
     * The request body is automatically serialized as JSON.
     * 
     * @template T - The expected response data type
     * @param path - API endpoint path (e.g., '/user', '/org', '/agent')
     * @param data - Request body data to be sent
     * @returns Promise that resolves to the API response data
     * 
     * @example
     * Create a new user:
     * ```typescript
     * const newUser = await client.POST<UserInterface>('/user', {
     *   email: 'user@example.com',
     *   first_name: 'John',
     *   last_name: 'Doe'
     * });
     * ```
     * 
     * @example
     * Create an AI agent:
     * ```typescript
     * const agent = await client.POST<AgentInterface>('/agent', {
     *   name: 'Support Assistant',
     *   model: 'gpt-4',
     *   temperature: 0.7,
     *   system_prompt: 'You are a helpful support agent.'
     * });
     * ```
     * 
     * @example
     * Perform an action:
     * ```typescript
     * const result = await client.POST<ChatCompletionResponse>('/agent/123/chat', {
     *   messages: [
     *     { role: 'user', content: 'Hello, how can you help me?' }
     *   ],
     *   temperature: 0.7
     * });
     * ```
     */
    async POST<T>(path: string, data?: object): Promise<APIResponse<T> | any> {
        return this.makeRequest<T>('POST', path, data);
    }
    
    /**
     * Makes a PUT request to the API
     * 
     * Updates existing resources with new data. The request body is automatically
     * serialized as JSON and sent to the specified endpoint.
     * 
     * @template T - The expected response data type
     * @param path - API endpoint path (e.g., '/user/123', '/org/456', '/agent/789')
     * @param data - Request body data for updates
     * @returns Promise that resolves to the API response data
     * 
     * @example
     * Update user profile:
     * ```typescript
     * const updatedUser = await client.PUT<UserInterface>('/user/123', {
     *   first_name: 'Jane',
     *   last_name: 'Smith',
     *   email: 'jane.smith@example.com'
     * });
     * ```
     * 
     * @example
     * Update agent configuration:
     * ```typescript
     * const updatedAgent = await client.PUT<AgentInterface>('/agent/789', {
     *   temperature: 0.5,
     *   system_prompt: 'You are a technical support specialist.',
     *   tags: ['support', 'technical']
     * });
     * ```
     * 
     * @example
     * Update organization settings:
     * ```typescript
     * const updatedOrg = await client.PUT<OrganizationInterface>('/org/456', {
     *   name: 'Updated Corp Name',
     *   short_description: 'Updated description',
     *   active: true
     * });
     * ```
     */
    async PUT<T>(path: string, data?: object, params?: object): Promise<APIResponse<T> | any> {
        return this.makeRequest<T>('PUT', path, data, params);
    }

    /**
     * Makes a DELETE request to the API
     * 
     * Removes resources from the system. Supports optional query parameters
     * for additional deletion options like force deletion or soft deletion.
     * 
     * @template T - The expected response data type
     * @param path - API endpoint path (e.g., '/user/123', '/org/456', '/agent/789')
     * @param params - Optional query parameters for deletion options
     * @returns Promise that resolves to the API response data
     * 
     * @example
     * Basic deletion:
     * ```typescript
     * await client.DELETE<void>('/user/123');
     * await client.DELETE<void>('/agent/789');
     * ```
     * 
     * @example
     * Force deletion:
     * ```typescript
     * await client.DELETE<void>('/org/456', { force: true });
     * await client.DELETE<void>('/user/123', { 
     *   force: true, 
     *   reason: 'account_deletion' 
     * });
     * ```
     * 
     * @example
     * Soft deletion:
     * ```typescript
     * await client.DELETE<void>('/agent/789', { 
     *   soft: true,
     *   archive: true 
     * });
     * ```
     */
    async DELETE<T>(path: string, params?: object): Promise<APIResponse<T> | any> {
        return this.makeRequest<T>('DELETE', path, undefined, params);
    }
}