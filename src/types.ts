/**
 * @fileoverview Type definitions for the Mosaia SDK
 * 
 * This module contains all TypeScript interfaces, types, and enums used throughout
 * the Mosaia SDK. It defines the structure of API requests and responses, configuration
 * objects, authentication interfaces, and all data models used by the platform.
 * 
 * The types are organized into logical groups:
 * - Configuration and authentication interfaces
 * - API response and request structures
 * - Entity interfaces for platform resources
 * - Chat completion and OAuth interfaces
 * - Utility types and payload definitions
 * 
 * @module types
 * @packageDocumentation
 */

"use strict";

/**
 * Configuration interface for the Mosaia SDK
 * 
 * This interface defines all configuration options available when initializing
 * the Mosaia SDK client. It includes authentication settings, API endpoints,
 * and optional context parameters.
 * 
 * @example
 * ```typescript
 * const config: MosaiaConfig = {
 *   apiKey: 'your-api-key',
 *   apiURL: 'https://api.mosaia.ai',
 *   clientId: 'your-client-id',
 *   user: 'user-id',
 *   org: 'org-id'
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Minimal configuration with just API key
 * const config: MosaiaConfig = {
 *   apiKey: 'your-api-key'
 * };
 * 
 * // Full configuration with OAuth support
 * const config: MosaiaConfig = {
 *   apiKey: 'your-api-key',
 *   apiURL: 'https://api.mosaia.ai',
 *   version: '1',
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 *   user: 'user-id',
 *   org: 'org-id',
 *   verbose: true,
 *   session: {
 *     accessToken: 'token',
 *     refreshToken: 'refresh-token',
 *     authType: 'oauth'
 *   }
 * };
 * ```
 */
export interface MosaiaConfig {
    /** API key for authentication (optional if using OAuth) */
    apiKey?: string;
    /** API version to use (defaults to '1') */
    version?: string;
    /** Base URL for API requests (defaults to https://api.mosaia.ai) */
    apiURL?: string;
    /** Base URL for the SSE relay server (defaults to https://sse.mosaia.ai) */
    sseURL?: string;
    /** Client ID for client credentials flows (Optional) */
    clientId?: string;
    /** Client secret for client credentials flow (optional) */
    clientSecret?: string;
    /** Enable verbose HTTP request/response logging (defaults to false) */
    verbose?: boolean;
    /** Session credentials for OAuth and token-based authentication (optional) */
    session?: SessionCredentials;
}

/**
 * Authentication interface for the Mosaia SDK
 * 
 * This interface defines the authentication options available when initializing
 * the Mosaia SDK client. It includes authentication settings, API endpoints,
 * and optional context parameters.
 * 
 * @example
 * ```typescript
 * const auth: AuthInterface = {
 *   grant_type: 'password',
 *   email: 'john.doe@example.com',
 *   password: 'password123'
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Client credentials flow
 * const auth: AuthInterface = {
 *   grant_type: 'client',
 *   client_id: 'client-id',
 *   client_secret: 'client-secret'
 * };
 * 
 * // Refresh token flow
 * const auth: AuthInterface = {
 *   grant_type: 'refresh',
 *   refresh_token: 'refresh-token-here'
 * };
 * ```
 */
export interface AuthInterface {
    /** Type of authentication grant */
    grant_type: 'password' | 'client' | 'refresh';
    /** User email (required for password grant) */
    email?: string;
    /** User password (required for password grant) */
    password?: string;
    /** OAuth client ID (required for client grant) */
    client_id?: string;
    /** OAuth client secret (required for client grant) */
    client_secret?: string;
    /** Refresh token (required for refresh grant) */
    refresh_token?: string;
    /** Authorization code (for OAuth code exchange) */
    code?: string;
    /** PKCE code verifier (for OAuth PKCE flow) */
    code_verifier?: string;
}

/**
 * Session credentials for OAuth and token-based authentication
 * 
 * Contains the tokens and metadata needed for authenticated API requests.
 * This interface is used to store and manage authentication state.
 * 
 * @example
 * ```typescript
 * const session: SessionCredentials = {
 *   accessToken: 'your-access-token',
 *   refreshToken: 'your-refresh-token',
 *   authType: 'oauth',
 *   sub: 'user-123',
 *   iat: '1640995200',
 *   exp: '1640998800'
 * };
 * ```
 */
export interface SessionCredentials {
    /** Access token for authentication */
    accessToken: string;
    /** Refresh token for token refresh operations */
    refreshToken: string;
    /** Authentication type */
    authType?: 'password' | 'client' | 'refresh' | 'oauth';
    /** Subject identifier (user ID) */
    sub?: string;
    /** Token issued at timestamp */
    iat?: string;
    /** Token expiration timestamp */
    exp?: string;
}

/**
 * Standard API response wrapper
 * 
 * All API responses are wrapped in this structure to provide consistent
 * response handling across the SDK.
 * 
 * @template T - The type of data contained in the response
 * 
 * @example
 * ```typescript
 * const response: APIResponse<UserInterface> = {
 *   data: {
 *     id: 'user-123',
 *     email: 'user@example.com',
 *     name: 'John Doe'
 *   },
 *   paging: {
 *     limit: 10,
 *     offset: 0,
 *     total: 1
 *   }
 * };
 * ```
 */
export interface APIResponse<T> {
    /** The response data, can be a single item or array */
    data: T | T[] | null;
    /** Pagination information for list responses */
    paging?: PagingInterface;
}

/**
 * Batch API response wrapper
 * 
 * All batch API responses are wrapped in this structure to provide consistent
 * response handling across the SDK.
 * 
 * @template T - The type of data contained in the response
 * 
 * @example
 * ```typescript
 * const batchResponse: BatchAPIResponse<UserInterface> = {
 *   data: [
 *     { id: 'user-1', email: 'user1@example.com' },
 *     { id: 'user-2', email: 'user2@example.com' }
 *   ],
 *   paging: {
 *     limit: 10,
 *     offset: 0,
 *     total: 2
 *   }
 * };
 * ```
 */
export interface BatchAPIResponse<T> {
    /** Array of response data items */
    data: T[];
    /** Pagination information */
    paging?: PagingInterface;
}

/**
 * Standard error response structure
 * 
 * All API errors follow this structure for consistent error handling.
 * 
 * @example
 * ```typescript
 * const error: ErrorResponse = {
 *   message: 'Invalid API key provided',
 *   code: 'INVALID_API_KEY',
 *   status: 401
 * };
 * ```
 */
export interface ErrorResponse {
    /** Human-readable error message */
    message: string;
    /** Error code for programmatic handling */
    code: string;
    /** HTTP status code */
    status: number;
}

/**
 * Pagination interface for list responses
 * 
 * Used by API endpoints that return paginated lists of resources.
 * Supports both offset-based and page-based pagination.
 * 
 * @example
 * ```typescript
 * const paging: PagingInterface = {
 *   offset: 20,
 *   limit: 10,
 *   total: 100,
 *   page: 3,
 *   total_pages: 10
 * };
 * ```
 */
export interface PagingInterface {
    /** Number of items to skip (for offset-based pagination) */
    offset?: number;
    /** Maximum number of items to return */
    limit?: number;
    /** Total number of items available */
    total?: number;
    /** Current page number (for page-based pagination) */
    page?: number;
    /** Total number of pages available */
    total_pages?: number;
}

