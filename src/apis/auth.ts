import APIClient from './api-client';
import Mosaia from '../index';
import { MosiaConfig, AuthRequest, AuthResponse, APIResponse } from '../types';
import { ConfigurationManager } from '../config';

/**
 * Authentication API client for managing user authentication
 * 
 * This class provides methods for user authentication, including sign in,
 * sign out, token refresh, and session management. Supports multiple
 * authentication flows including password-based and client credentials.
 * 
 * @example
 * ```typescript
 * const auth = new Auth();
 * 
 * // Sign in with password
 * const authResponse = await auth.signInWithPassword(
 *   'user@example.com',
 *   'password',
 *   'client-id'
 * );
 * 
 * // Sign in with client credentials
 * const authResponse = await auth.signInWithClient(
 *   'client-id',
 *   'client-secret'
 * );
 * 
 * // Refresh token
 * const newAuth = await auth.refreshToken('refresh-token');
 * ```
 */
export default class Auth {
    private client: APIClient;
    private configManager: ConfigurationManager;

    /**
     * Creates a new Authentication API client instance
     * 
     * Uses ConfigurationManager for configuration settings.
     */
    constructor() {
        this.configManager = ConfigurationManager.getInstance();
        this.client = new APIClient();
    }

    /**
     * Get the current configuration
     */
    private get config(): MosiaConfig {
        return this.configManager.getConfig();
    }

    /**
     * Sign in with email and password
     * 
     * Authenticates a user using their email address and password.
     * Returns an access token and refresh token for subsequent API calls.
     * 
     * @param email - User's email address
     * @param password - User's password
     * @param clientId - OAuth client ID
     * @returns Promise that resolves to authentication response with tokens
     * 
     * @example
     * ```typescript
     * const authResponse = await auth.signInWithPassword(
     *   'user@example.com',
     *   'secure-password',
     *   'client-123'
     * );
     * 
     * console.log('Access token:', authResponse.data.access_token);
     * console.log('Refresh token:', authResponse.data.refresh_token);
     * ```
     */
    async signInWithPassword(email: string, password: string, clientId: string): Promise<Mosaia> {
        const request: AuthRequest = {
            grant_type: 'password',
            email,
            password,
            client_id: clientId
        };

        try {
            const {
                meta,
                data,
                error
            } = await this.client.POST<AuthResponse>('/auth/signin', request);

            if (error) {
                throw new Error(error.message);
            }

            const config = {
                ...this.config,
                apiKey: data.access_token,
                refreshToken: data.refresh_token
            }
            return Promise.resolve(new Mosaia(config));
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Sign in with client credentials
     * 
     * Authenticates using OAuth client credentials flow. This is typically
     * used for server-to-server authentication or API access.
     * 
     * @param clientId - OAuth client ID
     * @param clientSecret - OAuth client secret
     * @returns Promise that resolves to authentication response with tokens
     * 
     * @example
     * ```typescript
     * const authResponse = await auth.signInWithClient(
     *   'client-123',
     *   'client-secret-456'
     * );
     * 
     * console.log('Access token:', authResponse.data.access_token);
     * ```
     */
    async signInWithClient(clientId: string, clientSecret: string): Promise<APIResponse<AuthResponse>> {
        const request: AuthRequest = {
            grant_type: 'client',
            client_id: clientId,
            client_secret: clientSecret
        };
        
        try {
            const response = await this.client.POST<AuthResponse>('/auth/signin', request);
            return response;
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Refresh an access token
     * 
     * Exchanges a refresh token for a new access token when the current
     * access token expires.
     * 
     * @param refreshToken - The refresh token to exchange
     * @returns Promise that resolves to new authentication response
     * 
     * @example
     * ```typescript
     * const newAuth = await auth.refreshToken('refresh-token-here');
     * console.log('New access token:', newAuth.data.access_token);
     * ```
     */
    async refreshToken(refreshToken: string): Promise<APIResponse<AuthResponse>> {
        const request: AuthRequest = {
            grant_type: 'refresh',
            refresh_token: refreshToken
        };
        return this.client.POST<AuthResponse>('/auth/signin', request);
    }

    /**
     * Sign out and invalidate tokens
     * 
     * Signs out the current user and invalidates their access token.
     * Optionally accepts a specific token to invalidate.
     * 
     * @param token - Optional specific token to invalidate
     * @returns Promise that resolves when sign out is successful
     * 
     * @example
     * ```typescript
     * // Sign out current session
     * await auth.signOut();
     * 
     * // Sign out specific token
     * await auth.signOut('specific-token-to-invalidate');
     * ```
     */
    async signOut(token?: string): Promise<APIResponse<void>> {
        if (token) {
            return this.client.DELETE<void>('/auth/signout', { token });
        }
        return this.client.DELETE<void>('/auth/signout');
    }

    /**
     * Get current session information
     * 
     * Retrieves information about the current authenticated session.
     * 
     * @returns Promise that resolves to session information
     * 
     * @example
     * ```typescript
     * const session = await auth.getSession();
     * console.log('Session info:', session.data);
     * ```
     */
    async getSession(): Promise<APIResponse<any>> {
        return this.client.GET<any>('/session');
    }

    /**
     * Get current user information
     * 
     * Retrieves information about the currently authenticated user.
     * 
     * @returns Promise that resolves to user information
     * 
     * @example
     * ```typescript
     * const self = await auth.getSelf();
     * console.log('User info:', self.data);
     * ```
     */
    async getSelf(): Promise<APIResponse<any>> {
        return this.client.GET<any>('/self');
    }
} 