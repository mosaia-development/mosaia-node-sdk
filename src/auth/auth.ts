import APIClient from '../utils/api-client';
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
 * Provides the authentication flows used to obtain a session:
 * - Password-based authentication
 * - Client credentials authentication
 * - Token refresh operations
 * - OAuth token management
 * - Sign out / session teardown
 *
 * The canonical entry point is the `auth` getter on {@link MosaiaClient}. Every
 * getter returns a `MosaiaAuth` bound to the client's current configuration —
 * you should not normally construct `MosaiaAuth` directly.
 *
 * @remarks
 * Every sign-in method returns a new {@link MosaiaConfig} with the access token
 * populated into `apiKey` (that's what the request-signing layer reads) and a
 * structured `session` object carrying refresh token, expiry, and identity.
 * Pass the returned config into a new `MosaiaClient` to get an authenticated
 * client.
 *
 * @example
 * Client credentials (server-side, recommended for backends):
 * ```typescript
 * import * as Mosaia from '@mosaia/mosaia-node-sdk';
 *
 * // 1. Initialize an unauthenticated client — credentials do not need to be
 * //    in config for client credentials; pass them directly to signInWithClient.
 * const mosaia = new Mosaia.MosaiaClient({
 *   apiURL: 'https://api.mosaia.ai'
 * });
 *
 * // 2. Exchange the credentials for a session via the `auth` getter.
 * const authenticatedConfig = await mosaia.auth.signInWithClient(
 *   process.env.MOSAIA_CLIENT_ID!,
 *   process.env.MOSAIA_CLIENT_SECRET!
 * );
 *
 * // 3. Build the authenticated client. Use this one for every subsequent call.
 * const authedMosaia = new Mosaia.MosaiaClient(authenticatedConfig);
 * ```
 *
 * @example
 * Password grant (requires `clientId` on the config):
 * ```typescript
 * const mosaia = new Mosaia.MosaiaClient({
 *   clientId: process.env.MOSAIA_CLIENT_ID!
 * });
 *
 * const authenticatedConfig = await mosaia.auth.signInWithPassword(
 *   'user@example.com',
 *   'password'
 * );
 *
 * const authedMosaia = new Mosaia.MosaiaClient(authenticatedConfig);
 * ```
 *
 * @example
 * Token refresh and sign out on the authenticated client:
 * ```typescript
 * // Refresh uses the refresh token from `authedMosaia.config.session`
 * authedMosaia.config = await authedMosaia.auth.refreshToken();
 *
 * // Tear down the session
 * await authedMosaia.auth.signOut();
 * ```
 *
 * @category Authentication
 */
export default class MosaiaAuth {
    private apiClient: APIClient;
    private configManager?: ConfigurationManager;
    private config?: MosaiaConfig;

    /**
     * Creates a new Authentication API client instance
     * 
     * Initializes the authentication client with an optional configuration.
     * If no configuration is provided, it uses the ConfigurationManager to
     * get the current configuration.
     * 
     * @param config - Optional configuration object. If omitted, the singleton
     *                 {@link ConfigurationManager} is consulted.
     * @param config.apiKey - API key for authentication
     * @param config.apiURL - Base URL for API requests
     * @param config.clientId - OAuth client ID
     * @param config.session - Current session information
     *
     * @remarks
     * Prefer `mosaia.auth` on an existing {@link MosaiaClient} over
     * `new MosaiaAuth(...)` — the getter wires the correct config automatically.
     * Direct construction is supported for advanced cases (e.g. scripts that
     * don't hold a MosaiaClient reference).
     *
     * @example
     * ```typescript
     * // Preferred: use the `auth` getter on a MosaiaClient. Credentials are
     * // passed as arguments to signInWithClient — no need to put them in config.
     * const mosaia = new MosaiaClient({ apiURL: 'https://api.mosaia.ai' });
     * const authenticatedConfig = await mosaia.auth.signInWithClient(
     *   process.env.MOSAIA_CLIENT_ID!,
     *   process.env.MOSAIA_CLIENT_SECRET!
     * );
     * const authedMosaia = new MosaiaClient(authenticatedConfig);
     * ```
     *
     * @example
     * ```typescript
     * // Direct construction — uses the global ConfigurationManager by default
     * const auth = new MosaiaAuth();
     *
     * // Or with an explicit config
     * const auth = new MosaiaAuth({
     *   apiURL: 'https://api.mosaia.ai',
     *   clientId: 'your-client-id'
     * });
     * ```
     *
     * @throws {Error} When required configuration values are missing
     */
    constructor(config?: MosaiaConfig) {
        this.config = config;
        if (!this.config) {
            this.configManager = ConfigurationManager.getInstance();
            this.config = this.configManager.getConfig();
        }
        // Skip token refresh to prevent circular dependency
        this.apiClient = new APIClient(this.config, true);
    }

    /**
     * Sign in using email and password authentication
     * 
     * Authenticates a user with their email and password credentials.
     * Returns a configured Mosaia client instance with the obtained access token.
     * 
     * @param email - The user's email address
     * @param password - The user's password
     * @returns Promise that resolves to a configured Mosaia client instance
     * 
     * @remarks
     * The `clientId` is automatically retrieved from the configuration.
     * Ensure the configuration has a `clientId` set before calling this method.
     * 
     * @throws {Error} When authentication fails or network errors occur
     * @throws {Error} When clientId is not found in configuration
     * 
     * @example
     * ```typescript
     * // 1. Unauthenticated client with clientId in the config
     * const mosaia = new MosaiaClient({
     *   clientId: process.env.MOSAIA_CLIENT_ID!
     * });
     *
     * try {
     *   // 2. Exchange email + password for a session via the `auth` getter
     *   const authenticatedConfig = await mosaia.auth.signInWithPassword(
     *     'user@example.com',
     *     'password'
     *   );
     *
     *   // 3. Build the authenticated client
     *   const authedMosaia = new MosaiaClient(authenticatedConfig);
     * } catch (error) {
     *   console.error('Authentication failed:', error.message);
     * }
     * ```
     */
    async signInWithPassword(email: string, password: string): Promise<MosaiaConfig> {
        const config = this.config;

        if (!config) {
            throw new Error('No config found');
        }
        const clientId = config.clientId;

        if (!clientId) {
            throw new Error('clientId is required and not found in config');
        }

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
            } = await this.apiClient.POST<AuthResponse>('/auth/signin', request);

            if (error) {
                throw new Error(error.message);
            }

            const sesson = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                sub: data.sub,
                iat: data.iat,
                exp: data.exp,
                authType: 'password' as const
            };

            return Promise.resolve({
                ...this.config,
                apiKey: sesson.accessToken,
                session: sesson
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
     * Authenticates an application using a client ID and client secret. This is
     * the standard flow for server-to-server access (cron jobs, background
     * workers, CI).
     *
     * @param clientId - The OAuth client ID (the `name` of a Mosaia Client resource)
     * @param clientSecret - The OAuth client secret (returned only once on Client create)
     * @returns Promise that resolves to a {@link MosaiaConfig} carrying the new session
     * @throws {Error} When authentication fails or network errors occur
     *
     * @remarks
     * `clientId` / `clientSecret` are passed as arguments — you do not need to
     * put them on the `MosaiaConfig`. Run this three-step flow to get a bearer
     * token:
     *
     *   1. Initialize an unauthenticated {@link MosaiaClient}.
     *   2. Call `mosaia.auth.signInWithClient(clientId, clientSecret)`.
     *   3. Construct a new `MosaiaClient` with the returned authenticated config.
     *
     * @example
     * ```typescript
     * import * as Mosaia from '@mosaia/mosaia-node-sdk';
     *
     * // 1. Initialize an unauthenticated client
     * const mosaia = new Mosaia.MosaiaClient({ apiURL: 'https://api.mosaia.ai' });
     *
     * try {
     *   // 2. Exchange the credentials for a session
     *   const authenticatedConfig = await mosaia.auth.signInWithClient(
     *     process.env.MOSAIA_CLIENT_ID!,
     *     process.env.MOSAIA_CLIENT_SECRET!
     *   );
     *
     *   // 3. Build the authenticated client — this one carries the bearer token
     *   const authedMosaia = new Mosaia.MosaiaClient(authenticatedConfig);
     *   const agents = await authedMosaia.agents.get();
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
            } = await this.apiClient.POST<AuthResponse>('/auth/signin', request);

            if (error) {
                throw new Error(error.message);
            }
            
            const sesson = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                sub: data.sub,
                iat: data.iat,
                exp: data.exp,
                authType: 'client' as const
            };

            return Promise.resolve({
                ...this.config,
                apiKey: data.access_token,
                session: sesson
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
     * // `authedMosaia` is the authenticated client produced by a prior sign-in
     * try {
     *   // Refresh using the refresh token stored in authedMosaia.config.session
     *   authedMosaia.config = await authedMosaia.auth.refreshToken();
     *
     *   // Or provide a specific refresh token
     *   authedMosaia.config = await authedMosaia.auth.refreshToken('specific-refresh-token');
     * } catch (error) {
     *   console.error('Token refresh failed:', error.message);
     * }
     * ```
     */
    async refreshToken(token?: string): Promise<MosaiaConfig> {
        const refreshToken = token || this.config?.session?.refreshToken;

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
            } = await this.apiClient.POST<AuthResponse>('/auth/signin', request);

            if (error) {
                throw new Error(error.message);
            }

            const sesson = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                sub: data.sub,
                iat: data.iat,
                exp: data.exp,
                authType: 'refresh' as const
            };

            return Promise.resolve({
                ...this.config,
                apiKey: sesson.accessToken,
                session: sesson
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
            const response = await fetch(`${this.config?.apiURL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });
            const data = await response.json();

            const sesson = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                sub: data.sub,
                iat: data.iat,
                exp: data.exp,
                authType: 'oauth' as const
            };

            return Promise.resolve({
                ...this.config,
                apiKey: sesson.accessToken,
                session: sesson
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
     * try {
     *   // Tear down the session on the authenticated client
     *   await authedMosaia.auth.signOut();
     *
     *   // Or sign out a specific token (e.g. during a controlled rotation)
     *   await authedMosaia.auth.signOut('specific-api-key');
     * } catch (error) {
     *   console.error('Sign out failed:', error.message);
     * }
     * ```
     */
    async signOut(apiKey?: string): Promise<void> {
        const token = apiKey || this.config?.apiKey;

        if (!token) {
            throw new Error('apiKey is required and not found in config');
        }

        try {
            await this.apiClient.DELETE<void>('/auth/signout', { token });

            if (this.configManager) this.configManager.reset();
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
        const session = config.session;

        if (!session) {
            throw new Error('No session found in config');
        }

        if (!session.refreshToken) {
            throw new Error('No refresh token found in config');
        }

        if (session.authType === 'oauth') {
            return this.refreshOAuthToken(session.refreshToken);
        }

        return this.refreshToken(session.refreshToken);
    }
} 