/**
 * Query parameters interface for API requests
 * 
 * Used to define common query parameters that can be passed to API endpoints
 * for filtering, sorting, and pagination.
 * 
 * @example
 * ```typescript
 * const queryParams: QueryParams = {
 *   limit: 10,
 *   offset: 0,
 *   sort: 'created_at',
 *   order: 'desc',
 *   search: 'ai assistant',
 *   tags: ['ai', 'automation'],
 *   active: true,
 *   org: 'org-123'
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Search for active agents with specific tags
 * const agentQuery: QueryParams = {
 *   q: 'customer support',
 *   tags: ['support', 'automation'],
 *   active: true,
 *   limit: 20
 * };
 * 
 * const agents = await mosaia.agents.get(agentQuery);
 * ```
 */
export interface QueryParams {
    /** Search term for text-based filtering */
    q?: string;
    /** Maximum number of items to return */
    limit?: number;
    /** Number of items to skip (for offset-based pagination) */
    offset?: number;
    /** Array of tags to filter by */
    tags?: string[];
    /** Filter by active status */
    active?: boolean;
    /** Filter by external ID */
    external_id?: string;
    /** Additional custom query parameters */
    [key: string]: any;
}

/**
 * Base entity interface for all platform resources
 * 
 * All entities in the Mosaia platform extend this interface to provide
 * consistent base properties across all resource types. This ensures
 * that all entities have common fields for identification, status,
 * and integration capabilities.
 * 
 * @example
 * ```typescript
 * const entity: BaseEntity = {
 *   id: 'entity-123',
 *   active: true,
 *   external_id: 'external-system-id',
 *   extensors: {
 *     custom_field: 'custom_value'
 *   }
 * };
 * ```
 */
export interface BaseEntity {
    /** Unique identifier for the entity */
    id?: string;
    /** Whether the entity is active */
    active?: boolean;
    /** External system identifier for integration with third-party systems */
    external_id?: string;
    /** Extended properties for custom integrations */
    extensors?: {
        [key: string]: string;
    }
    /** Record history tracking information */
    record_history?: RecordHistory;
}

/**
 * Record history tracking interface
 * 
 * Used to track creation and update timestamps for entities that
 * maintain historical records. This provides audit trail capabilities
 * for compliance and debugging purposes.
 * 
 * @example
 * ```typescript
 * const history: RecordHistory = {
 *   created_at: new Date('2024-01-01T00:00:00Z'),
 *   created_by: 'user-123',
 *   created_by_type: 'user',
 *   updated_at: new Date('2024-01-02T00:00:00Z'),
 *   updated_by: 'user-456',
 *   updated_by_type: 'user'
 * };
 * ```
 */
export interface RecordHistory {
    /** Timestamp when the record was created */
    created_at: Date,
    /** Identifier of who created the record */
    created_by: String,
    /** Type of entity that created the record (e.g., 'user', 'client', 'system') */
    created_by_type: String,
    /** Timestamp when the record was last updated */
    updated_at: Date,
    /** Identifier of who last updated the record */
    updated_by: String,
    /** Type of entity that last updated the record (e.g., 'user', 'client', 'system') */
    updated_by_type: String
}

/**
 * User entity interface
 * 
 * Represents a user account in the Mosaia platform. Users can be associated
 * with organizations and have various profile information including contact
 * details, social links, and profile metadata.
 * 
 * @example
 * ```typescript
 * const user: UserInterface = {
 *   id: 'user-123',
 *   email: 'john.doe@example.com',
 *   name: 'John Doe',
 *   username: 'johndoe',
 *   image: 'https://example.com/avatar.jpg',
 *   description: 'Software Engineer',
 *   url: 'https://johndoe.com',
 *   location: 'San Francisco, CA',
 *   links: {
 *     github: 'https://github.com/johndoe',
 *     linkedin: 'https://linkedin.com/in/johndoe'
 *   },
 *   active: true
 * };
 * ```
 */
export interface UserInterface extends BaseEntity {
    /** Unique username for the user */
    username?: string;
    /** Full name of the user */
    name?: string;
    /** URL to user's profile image/avatar */
    image?: string;
    /** User's bio or description */
    description?: string;
    /** User's email address */
    email?: string;
    /** User's personal website URL */
    url?: string;
    /** User's location */
    location?: string;
    /** Social media and other external links */
    links?: {
        [key: string]: string;
    };
    // Collection getters (available on User model instances)
    readonly agents?: any; // Agents collection
    readonly apps?: any; // Apps collection
    readonly clients?: any; // Clients collection
    readonly models?: any; // Models collection
    readonly orgs?: any; // OrgUsers collection
}

/**
 * Organization type. Mosaia has exactly one SUPERORG (the control-plane tenant);
 * every other tenant is CLIENT.
 */
export type OrganizationType = 'SUPERORG' | 'CLIENT';

/**
 * Organization entity interface
 *
 * Mirrors `macs-node-sdk/lib/orgs/models/organization.js`. Organizations are
 * tenants that own users, agents, apps, tools, and other resources.
 *
 * @example
 * ```typescript
 * const org: OrganizationInterface = {
 *   id: 'org-123',
 *   name: 'Acme Corp',
 *   description: 'Leading technology company specializing in AI solutions.',
 *   image: 'https://cdn.acme.example.com/logo.png',
 *   type: 'CLIENT',
 *   url: 'https://acme.example.com',
 *   size: '201-500',
 *   location: 'San Francisco, CA',
 *   active: true
 * };
 * ```
 */
export interface OrganizationInterface extends BaseEntity {
    /** Unique identifier for the organization */
    id?: string;
    /** Organization name (required, unique) */
    name: string;
    /** URL to organization's logo/image */
    image?: string;
    /** Organization description */
    description?: string;
    /** Tenant type. `SUPERORG` is the control plane; `CLIENT` is every other tenant. */
    type?: OrganizationType;
    /** Website URL */
    url?: string;
    /** Company size bucket (e.g. `'51-200'`). Free-form string on the server. */
    size?: string;
    /** Headquarters / location string */
    location?: string;
    /** Human-readable recommendation shown on the org profile */
    mosaia_recommendation?: string;
    // Collection getters (available on Organization model instances)
    readonly agents?: any; // Agents collection
    readonly apps?: any; // Apps collection
    readonly clients?: any; // Clients collection
    readonly models?: any; // Models collection
    readonly orgs?: any; // OrgUsers collection (team members)
}

/**
 * Session entity interface
 * 
 * Represents the current user's session in the Mosaia platform.
 */
export interface SessionInterface extends BaseEntity {
    user?: UserInterface;
    org?: OrganizationInterface;
    org_user?: OrgUserInterface;
    client?: ClientInterface;
    permissions?: SessionPermissionsInterface;
}

/**
 * Session permissions interface
 * 
 * Used to define the permissions for a session.
 */
export interface SessionPermissionsInterface {
    allow: PermissionParamsInterface;
    deny: PermissionParamsInterface;
}

/**
 * Permission parameters interface
 * 
 * Used to define the parameters for a permission.
 */
export interface PermissionParamsInterface {
    action: string[] | string;
    resource: string[] | string;
}

/**
 * App type. Mirrors `APP_TYPE` in `macs-node-sdk/lib/app/models/app.js`.
 * - `INTEGRATION`: outbound integration (e.g. Slack, GitHub)
 * - `DEPLOYER`: packaged deployer that installs other resources
 * - `CLIENT`: app-as-OAuth-client (installable Mosaia client)
 * - `NOTIFIER`: publishes events to an external destination
 */
