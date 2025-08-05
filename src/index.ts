import {
    Apps,
    Tools,
    AppBots,
    Users,
    Organizations,
    OrgUsers,
    Agents,
    AgentGroups,
    Models,
    Clients,
    MosaiaAuth
} from './collections';
import { Session } from './models';
import APIClient from './utils/api-client';
import {
    MosaiaConfig,
    OAuthConfig,
    UserInterface
} from './types';
import { ConfigurationManager } from './config';
import { OAuth } from './auth/oauth';

/**
 * Main Mosaia SDK client class
 * 
 * Provides access to all Mosaia API endpoints through a unified interface.
 * Supports authentication, user management, organization management, AI agents,
 * tools, applications, and more.
 * 
 * @example
 * ```typescript
 * import * as SDK from '@mosaia/mosaia-node-sdk';
 * 
 * const mosaia = new SDK.MosaiaClient({
 *   apiKey: 'your-api-key',
 *   apiURL: 'https://api.mosaia.ai',
 *   appURL: 'https://mosaia.ai',
 *   clientId: 'your-client-id'
 * });
 * 
 * // Get all users
 * const users = await mosaia.users.get();
 * 
 * // Create an OAuth instance
 * const oauth = mosaia.oauth({
 *   redirectUri: 'https://your-app.com/callback',
 *   scopes: ['read', 'write']
 * });
 * ```
 */
class MosaiaClient {
    private configManager: ConfigurationManager;
    
    /**
     * Creates a new Mosaia SDK instance
     * 
     * @param config - Configuration object for the SDK
     * @param config.apiKey - API key for authentication (optional)
     * @param config.apiURL - Base URL for API requests (defaults to https://api.mosaia.ai)
     * @param config.version - API version (defaults to '1')
     * @param config.clientId - Client ID for OAuth flows (required for OAuth)
     * @param config.clientSecret - Client secret for client credentials flow (optional)
     * @param config.user - User ID for user-scoped operations (optional)
     * @param config.org - Organization ID for org-scoped operations (optional)
     * 
     * @example
     * ```typescript
     * const mosaia = new SDK.MosaiaClient({
     *   apiKey: 'your-api-key',
     *   apiURL: 'https://api.mosaia.ai',
     *   appURL: 'https://mosaia.ai',
     *   clientId: 'your-client-id'
     * });
     * ```
     */
    constructor(config: MosaiaConfig) {
        this.configManager = ConfigurationManager.getInstance();
        this.configManager.initialize(config);
    }

    /**
     * Get the current configuration
     */
    get config(): MosaiaConfig {
        return this.configManager.getConfig();
    }

