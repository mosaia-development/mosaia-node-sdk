import { Apps, Tools, AppBots, Users, Organizations, Agents, AgentGroups, Models, Clients, Auth, Billing, Permissions } from './apis';
import { App, Tool, AppBot } from './models';
import { MosiaConfig, OAuthConfig } from './types';
import { DEFAULT_CONFIG } from './config';
import { OAuth } from './oauth';
import { isSdkError } from './utils';

/**
 * Main Mosaia SDK client class
 * 
 * Provides access to all Mosaia API endpoints through a unified interface.
 * Supports authentication, user management, organization management, AI agents,
 * tools, applications, and more.
 * 
 * @example
 * ```typescript
 * import { Mosaia } from '@mosaia/mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({
 *   apiKey: 'your-api-key',
 *   apiURL: 'https://api.mosaia.ai',
 *   appURL: 'https://mosaia.ai',
 *   clientId: 'your-client-id'
 * });
 * 
 * // Get all users
 * const users = await mosaia.users.getAll();
 * 
 * // Create an OAuth instance
 * const oauth = mosaia.oauth({
 *   redirectUri: 'https://your-app.com/callback',
 *   scopes: ['read', 'write']
 * });
 * ```
 */
class Mosaia {
    private config: MosiaConfig;
    
    /**
     * Creates a new Mosaia SDK instance
     * 
     * @param config - Configuration object for the SDK
     * @param config.apiKey - API key for authentication (optional)
     * @param config.apiURL - Base URL for API requests (defaults to https://api.mosaia.ai)
     * @param config.appURL - App URL for OAuth flows (defaults to https://mosaia.ai)
     * @param config.version - API version (defaults to '1')
     * @param config.clientId - Client ID for OAuth flows (required for OAuth)
     * @param config.clientSecret - Client secret for client credentials flow (optional)
     * @param config.user - User ID for user-scoped operations (optional)
     * @param config.org - Organization ID for org-scoped operations (optional)
     * 
     * @example
     * ```typescript
     * const mosaia = new Mosaia({
     *   apiKey: 'your-api-key',
     *   apiURL: 'https://api.mosaia.ai',
     *   appURL: 'https://mosaia.ai',
     *   clientId: 'your-client-id'
     * });
     * ```
     */
    constructor(config: MosiaConfig) {
        const apiURL = `${config.apiURL || DEFAULT_CONFIG.API.BASE_URL}/v${config.version || DEFAULT_CONFIG.API.VERSION}`;
        const appURL = config.appURL || DEFAULT_CONFIG.APP.URL;
        const user = config.user;
        const org = config.org;

        this.config = {
            ...config,
            apiURL,
            appURL,
            user,
            org,
        };
    }

    /**
     * Set the API key for authentication
     * 
     * Updates the API key used for authenticating requests to the Mosaia API.
     * This can be used to change authentication credentials at runtime.
     * 
     * @param apiKey - The new API key for authentication
     * 
     * @example
     * ```typescript
     * const mosaia = new Mosaia(config);
     * 
     * // Update API key
     * mosaia.apiKey = 'new-api-key-123';
     * 
     * // Now all subsequent requests will use the new API key
     * const users = await mosaia.users.getAll();
     * ```
     */
    set apiKey(apiKey: string) {
        this.config.apiKey = apiKey;
    }

    /**
     * Set the API version
     * 
     * Updates the API version used for requests. This affects the version
     * header sent with API requests.
     * 
     * @param version - The new API version (e.g., '1', '2')
     * 
     * @example
     * ```typescript
     * const mosaia = new Mosaia(config);
     * 
     * // Update API version
     * mosaia.version = '2';
     * 
     * // Now all subsequent requests will use API v2
     * const users = await mosaia.users.getAll();
     * ```
     */
    set version(version: string) {
        this.config.version = version;
    }