export type AppType = 'INTEGRATION' | 'DEPLOYER' | 'CLIENT' | 'NOTIFIER';

/**
 * Application entity interface
 *
 * Mirrors `macs-node-sdk/lib/app/models/app.js`.
 *
 * @example
 * ```typescript
 * const app: AppInterface = {
 *   id: 'app-123',
 *   name: 'slack-integration',
 *   type: 'INTEGRATION',
 *   org: 'org-456',
 *   short_description: 'Send messages and read channels via a Slack bot user.',
 *   external_app_url: 'https://slack.com',
 *   tags: ['chat', 'messaging'],
 *   active: true
 * };
 * ```
 */
export interface AppInterface extends BaseEntity {
    /** Unique identifier for the application */
    id?: string;
    /** Application name (required, unique) */
    name: string;
    /** App type (required) */
    type: AppType;
    /** Organization ID the app belongs to */
    org?: string;
    /** User ID the app belongs to (if not org-scoped) */
    user?: string;
    /** Client ID (for CLIENT-type apps). Set server-side after `createClient()`. */
    client?: string;
    /** Brief description of the application */
    short_description?: string;
    /** Detailed description of the application */
    long_description?: string;
    /** Markdown README rendered on the app profile */
    readme?: string;
    /** URL to application's icon/image */
    image?: string;
    /** External application URL for integrations */
    external_app_url?: string;
    /** Named external URLs used by the integration (validated as URLs server-side) */
    external_api_urls?: {
        [key: string]: string;
    };
    /** API key used when calling the external app (encrypted at rest) */
    external_api_key?: string;
    /** Custom headers forwarded on external API calls */
    external_headers?: {
        [key: string]: string;
    };
    /** Public listing flag */
    public?: boolean;
    /** Featured listing flag */
    featured?: boolean;
    /** Whether the application is currently active */
    active?: boolean;
    /** Tags for categorizing the application */
    tags?: string[];
    /** Keywords for search functionality */
    keywords?: string[];
    // Collection getters (available on App model instances)
    readonly connectors?: any; // AppConnectors collection
    readonly webhooks?: any; // AppWebhooks collection
}

/**
 * Tool entity interface
 *
 * Mirrors `macs-node-sdk/lib/tools/models/tool.js`. Tools are callable units
 * (HTTP endpoints) that agents invoke during chat. Required fields on create:
 * `name`, `friendly_name`, `short_description`, `tool_schema`, `url`.
 */
export interface ToolInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    image?: string;
    /** Machine name (required, unique) */
    name: string;
    /** Human-readable name (required) */
    friendly_name: string;
    /** URL-safe slug derived from `friendly_name` — auto-generated server-side */
    readonly friendly_name_slug?: string;
    /** One-line description (required) */
    short_description: string;
    /** Link to the tool's source repo (optional) */
    source_url?: string;
    /** JSON-Schema object describing the tool's arguments (required) */
    tool_schema: object;
    /** Default per-tool secrets (encrypted server-side) */
    default_environment_secrets?: string;
    /** Environment variable names the tool requires at execution time */
    required_environment_variables?: string[];
    /** Tool execution endpoint (required) */
    url: string;
    /** Public listing flag */
    public?: boolean;
    /** Featured listing flag */
    featured?: boolean;
    active?: boolean;
    keywords?: string[];
    tags?: string[];
}

/**
 * Fork reference — points back at the original agent when an agent was forked.
 * Mirrors the `forked` subdocument in the agent schema.
 */
export interface AgentForkedRef {
    from?: string;
    created_at?: string | Date;
}

/**
 * Agent entity interface
 *
 * Mirrors `macs-node-sdk/lib/ai/models/agent.js`. Required on create: `name`,
 * `description`. `model` is an array of Model ObjectIds in priority order.
 */
export interface AgentInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    /** Agent name (required, regex `[a-zA-Z0-9_-]+`) */
    name: string;
    /** One-line description (required) */
    description: string;
    /** Markdown README shown on the agent profile */
    readme?: string;
    image?: string;
    /** Models in priority order. Defaults to `[DEFAULT_LLM_MODEL]` when omitted. */
    model?: string[];
    /** System message injected at the top of every completion */
    system_message?: string;
    /** Max output tokens */
    max_tokens?: number;
    /** Sampling temperature (0–2, default 0) */
    temperature?: number;
    /** Public listing flag */
    public?: boolean;
    /** Built-in "Mia" assistant flag — set server-side, never by clients */
    mia?: boolean;
    /** Origin agent if this one was forked */
    forked?: AgentForkedRef;
    /** Featured listing flag */
    featured?: boolean;
    active?: boolean;
    tags?: string[];
    keywords?: string[];
    // Collection getters (available on Agent model instances)
    readonly chat?: any; // Chat functionality
    readonly tasks?: any; // Tasks collection
    readonly logs?: any; // Logs collection
}

/**
 * Model type. Matches the enum in `macs-node-sdk/lib/ai/models/model.js`.
 */
export type ModelType =
    | 'chat'
    | 'image'
    | 'rerank'
    | 'moderation'
    | 'language'
    | 'embedding'
    | 'contextualized_embedding';

/**
 * Model entity interface
 *
 * Mirrors `macs-node-sdk/lib/ai/models/model.js`. Required on create: `name`,
 * `model`, `description`, `base_url`, `api_type`, `api_key`, `prices`.
 */
export interface ModelInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    /** Display name (required, unique among public models) */
    name: string;
    /** Upstream model identifier (e.g. `'gpt-4o'`, `'claude-3-5-sonnet-20241022'`). Required. */
    model: string;
    image?: string;
    /** One-line description (required) */
    description: string;
    /** Markdown README */
    readme?: string;
    /** Max context tokens the model accepts */
    max_context_tokens?: number;
    /** Max output tokens the model will produce */
    max_output_tokens?: number;
    /** Tokenizer encoding (default `'cl100k_base'`) */
    encoding?: string;
    /** Fraction of max context to reserve (0–1, default 0.85) */
    safety_margin?: number;
    /** Heuristic multiplier for estimating tokens per character (default 1.0) */
    tokens_per_char_multiplier?: number;
    /** Model category (default `'chat'`) */
    type?: ModelType;
    /** Provider API base URL — required, encrypted at rest */
    base_url: string;
    /** Provider protocol (e.g. `'openai'`, `'anthropic'`). Required. */
    api_type: string;
    /** Provider API key — required, encrypted at rest */
    api_key: string;
    /** Pricing map (values must be numbers). Required. */
    prices: {
        [key: string]: number;
    };
    public?: boolean;
    active?: boolean;
    tags?: string[];
    keywords?: string[];
}

/**
 * Client OAuth configuration (nested subdocument on `ClientInterface`).
 * Mirrors `client.oauth` in `macs-node-sdk/lib/clients/models/client.js`.
 */
export interface ClientOAuthConfig {
    /** Whether OAuth authorization is enabled for this client */
    active?: boolean;
    /** Redirect URIs accepted during the authorize step */
    authorized_redirect_uris?: string[];
}

/**
 * Client entity interface
 *
 * Mirrors `macs-node-sdk/lib/clients/models/client.js`. A Client is an OAuth /
 * API-key credential owned by an org or user. `secret` and `refresh_key` are
 * server-managed and never returned on reads.
 */
