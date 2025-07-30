import APIClient from './api-client';
import {
    MosaiaConfig,
    AuthRequest,
    AuthResponse,
    OAuthErrorResponse
} from '../types';
import { ConfigurationManager } from '../config';

/**
 * Authentication API client for the Mosaia SDK
 * 
 * Provides methods for user authentication, token management, and session handling.
 * Supports multiple authentication flows including password-based, client credentials,
 * and token refresh operations.
 * 
 * @example
 * ```typescript
 * const auth = new Auth();
 * 
 * // Sign in with email and password
 * const mosaia = await auth.signInWithPassword('user@example.com', 'password', 'client-id');
 * 
 * // Sign in with client credentials
 * const mosaia = await auth.signInWithClient('client-id', 'client-secret');
 * 
 * // Refresh an existing token
 * const mosaia = await auth.refreshToken('refresh-token');
 * 
 * // Sign out
 * await auth.signOut('api-key');
 * ```
 */
export default class Auth {
    private client: APIClient;
    private configManager: ConfigurationManager;

    /**
     * Creates a new Authentication API client instance
     * 
     * Initializes the authentication client with a configuration manager
     * and API client for making HTTP requests to the Mosaia authentication endpoints.
     * 
     * Uses ConfigurationManager for configuration settings.
     */
    constructor() {
        this.configManager = ConfigurationManager.getInstance();
        this.client = new APIClient();
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
     * Sign in using email and password authentication
     * 
     * Authenticates a user with their email and password credentials.
     * Returns a configured Mosaia client instance with the obtained access token.
     * 
     * @param email - The user's email address
     * @param password - The user's password
     * @param clientId - The OAuth client ID for the application
     * @returns Promise that resolves to a configured Mosaia client instance
     * @throws {Error} When authentication fails or network errors occur
     * 
     * @example
     * ```typescript
     * const auth = new Auth();
     * try {
     *   const mosaiaConfig = await auth.signInWithPassword('user@example.com', 'password', 'client-id');
     *   mosaia.config = mosaiaConfig;
     *   console.log('Successfully authenticated');
     * } catch (error) {
     *   console.error('Authentication failed:', error.message);
     * }
     * ```
     */
    async signInWithPassword(email: string, password: string, clientId: string): Promise<MosaiaConfig> {
        const request: AuthRequest = {
            grant_type: 'password',
            email,
            password,
            client_id: clientId
        };

        try {
            const {
                data,
                error
            } = await this.client.POST<AuthResponse>('/auth/signin', request);

            if (error) {
                throw new Error(error.message);
            }

            return Promise.resolve({
                ...this.config,
                apiKey: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                sub: data.sub,
                iat: data.iat,
                exp: data.exp,
                authType: 'password' as const
            });
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Sign in using client credentials authentication
     * 
     * Authenticates an application using client ID and client secret.
     * This flow is typically used for server-to-server authentication
     * where no user interaction is required.
     * 
     * @param clientId - The OAuth client ID
     * @param clientSecret - The OAuth client secret
     * @returns Promise that resolves to a configured Mosaia client instance
     * @throws {Error} When authentication fails or network errors occur
     * 
     * @example
     * ```typescript
     * const auth = new Auth();
     * try {
     *   const mosaiaConfig = await auth.signInWithClient('client-id', 'client-secret');
     *   mosaia.config = mosaiaConfig;
     *   console.log('Successfully authenticated with client credentials');
     * } catch (error) {
     *   console.error('Client authentication failed:', error.message);
     * }
     * ```
     */
    async signInWithClient(clientId: string, clientSecret: string): Promise<MosaiaConfig> {
        const request: AuthRequest = {
            grant_type: 'client',
            client_id: clientId,
            client_secret: clientSecret
        };
        
        try {
            const {
                data,
                error
            } = await this.client.POST<AuthResponse>('/auth/signin', request);

            if (error) {
                throw new Error(error.message);
            }
            
            return Promise.resolve({
                ...this.config,
                apiKey: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                sub: data.sub,
                iat: data.iat,
                exp: data.exp,
                authType: 'client' as const
            });
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Refresh an access token using a refresh token
     * 
     * Obtains a new access token using an existing refresh token.
     * This method can be used to extend a user's session without requiring
     * them to re-enter their credentials.
     * 
     * @param token - Optional refresh token. If not provided, attempts to use
     *                the refresh token from the current configuration
     * @returns Promise that resolves to an updated MosaiaConfig
     * @throws {Error} When refresh token is missing or refresh fails
     * 
     * @example
     * ```typescript
     * const auth = new Auth();
     * try {
     *   // Use refresh token from config
     *   const mosaia = await auth.refreshToken();
     *   
     *   // Or provide a specific refresh token
     *   const mosaiaConfig = await auth.refreshToken('specific-refresh-token');
     *   mosaia.config = mosaiaConfig;
     * } catch (error) {
     *   console.error('Token refresh failed:', error.message);
     * }
     * ```
     */
    async refreshToken(token?: string): Promise<MosaiaConfig> {
        const refreshToken = token || this.config.refreshToken;

        if (!refreshToken) {
            throw new Error('Refresh token is required and not found in config');
        }

        const request: AuthRequest = {
            grant_type: 'refresh',
            refresh_token: refreshToken
        };
        
        try {
            const {
                data,
                error
            } = await this.client.POST<AuthResponse>('/auth/signin', request);

            if (error) {
                throw new Error(error.message);
            }

            return Promise.resolve({
                ...this.config,
                apiKey: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                sub: data.sub,
                iat: data.iat,
                exp: data.exp,
                authType: 'refresh' as const
            });
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Refreshes an OAuth access token using a refresh token
     * 
     * This method exchanges a refresh token for a new access token when the current
     * access token expires. This allows for long-term authentication without requiring
     * user re-authentication.
     * 
     * @param refreshToken - The refresh token received from the initial token exchange
     * @returns Promise that resolves to a new OAuth token response
     * @throws {OAuthErrorResponse} When the refresh fails (invalid refresh token, expired, etc.)
     * 
     * @example
     * ```typescript
     * // When access token expires, use refresh token to get new tokens
     * try {
     *   const mosaiaConfig = await oauth.refreshToken(refreshToken);
     *   mosaia.config = mosaiaConfig;
     *   console.log('New access token:', mosaiaConfig.apiKey);
     *   console.log('New refresh token:', mosaiaConfig.refreshToken);
     * } catch (error) {
     *   // Refresh token expired, user needs to re-authenticate
     *   console.error('Token refresh failed:', error);
     * }
     * ```
     */
    async refreshOAuthToken(refreshToken: string): Promise<MosaiaConfig> {
        const params = new URLSearchParams({
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        });

        try {
            const response = await fetch(`${this.config.apiURL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });
            const data = await response.json();

            return Promise.resolve({
                ...this.config,
                apiKey: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                sub: data.sub,
                iat: data.iat,
                exp: data.exp,
                authType: 'oauth' as const
            });
        } catch (error) {
            throw error as OAuthErrorResponse;
        }
    }

    /**
     * Sign out and invalidate the current session
     * 
     * Invalidates the current access token and clears the configuration.
     * This method should be called when a user logs out or when you want
     * to ensure the current session is terminated.
     * 
     * @param apiKey - Optional API key to sign out. If not provided, uses
     *                 the API key from the current configuration
     * @returns Promise that resolves when sign out is complete
     * @throws {Error} When API key is missing or sign out fails
     * 
     * @example
     * ```typescript
     * const auth = new Auth();
     * try {
     *   // Sign out using API key from config
     *   await auth.signOut();
     *   
     *   // Or provide a specific API key
     *   await auth.signOut('specific-api-key');
     *   console.log('Successfully signed out');
     * } catch (error) {
     *   console.error('Sign out failed:', error.message);
     * }
     * ```
     */
    async signOut(apiKey?: string): Promise<void> {
        const token = apiKey || this.config.apiKey;

        if (!token) {
            throw new Error('apiKey is required and not found in config');
        }

        try {
            await this.client.DELETE<void>('/auth/signout', { token });

            this.configManager.reset();
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }

    async refresh(): Promise<MosaiaConfig> {
        const config = this.config;

        if (!config) {
            throw new Error('No valid config found');
        }

        if (!config.refreshToken) {
            throw new Error('No refresh token found in config');
        }

        if (config.authType === 'oauth') {
            return this.refreshToken(config.refreshToken);
        }

        return this.refreshToken(config.refreshToken);
    }
} 