    /**
     * Set the API base URL
     * 
     * Updates the base URL used for API requests. This is useful for
     * switching between different environments (development, staging, production).
     * 
     * @param apiURL - The new API base URL
     * 
     * @example
     * ```typescript
     * const mosaia = new Mosaia(config);
     * 
     * // Switch to staging environment
     * mosaia.apiURL = 'https://api-staging.mosaia.ai';
     * 
     * // Switch to production environment
     * mosaia.apiURL = 'https://api.mosaia.ai';
     * 
     * // Switch to local development
     * mosaia.apiURL = 'http://localhost:3000';
     * ```
     */
    set apiURL(apiURL: string) {
        this.config.apiURL = apiURL;
    }

    /**
     * Set the app URL for OAuth flows
     * 
     * Updates the app URL used for OAuth authorization flows. This affects
     * the authorization URL generated for OAuth authentication.
     * 
     * @param appURL - The new app URL for OAuth flows
     * 
     * @example
     * ```typescript
     * const mosaia = new Mosaia(config);
     * 
     * // Update OAuth app URL
     * mosaia.appURL = 'https://app-staging.mosaia.ai';
     * 
     * // Generate OAuth authorization URL with new app URL
     * const oauth = mosaia.oauth({
     *   redirectUri: 'https://myapp.com/callback',
     *   scopes: ['read', 'write']
     * });
     * 
     * const { url } = oauth.getAuthorizationUrlAndCodeVerifier();
     * console.log('Authorization URL:', url);
     * ```
     */
    set appURL(appURL: string) {
        this.config.appURL = appURL;
    }

    /**
     * Set the OAuth client ID
     * 
     * Updates the OAuth client ID used for authentication flows.
     * This is required for OAuth-based authentication.
     * 
     * @param clientId - The new OAuth client ID
     * 
     * @example
     * ```typescript
     * const mosaia = new Mosaia(config);
     * 
     * // Update OAuth client ID
     * mosaia.clientId = 'new-client-id-123';
     * 
     * // Create OAuth instance with updated client ID
     * const oauth = mosaia.oauth({
     *   redirectUri: 'https://myapp.com/callback',
     *   scopes: ['read', 'write']
     * });
     * ```
     */
    set clientId(clientId: string) {
        this.config.clientId = clientId;
    }

    /**
     * Set the OAuth client secret
     * 
     * Updates the OAuth client secret used for client credentials flow.
     * This is used for server-to-server authentication.
     * 
     * @param clientSecret - The new OAuth client secret
     * 
     * @example
     * ```typescript
     * const mosaia = new Mosaia(config);
     * 
     * // Update OAuth client secret
     * mosaia.clientSecret = 'new-client-secret-456';
     * 
     * // Use client credentials flow with updated secret
     * const auth = new Auth(mosaia.config);
     * const authResponse = await auth.signInWithClient(
     *   mosaia.config.clientId!,
     *   mosaia.config.clientSecret!
     * );
     * ```
     */
    set clientSecret(clientSecret: string) {
        this.config.clientSecret = clientSecret;
    }

    /**
     * Access to Applications API
     * 
     * Manage applications, including CRUD operations and app-specific functionality.
     * 
     * @returns {Apps} Applications API client
     * 
     * @example
     * ```typescript
     * // Get all apps
     * const apps = await mosaia.apps.get();
     * 
     * // Get specific app
     * const app = await mosaia.apps.get({ id: 'app-id' });
     * 
     * // Create new app
     * const newApp = await mosaia.apps.create({
     *   name: 'My App',
     *   short_description: 'Description'
     * });
     * ```
     */
    get apps() {
        return new Apps(this.config);
    }

    /**
     * Access to Tools API
     * 
     * Manage tools and integrations, including CRUD operations and tool-specific functionality.
     * 
     * @returns {Tools} Tools API client
     * 
     * @example
     * ```typescript
     * // Get all tools
     * const tools = await mosaia.tools.get();
     * 
     * // Get specific tool
     * const tool = await mosaia.tools.get({ id: 'tool-id' });
     * 
     * // Create new tool
     * const newTool = await mosaia.tools.create({
     *   name: 'My Tool',
     *   short_description: 'Description',
     *   tool_schema: '{}'
     * });
     * ```
     */
    get tools() {
        return new Tools(this.config);
    }