export interface ClientInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    /** Client name (required, regex `[a-zA-Z0-9_:-]+`). Used as the OAuth `client_id`. */
    name: string;
    /** OAuth configuration (nested) */
    oauth?: ClientOAuthConfig;
    active?: boolean;
    tags?: string[];
}

// App Connector interfaces
export interface AppConnectorInterface extends BaseEntity {
    id?: string;
    app: string | AppInterface;
    org?: string | OrganizationInterface;
    user?: string | UserInterface;
    agent?: string | AgentInterface;
    client?: string | ClientInterface;
    response_hook?: string| AppWebhookInterface;
    tags?: string[];
    active?: boolean;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
    record_history?: RecordHistory;
}

export type DehydratedAppConnectorInterface = Omit<AppConnectorInterface, 'id' | 'app'> & { id: string, app: string }


/**
 * Subscription subdocument on `WalletInterface`. Most fields are populated by
 * Stripe webhook handlers, not by client code.
 */
export interface WalletSubscription {
    stripe_subscription_id?: string | null;
    customer_portal?: string;
    name?: string;
    period?: 'monthly' | 'annual';
    entitlements?: Array<{
        id: string;
        object?: string;
        active: boolean;
        livemode: boolean;
        lookup_key: string;
        metadata?: { [key: string]: any };
        name?: string;
    }>;
}

/**
 * Wallet entity interface
 *
 * Mirrors `macs-node-sdk/lib/payments/models/wallet.js`. Balances are tracked
 * in USD. `stripe_customer_id` and the subscription fields are server-managed.
 */
export interface WalletInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    /** Current balance in USD */
    usd_balance?: number;
    /** Auto-reload threshold in USD (balance triggers reload below this) */
    renewal_threshold_usd?: number;
    /** Auto-reload amount in USD */
    renewal_amount_usd?: number;
    /** Whether auto-reload is enabled */
    auto_reload_on?: boolean;
    /** Linked Stripe customer — server-managed */
    stripe_customer_id?: string;
    /** Active Stripe subscription (if any) */
    subscription?: WalletSubscription;
}

export interface MeterInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    type: string;
    value: number;
    metadata?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Permission interfaces
export interface AccessPolicyInterface extends BaseEntity {
    id?: string;
    name: string;
    effect: 'allow' | 'deny';
    actions: string[];
    resources: string[];
    conditions?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

/**
 * OrgPermission binds an AccessPolicy to an org user / agent / client.
 *
 * Mirrors `macs-node-sdk/lib/iam/models/org-permission.js`.
 */
export interface OrgPermissionInterface extends BaseEntity {
    id?: string;
    org: string;
    /** OrgUser target (not a raw User id) */
    user?: string;
    agent?: string;
    client?: string;
    policy: string | AccessPolicyInterface;
    tags?: string[];
    active?: boolean;
}

/**
 * UserPermission binds an AccessPolicy to a user, optionally delegating access
 * to another `allowed_user`.
 *
 * Mirrors `macs-node-sdk/lib/iam/models/user-permission.js`.
 */
export interface UserPermissionInterface extends BaseEntity {
    id?: string;
    user: string;
    agent?: string;
    client?: string;
    /** User being granted delegated access */
    allowed_user?: string;
    policy: string | AccessPolicyInterface;
    tags?: string[];
    active?: boolean;
}

/**
 * Org-user permission role. Matches the Mongoose enum in
 * `macs-node-sdk/lib/orgs/models/org-user.js`.
 */
export type OrgUserPermission = 'SUPERUSER' | 'USER';

/**
 * OrgUser (membership) entity interface
 *
 * Mirrors `macs-node-sdk/lib/orgs/models/org-user.js`.
 */
export interface OrgUserInterface extends BaseEntity {
    id?: string;
    org: string;
    user: string;
    /** Role in the org. Default `'USER'`. */
    permission?: OrgUserPermission;
    keywords?: string[];
    tags?: string[];
    active?: boolean;
}


/**
 * Snapshot type. Only `AGENT_LOG` is supported today.
 */
export type SnapshotType = 'AGENT_LOG';

/**
 * Snapshot entity interface
 *
 * Mirrors `macs-node-sdk/lib/logs/models/snapshot.js`. A point-in-time capture
 * of a source document (currently only AgentLog). Required on create:
 * `source` + `data`.
 */
export interface SnapshotInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    /** ObjectId of the source document being snapshotted (required) */
    source: string;
    /** Snapshot kind (currently always `'AGENT_LOG'`) */
    type?: SnapshotType;
    /** Snapshot payload — shape depends on `type` */
    data: any;
    keywords?: string[];
    tags?: string[];
    active?: boolean;
}

/**
 * Retention policy subdocument on `DriveInterface`.
 */
export interface DriveRetentionPolicy {
    enabled?: boolean;
    /** Retention period in days */
    retention_period?: number;
    retention_type?: 'LEGAL_HOLD' | 'COMPLIANCE' | 'BUSINESS';
}

/**
 * Drive entity interface
 *
 * Mirrors `macs-node-sdk/lib/drive/models/drive.js`. `current_size` is server-
 * tracked.
 */
export interface DriveInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    /** Drive name (required, maxlength 255) */
    name: string;
    /** Description (maxlength 1000) */
    description?: string;
    /** Bytes currently stored — server-managed */
    readonly current_size?: number;
    /** Quota in bytes. Default 1 GiB. */
    max_size?: number;
    /** Storage status (see `STORAGE_STATUS` constant). Default `'ACTIVE'`. */
    status?: string;
    /** Whether the drive allows public read without auth */
    public?: boolean;
    /** Retention policy config */
    retention_policy?: DriveRetentionPolicy;
    /** Whether storage monitoring is enabled */
    monitoring_enabled?: boolean;
    /** Quota usage % that triggers a warning alert (1–100, default 80) */
    quota_alert_threshold?: number;
    /** Quota usage % that triggers a critical alert (1–100, default 95) */
    critical_quota_threshold?: number;
    /** Whether audit logging is enabled for drive operations */
    audit_logging_enabled?: boolean;
    active?: boolean;
    // Collection getters (available on Drive model instances)
    readonly items?: any; // DriveItems collection
    readonly uploads?: any; // UploadJobs collection
    readonly indexes?: any; // VectorIndexes collection (scoped to this drive)
}

// Drive Item (FileMetadata) interfaces
export interface DriveItemInterface extends BaseEntity {
    id?: string;
    drive: string;
    name: string;
    path?: string;
    size?: number;
    mime_type?: string;
    item_type?: 'FILE' | 'FOLDER' | 'SYMLINK';
    url?: string;
    parent_folder?: string | null;
    folder_structure?: Array<{
        folder_id: string;
        folder_name: string;
        level: number;
    }>;
    metadata?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    };
    // Collection getters (available on DriveItem model instances)
    readonly indexes?: any; // VectorIndexes collection (scoped to this drive item/folder)
}