    /**
     * Set the configuration
     * 
     * @param config - The new configuration object
     */
    set config(config: MosaiaConfig) {
        this.configManager.initialize(config);
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
     * const mosaia = new SDK.MosaiaClient(config);
     * 
     * // Update API key
     * mosaia.apiKey = 'new-api-key-123';
     * 
     * // Now all subsequent requests will use the new API key
     * const users = await mosaia.users.get();
     * ```
     */
    set apiKey(apiKey: string) {
        this.configManager.updateConfig('apiKey', apiKey);
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
     * const mosaia = new SDK.MosaiaClient(config);
     * 
     * // Update API version
     * mosaia.version = '2';
     * 
     * // Now all subsequent requests will use API v2
     * const users = await mosaia.users.get();
     * ```
     */
    set version(version: string) {
        this.configManager.updateConfig('version', version);
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
     * const mosaia = new SDK.MosaiaClient(config);
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
        this.configManager.updateConfig('apiURL', apiURL);
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
     * const mosaia = new SDK.MosaiaClient(config);
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
        this.configManager.updateConfig('clientId', clientId);
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
     * const mosaia = new SDK.MosaiaClient(config);
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
        this.configManager.updateConfig('clientSecret', clientSecret);
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
        return new MosaiaAuth();
    }

    /**
     * API Functions
     */

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
     * const agents = await mosaia.agents.get();
     * 
     * // Get specific agent
     * const agent = await mosaia.agents.get({}, 'agent-id');
     * 
     * // Create chat completion
     * const completion = await mosaia.agents.chatCompletion('agent-id', {
     *   model: 'gpt-4',
     *   messages: [{ role: 'user', content: 'Hello' }]
     * });
     * ```
     */
    get agents() {
        return new Agents();
    }

    /**
     * Get the current user session
     * 
     * @returns {Session} Session object
     */
    async session() {
        try {
            if (!this.config) {
                throw new Error('Mosaia is not initialized');
            }
    
            const client = new APIClient();
            const {
                data,
                error
            } = await client.GET<UserInterface>('/self');
    
            if (error) {
                throw new Error(error.message);
            }

            return new Session(data);
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
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
        return new Apps();
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
        return new Tools();
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
 * const users = await mosaia.users.get();
     * 
     * // Get specific user
     * const user = await mosaia.users.get({}, 'user-id');
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
        return new Users();
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
     * const orgs = await mosaia.organizations.get();
     * 
     * // Get specific organization
     * const org = await mosaia.organizations.get({}, 'org-id');
     * 
     * // Create new organization
     * const newOrg = await mosaia.organizations.create({
     *   name: 'My Organization',
     *   short_description: 'Description'
     * });
     * ```
     */
    get organizations() {
        return new Organizations();
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
     * const groups = await mosaia.agentGroups.get();
     * 
     * // Get specific agent group
     * const group = await mosaia.agentGroups.get({}, 'group-id');
     * 
     * // Create chat completion with group
     * const completion = await mosaia.agentGroups.chatCompletion('group-id', {
     *   model: 'gpt-4',
     *   messages: [{ role: 'user', content: 'Hello' }]
     * ```
     */
    get agentGroups() {
        return new AgentGroups();
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
     * const models = await mosaia.models.get();
     * 
     * // Get specific model
     * const model = await mosaia.models.get({}, 'model-id');
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
        return new Models();
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
     * // Exchange code for new authenticated config (requires the code verifier)
     * const newConfig = await oauth.authenticateWithCodeAndVerifier(code, codeVerifier);
     * 
     * // create new instance with authenticated config
     * const newMosaiaInstance = new SDK.MosaiaClient(newConfig);
     * ```
     */
    oauth(oauthConfig: OAuthConfig): OAuth {
        return new OAuth(oauthConfig);
    }
}

// ============================================================================
// NAMESPACE EXPORTS
// ============================================================================

/**
 * Mosaia SDK Namespace
 * 
 * This namespace contains all SDK classes, types, and utilities.
 * Import using: `import * as Mosaia from '@mosaia/mosaia-node-sdk'`
 * 
 * @example
 * ```typescript
 * import * as Mosaia from '@mosaia/mosaia-node-sdk';
 * 
 * // Create API clients
 * const users = new Mosaia.Users();
 * const agents = new Mosaia.Agents();
 * const apps = new Mosaia.Apps();
 * 
 * // Create models
 * const user = new Mosaia.User({});
 * const agent = new Mosaia.Agent({});
 * 
 * // Create OAuth instance
 * const oauth = new Mosaia.OAuth({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 *   appURL: 'https://mosaia.ai',
 *   scopes: ['read', 'write']
 * });
 * 
 * // Use utility functions
 * const isValid = Mosaia.isValidObjectId('507f1f77bcf86cd799439011');
 * 
 * // Access types
 * const config: Mosaia.MosaiaConfig = {
 *   apiKey: 'your-api-key',
 *   apiURL: 'https://api.mosaia.ai'
 * };
 * 
 * // Create main SDK instance
 * const mosaia = new Mosaia.MosaiaClient(config);
 * ```
 */

// API Classes
export { Users } from './collections';
export { Agents } from './collections';
export { Apps } from './collections';
export { Tools } from './collections';
export { Organizations } from './collections';
export { OrgUsers } from './collections';
export { AgentGroups } from './collections';
export { Models } from './collections';
export { Clients } from './collections';
export { AppBots } from './collections';
export { MosaiaAuth } from './collections';

// Model Classes
export { User } from './models';
export { Agent } from './models';
export { App } from './models';
export { Organization } from './models';
export { OrgUser } from './models';
export { AppBot } from './models';
export { AgentGroup } from './models';
export { Tool } from './models';
export { Client } from './models';
export { Model } from './models';
export { Session } from './models';
export { BaseModel } from './models';

// Auth Classes
export { OAuth } from './auth/oauth';

// Configuration Classes
export { ConfigurationManager, DEFAULT_CONFIG } from './config';

// Utility Functions
export { 
    isValidObjectId, 
    parseError, 
    queryGenerator, 
    isTimestampExpired,
    failure,
    success,
    serverErrorToString,
    isSdkError
} from './utils';

// Types
export * from './types';

// Main SDK Class
export { MosaiaClient };

// Default export for single primary class pattern
export default MosaiaClient;