    /**
     * Access to Users API
     * 
     * Manage users, including CRUD operations, authentication, and user-specific functionality.
     * 
     * @returns {Users} Users API client
     * 
     * @example
     * ```typescript
     * // Get all users
     * const users = await mosaia.users.getAll();
     * 
     * // Get specific user
     * const user = await mosaia.users.getById('user-id');
     * 
     * // Create new user
     * const newUser = await mosaia.users.create({
     *   email: 'user@example.com',
     *   first_name: 'John',
     *   last_name: 'Doe'
     * });
     * ```
     */
    get users() {
        return new Users(this.config);
    }

    /**
     * Access to Organizations API
     * 
     * Manage organizations, including CRUD operations and organization-specific functionality.
     * 
     * @returns {Organizations} Organizations API client
     * 
     * @example
     * ```typescript
     * // Get all organizations
     * const orgs = await mosaia.organizations.getAll();
     * 
     * // Get specific organization
     * const org = await mosaia.organizations.getById('org-id');
     * 
     * // Create new organization
     * const newOrg = await mosaia.organizations.create({
     *   name: 'My Organization',
     *   short_description: 'Description'
     * });
     * ```
     */
    get organizations() {
        return new Organizations(this.config);
    }

    /**
     * Access to Agents API
     * 
     * Manage AI agents, including CRUD operations, chat completions, and agent-specific functionality.
     * 
     * @returns {Agents} Agents API client
     * 
     * @example
     * ```typescript
     * // Get all agents
     * const agents = await mosaia.agents.getAll();
     * 
     * // Get specific agent
     * const agent = await mosaia.agents.getById('agent-id');
     * 
     * // Create chat completion
     * const completion = await mosaia.agents.chatCompletion('agent-id', {
     *   model: 'gpt-4',
     *   messages: [{ role: 'user', content: 'Hello' }]
     * });
     * ```
     */
    get agents() {
        return new Agents(this.config);
    }

    /**
     * Access to Agent Groups API
     * 
     * Manage agent groups for multi-agent collaboration, including CRUD operations and group-specific functionality.
     * 
     * @returns {AgentGroups} Agent Groups API client
     * 
     * @example
     * ```typescript
     * // Get all agent groups
     * const groups = await mosaia.agentGroups.getAll();
     * 
     * // Get specific agent group
     * const group = await mosaia.agentGroups.getById('group-id');
     * 
     * // Create chat completion with group
     * const completion = await mosaia.agentGroups.chatCompletion('group-id', {
     *   model: 'gpt-4',
     *   messages: [{ role: 'user', content: 'Hello' }]
     * ```
     */
    get agentGroups() {
        return new AgentGroups(this.config);
    }

    /**
     * Access to Models API
     * 
     * Manage AI models, including CRUD operations and model-specific functionality.
     * 
     * @returns {Models} Models API client
     * 
     * @example
     * ```typescript
     * // Get all models
     * const models = await mosaia.models.getAll();
     * 
     * // Get specific model
     * const model = await mosaia.models.getById('model-id');
     * 
     * // Create new model
     * const newModel = await mosaia.models.create({
     *   name: 'My Model',
     *   provider: 'openai',
     *   model_id: 'gpt-4'
     * });
     * ```
     */
    get models() {
        return new Models(this.config);
    }

    /**
     * Access to Clients API
     * 
     * Manage OAuth clients, including CRUD operations and client-specific functionality.
     * 
     * @returns {Clients} Clients API client
     * 
     * @example
     * ```typescript
     * // Get all clients
     * const clients = await mosaia.clients.getAll();
     * 
     * // Get specific client
     * const client = await mosaia.clients.getById('client-id');
     * 
     * // Create new client
     * const newClient = await mosaia.clients.create({
     *   name: 'My Client',
     *   client_id: 'client-id'
     * });
     * ```
     */
    get clients() {
        return new Clients(this.config);
    }