// Upload Job interfaces
export interface UploadJobInterface extends BaseEntity {
    id?: string;
    drive: string;
    status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    name: string;
    original_name?: string;
    s3_key?: string;
    size: number;
    mime_type: string;
    content_type_category?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'ARCHIVE' | 'CODE' | 'DATA' | 'OTHER';
    path?: string;
    item_type?: 'FILE' | 'FOLDER' | 'SYMLINK';
    presigned_url?: string;
    presigned_url_expires_at: string | Date;
    etag?: string;
    s3_version_id?: string;
    started_at: string | Date;
    completed_at?: string | Date;
    error_summary?: string;
    // Action URLs (provided by API)
    failed_url?: string;
    status_url?: string;
    // Virtual fields
    duration_ms?: number;
    formatted_duration?: string;
    formatted_size?: string;
    is_expired?: boolean;
}

// Vector Index interfaces
export interface VectorIndexInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    name?: string;
    description?: string;
    drive?: string;
    folder?: string;
    status?: string;  // 'ACTIVE', 'BUILDING', 'INACTIVE'
    active?: boolean;
    vector_count?: number;
    index_size_bytes?: number;
    last_rebuild?: string | Date;
    tags?: string[];
    extensors?: {
        [key: string]: any;
    };
    // Collection getters (available on VectorIndex model instances)
    readonly vectors?: any; // Vectors collection
}

// Vector interfaces
export interface VectorInterface extends BaseEntity {
    id?: string;
    index: string;  // VectorIndex ID (required)
    file?: string;  // DriveItem ID
    embedding: number[];  // Required
    content?: any;
    metadata?: {
        [key: string]: any;
    };
    tags?: string[];
    active?: boolean;
    extensors?: {
        [key: string]: any;
    };
}

// Like interfaces
export interface LikeInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    target_type: string;
    target_id: string;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

/**
 * AgentLog processing status. Mirrors the enum in
 * `macs-node-sdk/lib/logs/models/agent-log.js`.
 */
export type AgentLogStatus = 'STANDBY' | 'PROCESSING' | 'ERROR';

/**
 * AgentLog entity interface
 *
 * Mirrors `macs-node-sdk/lib/logs/models/agent-log.js`. An AgentLog is the
 * conversation/run log binding together one or more agents, clients, and users
 * with an append-only Message stream.
 */
export interface AgentLogInterface extends BaseEntity {
    id?: string;
    /** Display name for the log (free-form) */
    name?: string;
    org?: string;
    user?: string;
    /** Model used for this log's completions */
    model?: string;
    /**
     * Primary agent on the log.
     * @deprecated Use `agents[]`. Retained for backward compatibility.
     */
    agent?: string;
    /** Agents participating in the log */
    agents?: string[];
    /** Clients that authored messages on this log */
    clients?: string[];
    /** OrgUsers that participated */
    org_users?: string[];
    /** Guest (non-member) users who joined the log */
    guest_users?: string[];
    /** Human-readable summary of the log */
    summary?: string;
    /**
     * Inline messages.
     * @deprecated Use the nested messages collection instead of this flat array.
     */
    messages?: any[];
    /** Processing status */
    status?: AgentLogStatus;
    keywords?: string[];
    tags?: string[];
    active?: boolean;
    // Collection getters (available on Log model instances)
    readonly snapshots?: any; // Snapshots collection
    // Note: `messages` collection getter on model instances supersedes the flat `messages?[]` above.
}

/**
 * AgentTool entity interface
 *
 * Mirrors `macs-node-sdk/lib/tools/models/agent-tool.js`. Attaches a tool to
 * an agent with optional per-attachment secrets that override the tool's
 * `default_environment_secrets`.
 */
export interface AgentToolInterface extends BaseEntity {
    id?: string;
    /** Agent the tool is attached to (may be populated on read) */
    agent?: string | AgentInterface;
    /** Tool being attached (may be populated on read) */
    tool?: string | ToolInterface;
    /** Per-attachment secrets (encrypted server-side) */
    environment_secrets?: string;
    tags?: string[];
    active?: boolean;
}

// Group Agent interfaces
export interface GroupAgentInterface extends BaseEntity {
    id?: string;
    group: string;
    agent: string;
    order?: number;
    config?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// App User interfaces
export interface AppUserInterface extends BaseEntity {
    id?: string;
    app: string;
    user: string;
    config?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

/**
 * App webhook event name. Currently only `REQUEST` is supported.
 */
export type AppWebhookEvent = 'REQUEST';

/**
 * AppWebhook entity interface
 *
 * Mirrors `macs-node-sdk/lib/app/models/app-webhook.js`. Note the field is
 * singular `event`, not `events[]` — the schema only supports a single event
 * per webhook today.
 */
export interface AppWebhookInterface extends BaseEntity {
    id?: string;
    /** App this webhook belongs to (required) */
    app: string;
    org?: string;
    user?: string;
    agent?: string;
    /** Callback URL the app invokes (required) */
    url: string;
    /** Event name that triggers the webhook (singular) */
    event?: AppWebhookEvent;
    /** Raw HTTP headers to forward (string form) */
    headers?: string;
    tags?: string[];
    active?: boolean;
}

/**
 * ClientSession entity interface
 *
 * Mirrors `macs-node-sdk/lib/clients/models/client-session.js`. Represents a
 * pending / active OAuth authorization session. `code`, `refresh_key`, and
 * `active_id` are server-managed.
 */
export interface ClientSessionInterface extends BaseEntity {
    id?: string;
    /** Owning Client (required) */
    client: string;
    /** OAuth request metadata (scopes, state, etc.) — required */
    metadata: { [key: string]: any };
    /** Authorization code issued to the client (read-only after issue) */
    readonly code?: string;
    /** PKCE code challenge */
    code_challenge?: string;
    /** PKCE code challenge method */
    code_challenge_method?: 'S256' | 'plain';
    /** Redirect URI agreed at authorization (required) */
    redirect_uri: string;
    /** Session expiry */
    expires_at?: string | Date;
}

// API Request Log interfaces
export interface ApiRequestLogInterface extends BaseEntity {
    id?: string;
    method: string;
    path: string;
    status: number;
    duration: number;
    user?: string;
    org?: string;
    client?: string;
    metadata?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
        execution_context: 'frontend' | 'backend'
    }
}

export interface ClientToolCallDefinition {
    name: string;
    tool_schema: object;
}

// Chat completion interfaces
export interface ChatMessage {
    role?: 'system' | 'user' | 'assistant' | 'tool';
    content?: string;
    refusal?: string;
    annotations?: string[];
    tool_calls?: ToolCall[];
    tool_call_id?: string;
}

export interface ChatCompletionRequest {
    model?: string;
    messages: ChatMessage[];
    max_tokens?: number;
    temperature?: number;
    stream?: boolean;
    logging?: boolean;
    log_id?: string;
    frontend_tools: ClientToolCallDefinition[];
}

export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: ChatMessage;
        finish_reason: string;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details: {
            cached_tokens: number;
            audio_tokens: number;
        };
        completion_tokens_details: {
            reasoning_tokens: number;
            audio_tokens: number;
            accepted_prediction_tokens: number;
            rejected_prediction_tokens: number;
        };
    };
    service_tier: string;
    system_fingerprint: string;
}

/**
 * Rerank request interface
 */
export interface RerankRequest {
    query: string;
    documents: string[];
    model?: string;
    reorder_results?: boolean;
}

/**
 * Rerank result item
 */
export interface RerankResult {
    index: number;
    document: {
        text: string;
    };
    relevance_score: number;
}

/**
 * Rerank response interface
 */
export interface RerankResponse {
    id: string;
    model: string;
    results: RerankResult[];
    usage?: {
        total_tokens: number;
    };
}

/**
 * Embedding request interface
 */
export interface EmbeddingRequest {
    model?: string;
    input: string | string[];
}

/**
 * Embedding data item
 */
export interface EmbeddingData {
    embedding: number[];
    index: number;
    object: string;
}

/**
 * Embedding response interface
 */
export interface EmbeddingResponse {
    data: EmbeddingData[];
    model: string;
    object: string;
    usage?: {
        prompt_tokens: number;
        total_tokens: number;
    };
}

// Auth interfaces
export interface AuthRequest {
    grant_type: 'password' | 'client' | 'refresh';
    email?: string;
    password?: string;
    client_id?: string;
    client_secret?: string;
    refresh_token?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
}

// Response payload types
export type GetUsersPayload = {
    data: UserInterface[];
    paging?: PagingInterface;
}

export type GetUserPayload = {
    data: UserInterface;
}

export type GetOrgsPayload = {
    data: OrganizationInterface[];
    paging?: PagingInterface;
}

export type GetOrgPayload = {
    data: OrganizationInterface;
}

export type GetAppsPayload = {
    data: AppInterface[];
    paging?: PagingInterface;
}

export type GetAppPayload = {
    data: AppInterface;
}

export type GetToolsPayload = {
    data: ToolInterface[];
    paging?: PagingInterface;
}

export type GetToolPayload = {
    data: ToolInterface;
}

export type GetAgentsPayload = {
    data: AgentInterface[];
    paging?: PagingInterface;
}

export type GetAgentPayload = {
    data: AgentInterface;
}

export type GetModelsPayload = {
    data: ModelInterface[];
    paging?: PagingInterface;
}

export type GetModelPayload = {
    data: ModelInterface;
}

export type GetClientsPayload = {
    data: ClientInterface[];
    paging?: PagingInterface;
}

export type GetClientPayload = {
    data: ClientInterface;
}

export type GetAppConnectorsPayload = {
    data: DehydratedAppConnectorInterface[];
    paging?: PagingInterface;
}

export type GetAppConnectorPayload = {
    data: DehydratedAppConnectorInterface;
}

// Search types
export interface SearchQueryParams {
    q?: string;
    search_types?: string[];
    search_type?: string;
    limit?: number;
    [key: string]: any;
}

export interface SearchResults {
    agents?: AgentInterface[];
    apps?: AppInterface[];
    tools?: ToolInterface[];
    models?: ModelInterface[];
}

export interface SearchPaging {
    agents?: PagingInterface;
    apps?: PagingInterface;
    tools?: PagingInterface;
    models?: PagingInterface;
}

export type SearchResponse = {
    data: SearchResults;
    paging?: SearchPaging;
}

export type GetDrivesPayload = {
    data: DriveInterface[];
    paging?: PagingInterface;
}

export type GetDrivePayload = {
    data: DriveInterface;
}

export type GetDriveItemsPayload = {
    data: DriveItemInterface[];
    paging?: PagingInterface;
}

export type GetDriveItemPayload = {
    data: DriveItemInterface;
}

export type GetUploadJobsPayload = {
    data: UploadJobInterface[];
    paging?: PagingInterface;
}

export type GetUploadJobPayload = {
    data: UploadJobInterface;
}

export type GetWalletsPayload = {
    data: WalletInterface[];
    paging?: PagingInterface;
}

export type GetWalletPayload = {
    data: WalletInterface;
}

export type GetMetersPayload = {
    data: MeterInterface[];
    paging?: PagingInterface;
}

export type GetMeterPayload = {
    data: MeterInterface;
}

export type GetAccessPoliciesPayload = {
    data: AccessPolicyInterface[];
    paging?: PagingInterface;
}

export type GetAccessPolicyPayload = {
    data: AccessPolicyInterface;
}

export type GetOrgPermissionsPayload = {
    data: OrgPermissionInterface[];
    paging?: PagingInterface;
}

export type GetOrgPermissionPayload = {
    data: OrgPermissionInterface;
}

export type GetUserPermissionsPayload = {
    data: UserPermissionInterface[];
    paging?: PagingInterface;
}

export type GetUserPermissionPayload = {
    data: UserPermissionInterface;
}

export type GetOrgUsersPayload = {
    data: OrgUserInterface[];
    paging?: PagingInterface;
}

export type GetOrgUserPayload = {
    data: OrgUserInterface;
}


export type GetSnapshotsPayload = {
    data: SnapshotInterface[];
    paging?: PagingInterface;
}

export type GetSnapshotPayload = {
    data: SnapshotInterface;
}

export type GetVectorIndexesPayload = {
    data: VectorIndexInterface[];
    paging?: PagingInterface;
}

export type GetVectorIndexPayload = {
    data: VectorIndexInterface;
}

export interface ReindexFilesResponse {
    object: string;
    created: number;
    deletedVectors: number;
    status: string;
    message: string;
}

export interface RAGSearchDocument {
    document: string;
    index: number;
    relevance_score: number;
}

export interface RAGSearchResponse {
    documents: RAGSearchDocument[];
    paging?: PagingInterface;
}

export type GetVectorsPayload = {
    data: VectorInterface[];
    paging?: PagingInterface;
}

export type GetVectorPayload = {
    data: VectorInterface;
}

export type GetLikesPayload = {
    data: LikeInterface[];
    paging?: PagingInterface;
}

export type GetLikePayload = {
    data: LikeInterface;
}

export type GetAgentLogsPayload = {
    data: AgentLogInterface[];
    paging?: PagingInterface;
}

export type GetAgentLogPayload = {
    data: AgentLogInterface;
}

export type GetAgentToolsPayload = {
    data: AgentToolInterface[];
    paging?: PagingInterface;
}

export type GetAgentToolPayload = {
    data: AgentToolInterface;
}

export type GetGroupAgentsPayload = {
    data: GroupAgentInterface[];
    paging?: PagingInterface;
}

export type GetGroupAgentPayload = {
    data: GroupAgentInterface;
}

export type GetAppUsersPayload = {
    data: AppUserInterface[];
    paging?: PagingInterface;
}

export type GetAppUserPayload = {
    data: AppUserInterface;
}

export type GetAppWebhooksPayload = {
    data: AppWebhookInterface[];
    paging?: PagingInterface;
}

export type GetAppWebhookPayload = {
    data: AppWebhookInterface;
}

export type GetClientSessionsPayload = {
    data: ClientSessionInterface[];
    paging?: PagingInterface;
}

export type GetClientSessionPayload = {
    data: ClientSessionInterface;
}

export type GetApiRequestLogsPayload = {
    data: ApiRequestLogInterface[];
    paging?: PagingInterface;
}

export type GetApiRequestLogPayload = {
    data: ApiRequestLogInterface;
}

/**
 * Message role. Matches the Mongoose enum on
 * `macs-node-sdk/lib/logs/models/message.js`.
 */
export type MessageRole = 'user' | 'assistant' | 'tool';

/**
 * Message type. Indicates severity/classification for downstream handlers.
 */
export type MessageType = 'INFO' | 'WARNING' | 'ERROR';

/**
 * Principal type for `creator` / `recipient` on a message.
 */
export type MessageActorType = 'user' | 'org_user' | 'agent' | 'client' | 'model' | 'system';

/**
 * Creator/recipient descriptor. The `type` constrains which Mongoose collection
 * the `id` resolves to.
 */