    /**
     * Access to Authentication API
     * 
     * Handle authentication flows, including sign in, sign out, token refresh, and session management.
     * 
     * @returns {Auth} Authentication API client
     * 
     * @example
     * ```typescript
     * // Sign in with password
     * const auth = await mosaia.auth.signInWithPassword('user@example.com', 'password', 'client-id');
     * 
     * // Sign in with client credentials
     * const auth = await mosaia.auth.signInWithClient('client-id', 'client-secret');
     * 
     * // Refresh token
     * const newAuth = await mosaia.auth.refreshToken('refresh-token');
     * 
     * // Sign out
     * await mosaia.auth.signOut();
     * ```
     */
    get auth() {
        return new Auth(this.config);
    }

    /**
     * Access to Billing API
     * 
     * Manage billing and usage, including wallet operations and meter tracking.
     * 
     * @returns {Billing} Billing API client
     * 
     * @example
     * ```typescript
     * // Get wallet
     * const wallet = await mosaia.billing.getWallet('wallet-id');
     * 
     * // Get meters
     * const meters = await mosaia.billing.getMeters();
     * 
     * // Create meter
     * const newMeter = await mosaia.billing.createMeter({
     *   type: 'api_calls',
     *   value: 100
     * });
     * ```
     */
    get billing() {
        return new Billing(this.config);
    }

    /**
     * Access to Permissions API
     * 
     * Manage access policies and permissions, including CRUD operations for policies and user/org permissions.
     * 
     * @returns {Permissions} Permissions API client
     * 
     * @example
     * ```typescript
     * // Get access policies
     * const policies = await mosaia.permissions.getAccessPolicies();
     * 
     * // Get org permissions
     * const orgPermissions = await mosaia.permissions.getOrgPermissions();
     * 
     * // Create user permission
     * const newPermission = await mosaia.permissions.createUserPermission({
     *   user: 'user-id',
     *   client: 'client-id',
     *   policy: 'policy-id'
     * });
     * ```
     */
    get permissions() {
        return new Permissions(this.config);
    }

    /**
     * Creates a new OAuth instance for handling OAuth2 Authorization Code flow with PKCE
     * 
     * This method creates an OAuth client that supports the PKCE (Proof Key for Code Exchange)
     * flow for secure authentication, even for public clients.
     * 
     * @param config - OAuth configuration object
     * @param config.redirectUri - The redirect URI for the OAuth flow (must match registered client)
     * @param config.scopes - Optional array of scopes to request (e.g., ['read', 'write'])
     * @returns {OAuth} OAuth instance for handling the authentication flow
     * 
     * @throws {Error} When clientId is not provided in SDK configuration
     * @throws {Error} When appURL is not provided in SDK configuration
     * 
     * @example
     * ```typescript
     * // Initialize OAuth
     * const oauth = mosaia.oauth({
     *   redirectUri: 'https://your-app.com/callback',
     *   scopes: ['read', 'write']
     * });
     * 
     * // Get authorization URL and code verifier
     * const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();
     * 
     * // Redirect user to the authorization URL
     * // After user authorizes, you'll receive a code in your callback
     * 
     * // Exchange code for token (requires the code verifier)
     * const token = await oauth.exchangeCodeForToken(code, codeVerifier);
     * 
     * // Refresh token when needed
     * const newToken = await oauth.refreshToken(token.refresh_token);
     * ```
     */
    oauth({
        redirectUri,
        scopes
    }: {
        redirectUri: string,
        scopes?: string[]
    }): OAuth {
        if (!this.config.clientId) {
            throw new Error('Client ID is required to initialize OAuth');
        }

        if (!this.config.appURL) {
            throw new Error('appURL is required to initialize OAuth');
        }

        return new OAuth({
            clientId: this.config.clientId,
            redirectUri,
            appURL: this.config.appURL,
            scopes
        });
    }
}

// Export types
export * from './types';
// Export APIs
export * from './apis';
// Export models
export * from './models';
// Export OAuth
export * from './oauth';

export { isSdkError };

// Export default SDK
export default Mosaia;