export interface MessageActor {
    id?: string;
    type?: MessageActorType;
    metadata?: { [key: string]: any };
}

/**
 * Message entity interface
 *
 * Mirrors `macs-node-sdk/lib/logs/models/message.js`.
 */
export interface MessageInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    /** Parent AgentLog (required) */
    log: string;
    /** Role of the message author (required server-side; default `'user'`) */
    role?: MessageRole;
    /** Message body (may be empty for tool-call messages) */
    content?: string;
    /** Outbound tool calls attached to this message */
    tool_calls?: Array<{ [key: string]: any }>;
    /** Inbound tool-call id this message is replying to (for role=`'tool'`) */
    tool_call_id?: string;
    /** Classification (INFO/WARNING/ERROR) */
    type?: MessageType;
    /** Structured creator descriptor (supersedes role for non-human creators) */
    creator?: MessageActor;
    /** Structured recipient descriptor (for direct addressing) */
    recipient?: MessageActor;
    /** Linked conversation ids for cross-conversation recall */
    associated_conversation_ids?: string[];
    /** Arbitrary metadata */
    metadata?: { [key: string]: any };
    keywords?: string[];
    tags?: string[];
    active?: boolean;
}

// Scope interfaces
export interface ScopeInterface {
    id?: string;
    name: string;
    description?: string;
}

// Task interfaces (aligned with macs-node-sdk planning/models/task)
export type TaskStatus = 'PENDING' | 'BUILDING' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'REVIEW';

export interface TaskInterface extends BaseEntity {
    id?: string;
    /** Parent plan reference (optional) */
    plan?: string | { id?: string; [key: string]: any };
    /** Agent reference (optional) */
    agent?: string | { id?: string; [key: string]: any };
    /** Agent log reference for this task (optional) */
    log?: string | { id?: string; [key: string]: any };
    /** AgentLog reference when this task was created (optional) */
    parent_log?: string | { id?: string; [key: string]: any };
    /** Organization reference (optional) */
    org?: string | { id?: string; [key: string]: any };
    /** User reference (optional) */
    user?: string | { id?: string; [key: string]: any };
    /** Task IDs that must complete before this task can run */
    dependencies?: string[];
    name?: string;
    /** High-level 1–2 sentence summary of what this task will accomplish */
    description?: string;
    /** Markdown content defining the task (required on create) */
    content?: string;
    /** Parsed metadata from markdown (type, priority, tags, dependencies) */
    metadata?: {
        type?: string;
        priority?: number;
        tags?: string[];
        dependencies?: string[];
        [key: string]: any;
    };
    status?: TaskStatus;
    active?: boolean;
    keywords?: string[];
    tags?: string[];
    external_id?: string;
    /** Attempt count (failures); used with max_attempts */
    attempt_count?: number;
    /** Max attempts before marking FAILED */
    max_attempts?: number;
    /** Reason for last failure */
    failure_reason?: string;
    extensors?: Record<string, any>;
}

// Plan interfaces (aligned with macs-node-sdk planning/models/plan)
export type PlanStatus = 'DRAFT' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'REVIEW' | 'PAUSED';

export interface PlanInterface extends BaseEntity {
    id?: string;
    task?: string;
    /** Agent reference (optional) */
    agent?: string | { id?: string; [key: string]: any };
    /** Agent log reference for execution tracking (optional) */
    log?: string | { id?: string; [key: string]: any };
    /** AgentLog reference when this plan was created (optional) */
    parent_log?: string | { id?: string; [key: string]: any };
    /** Organization reference (optional) */
    org?: string | { id?: string; [key: string]: any };
    /** User reference (optional) */
    user?: string | { id?: string; [key: string]: any };
    name?: string;
    /** High-level 1–2 sentence summary of what this plan will accomplish */
    description?: string;
    /** Markdown content defining the plan (required on create) */
    content?: string;
    status?: PlanStatus;
    active?: boolean;
    keywords?: string[];
    tags?: string[];
    external_id?: string;
    extensors?: Record<string, any>;
    // Collection getters (available on Plan model instances)
    readonly tasks?: any; // Tasks collection
}

// Trigger interfaces (aligned with macs-node-sdk event/models/trigger)
export type TriggerType = 'CRON' | 'WEBHOOK' | 'EVENT' | 'MANUAL';
export type TriggerStatus = 'ACTIVE' | 'PAUSED';

export interface TriggerConfig {
    /** CRON: required. e.g. "0 9 * * *" for 9am daily */
    cron_expression?: string;
    /** CRON: optional. e.g. "America/New_York" */
    timezone?: string;
    /** CRON: if true, run once then remove EventBridge rule */
    run_once?: boolean;
    [key: string]: any;
}

export interface TriggerInterface extends BaseEntity {
    id?: string;
    /** Organization reference (optional) */
    org?: string | { id?: string; [key: string]: any };
    /** User reference (optional) */
    user?: string | { id?: string; [key: string]: any };
    name?: string;
    description?: string;
    type?: TriggerType;
    /** Agent reference (optional) */
    agent?: string | { id?: string; [key: string]: any };
    /** Task reference (optional; exactly one of agent, task, plan required) */
    task?: string | { id?: string; [key: string]: any };
    /** Plan reference (optional) */
    plan?: string | { id?: string; [key: string]: any };
    /** AgentLog reference (optional) */
    log?: string | { id?: string; [key: string]: any };
    user_message?: string;
    status?: TriggerStatus;
    /** Auto-pause when task/plan completes (main indicator for whether cron runs again) */
    pause_on_completion?: boolean;
    last_triggered_at?: string | Date;
    next_trigger_at?: string | Date;
    trigger_count?: number;
    active?: boolean;
    /** Type-specific config (e.g. CRON: cron_expression, timezone, run_once) */
    config?: TriggerConfig;
    metadata?: Record<string, any>;
    keywords?: string[];
    tags?: string[];
    external_id?: string;
    extensors?: Record<string, any>;
}

export type GetTriggersPayload = {
    data: TriggerInterface[];
    paging?: PagingInterface;
};

export type GetTriggerPayload = {
    data: TriggerInterface;
};

// Activity interfaces (aligned with macs-node-sdk activity/models/activity)

/**
 * Normalized resource name. The activity producer maps raw Mongo collection
 * names to a stable singular snake_case form. New resources may be added by
 * the platform; this is intentionally a string union with a fallback.
 */
export type ActivityResource =
    | 'plan'
    | 'task'
    | 'trigger'
    | 'agent'
    | 'agent_group'
    | 'app'
    | 'tool'
    | 'drive'
    | 'drive_item'
    | 'vector_index'
    | 'organization'
    | 'org_user'
    | 'user'
    | (string & {}); // allow unknown future values without losing autocompletion

/** CRUD verb matching the IAM action vocabulary. `read` is intentionally absent. */
export type ActivityOperation = 'create' | 'update' | 'delete';

/**
 * Activity row — append-only audit entry.
 *
 * Each row is a snapshot of a meaningful change to a user/org-scoped resource.
 * The full pre/post-image of the source document lives on `payload`. Producers
 * write one row per qualifying mutation; the unique `event_id` ensures
 * idempotency across multiple relay processes tailing the same change stream.
 */
export interface ActivityInterface extends BaseEntity {
    id?: string;
    /** Owner user reference (required if `org` is not set) */
    user?: string | { id?: string; [key: string]: any };
    /** Owner org reference (required if `user` is not set) */
    org?: string | { id?: string; [key: string]: any };
    /** Normalized resource name (e.g. `'plan'`, `'task'`, `'drive_item'`) */
    resource?: ActivityResource;
    /** ID of the source document that changed */
    resource_id?: string;
    /** CRUD verb */
    operation?: ActivityOperation;
    /** Snapshot of the source document at the time of the change */
    payload?: Record<string, any> | null;
    /** Stringified change-stream resume token used as a dedupe key */
    event_id?: string;
}

export type GetActivitiesPayload = {
    data: ActivityInterface[];
    paging?: PagingInterface;
};

export type GetActivityPayload = {
    data: ActivityInterface;
};

/**
 * Strongly-typed query params for `mosaia.activities.get()`. Mirrors the
 * filters supported by the api-core `GET /v1/activity` route and the SDK's
 * `Activity.query()` method.
 *
 * Extends `QueryParams` so generic pagination/search params (like `q`,
 * `tags`, `active`) still pass through transparently.
 */
export interface ActivityQueryParams extends QueryParams {
    /** Restrict to a single resource type (e.g. `'plan'`, `'task'`, `'drive_item'`). */
    resource?: ActivityResource;
    /** Restrict to a specific source-document id. Most useful with `resource`. */
    resource_id?: string;
    /** Restrict to a single CRUD operation. */
    operation?: ActivityOperation;
    /**
     * Cursor for replay. When set, only rows with `_id > since` are
     * returned. ObjectIds are time-ordered, so this acts like a "newer
     * than X" filter.
     */
    since?: string;
    /** Owner user id (admin / super-org use). */
    user?: string;
    /** Owner org id (admin / super-org use). */
    org?: string;
    /**
     * When `true`, return every matching row without pagination. Use with
     * care — there is no upper bound when this is set.
     */
    all?: boolean;
}

// SSO interfaces
export interface SSORequestInterface {
    mosaia_user: {
        id: string;
    };
    oauth_account: {
        type: string;
        provider: string;
    };
}

export interface SSOResponseInterface {
    token: string;
    type: string;
}

// Notification interfaces
export interface NotificationEmailInterface {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export interface NotificationResponseInterface {
    success: boolean;
    messageId?: string;
}

// Payload types for new collections
export type GetLogsPayload = {
    data: AgentLogInterface[];
    paging?: PagingInterface;
}

export type GetLogPayload = {
    data: AgentLogInterface;
}

export type GetMessagesPayload = {
    data: MessageInterface[];
    paging?: PagingInterface;
}

export type GetMessagePayload = {
    data: MessageInterface;
}

export type GetScopesPayload = {
    data: {
        scopes: ScopeInterface[];
    }
}

export type GetTasksPayload = {
    data: TaskInterface[];
    paging?: PagingInterface;
}

export type GetTaskPayload = {
    data: TaskInterface;
}

export type GetPlansPayload = {
    data: PlanInterface[];
    paging?: PagingInterface;
}

export type GetPlanPayload = {
    data: PlanInterface;
}

/**
 * OAuth configuration interface
 * 
 * Configuration object for OAuth2 Authorization Code flow with PKCE.
 * Used when initializing OAuth instances for secure authentication.
 * This interface defines all the parameters needed to configure
 * OAuth authentication flows.
 * 
 * @example
 * ```typescript
 * const oauthConfig: OAuthConfig = {
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 *   scopes: ['read', 'write'],
 *   state: 'random-state-string'
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Minimal OAuth configuration
 * const oauthConfig: OAuthConfig = {
 *   redirectUri: 'https://myapp.com/callback'
 * };
 * 
 * // Full OAuth configuration with custom endpoints
 * const oauthConfig: OAuthConfig = {
 *   clientId: 'custom-client-id',
 *   redirectUri: 'https://myapp.com/callback',
 *   appURL: 'https://custom-auth.mosaia.ai',
 *   apiURL: 'https://custom-api.mosaia.ai',
 *   apiVersion: '2',
 *   scopes: ['read', 'write', 'admin'],
 *   state: 'csrf-protection-token'
 * };
 * ```
 */
export interface OAuthConfig {
    /** Redirect URI for the OAuth flow (optional) */
    redirectUri?: string;
    /** App URL for authorization endpoints (optional defaults to https://mosaia.ai) */
    appURL?: string;
    /** Array of scopes to request (optional) */
    scopes?: string[];
    /** OAuth client ID (required only if not using default) */
    clientId?: string;
    /** API URL for API endpoints (required only if not using default) */
    apiURL?: string;
    /** API version (required only if not using default) */
    apiVersion?: string;
    /** State parameter for CSRF protection (optional) */
    state?: string;
}

/**
 * OAuth token response interface
 * 
 * Response structure returned when exchanging authorization codes for tokens
 * or refreshing access tokens. This interface defines the complete token
 * response including all metadata needed for authentication and token management.
 * 
 * @example
 * ```typescript
 * const tokenResponse: OAuthTokenResponse = {
 *   access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   refresh_token: 'refresh-token-here',
 *   token_type: 'Bearer',
 *   expires_in: 3600,
 *   sub: 'user-123',
 *   iat: '1640995200',
 *   exp: '1640998800'
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Handle token response
 * const handleTokenResponse = (response: OAuthTokenResponse) => {
 *   // Store tokens securely
 *   localStorage.setItem('access_token', response.access_token);
 *   if (response.refresh_token) {
 *     localStorage.setItem('refresh_token', response.refresh_token);
 *   }
 *   
 *   // Calculate expiration time
 *   const expiresAt = new Date(parseInt(response.exp) * 1000);
 *   console.log('Token expires at:', expiresAt);
 * };
 * ```
 */
export interface OAuthTokenResponse {
    /** JWT access token for API authentication */
    access_token: string;
    /** Refresh token for obtaining new access tokens */
    refresh_token?: string;
    /** Token type (typically 'Bearer') */
    token_type: string;
    /** Token expiration time in seconds */
    expires_in: number;
    /** Subject identifier (user ID) */
    sub: string;
    /** Token issued at timestamp */
    iat: string;
    /** Token expiration timestamp */
    exp: string;
}

/**
 * OAuth error response interface
 * 
 * Error response structure returned when OAuth operations fail.
 * This interface defines the standard OAuth error response format
 * for handling authentication failures and other OAuth-related errors.
 * 
 * @example
 * ```typescript
 * const errorResponse: OAuthErrorResponse = {
 *   error: 'invalid_grant',
 *   error_description: 'The authorization code has expired',
 *   error_uri: 'https://docs.mosaia.ai/oauth/errors'
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Handle OAuth errors
 * const handleOAuthError = (error: OAuthErrorResponse) => {
 *   switch (error.error) {
 *     case 'invalid_grant':
 *       console.error('Token expired or invalid');
 *       break;
 *     case 'invalid_client':
 *       console.error('Invalid client credentials');
 *       break;
 *     case 'invalid_request':
 *       console.error('Invalid request parameters');
 *       break;
 *     default:
 *       console.error('OAuth error:', error.error_description);
 *   }
 *   
 *   if (error.error_uri) {
 *     console.log('See documentation:', error.error_uri);
 *   }
 * };
 * ```
 */
export interface OAuthErrorResponse {
    /** OAuth error code */
    error: string;
    /** Human-readable error description */
    error_description?: string;
    /** URL to error documentation */
    error_uri?: string;
}