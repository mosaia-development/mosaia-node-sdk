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
 * const config: MosiaConfig = {
 *   apiKey: 'your-api-key',
 *   apiURL: 'https://api.mosaia.ai',
 *   appURL: 'https://mosaia.ai',
 *   clientId: 'your-client-id',
 *   user: 'user-id',
 *   org: 'org-id'
 * };
 * ```
 */
export interface MosiaConfig {
    /** API key for authentication (optional if using OAuth) */
    apiKey?: string;
    /** API version to use (defaults to '1') */
    version?: string;
    /** Base URL for API requests (defaults to https://api.mosaia.ai) */
    apiURL?: string;
    /** App URL for OAuth flows (defaults to https://mosaia.ai) */
    appURL?: string;
    /** Client ID for OAuth flows (required for OAuth) */
    clientId?: string;
    /** Client secret for client credentials flow (optional) */
    clientSecret?: string;
    /** User ID for user-scoped operations (optional) */
    user?: string;
    /** Organization ID for org-scoped operations (optional) */
    org?: string;
}

/**
 * Standard API response wrapper
 * 
 * All API responses are wrapped in this structure to provide consistent
 * response handling across the SDK.
 * 
 * @template T - The type of data contained in the response
 */
export interface APIResponse<T> {
    /** The actual response data */
    data: T;
    /** HTTP status code of the response */
    status: number;
    /** Optional message from the API */
    message?: string;
}

/**
 * Standard error response structure
 * 
 * All API errors follow this structure for consistent error handling.
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
 * Base entity interface for all platform resources
 * 
 * All entities in the Mosaia platform extend this interface to provide
 * consistent base properties across all resource types.
 */
export interface BaseEntity {
    /** Unique identifier for the entity */
    id?: string;
    /** Whether the entity is currently active */
    active?: boolean;
    /** ISO timestamp when the entity was created */
    created_at?: string;
    /** ISO timestamp when the entity was last updated */
    updated_at?: string;
}

/**
 * Record history tracking interface
 * 
 * Used to track creation and update timestamps for entities that
 * maintain historical records.
 */
export interface RecordHistory {
    /** ISO timestamp when the record was last updated */
    updated_at: string;
    /** ISO timestamp when the record was created */
    created_at: string;
}

/**
 * User entity interface
 * 
 * Represents a user account in the Mosaia platform. Users can be associated
 * with organizations and have various profile information.
 * 
 * @example
 * ```typescript
 * const user: UserInterface = {
 *   id: 'user-123',
 *   email: 'john.doe@example.com',
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   org: 'org-456',
 *   active: true
 * };
 * ```
 */
export interface UserInterface extends BaseEntity {
    /** Unique identifier for the user */
    id?: string;
    /** User's email address (required) */
    email: string;
    /** User's first name */
    first_name?: string;
    /** User's last name */
    last_name?: string;
    /** User's username/handle */
    username?: string;
    /** URL to user's profile image */
    image?: string;
    /** User's public blockchain address */
    public_address?: string;
    /** Organization ID the user belongs to */
    org?: string;
    /** Reference to another user (for delegation) */
    user?: string;
    /** External system identifier */
    external_id?: string;
    /** Extended properties for custom integrations */
    extensors?: {
        [key: string]: string;
    }
}

/**
 * Organization entity interface
 * 
 * Represents an organization in the Mosaia platform. Organizations can contain
 * multiple users, applications, and other resources.
 * 
 * @example
 * ```typescript
 * const org: OrganizationInterface = {
 *   id: 'org-123',
 *   name: 'Acme Corp',
 *   short_description: 'Leading technology company',
 *   long_description: 'Acme Corp is a leading technology company...',
 *   active: true
 * };
 * ```
 */
export interface OrganizationInterface extends BaseEntity {
    /** Unique identifier for the organization */
    id?: string;
    /** Organization name (required) */
    name: string;
    /** Brief description of the organization */
    short_description?: string;
    /** Detailed description of the organization */
    long_description?: string;
    /** URL to organization's logo/image */
    image?: string;
    /** External system identifier */
    external_id?: string;
    /** Extended properties for custom integrations */
    extensors?: {
        [key: string]: string;
    }
}

/**
 * Application entity interface
 * 
 * Represents an application in the Mosaia platform. Applications can have
 * bots, tools, and other integrations associated with them.
 * 
 * @example
 * ```typescript
 * const app: AppInterface = {
 *   id: 'app-123',
 *   name: 'My AI Assistant',
 *   org: 'org-456',
 *   short_description: 'AI-powered customer support assistant',
 *   external_app_url: 'https://myapp.com',
 *   tags: ['ai', 'support', 'automation'],
 *   active: true
 * };
 * ```
 */
export interface AppInterface extends BaseEntity {
    /** Unique identifier for the application */
    id?: string;
    /** Application name (required) */
    name: string;
    /** Organization ID the app belongs to */
    org?: string;
    /** User ID the app belongs to (if not org-scoped) */
    user?: string;
    /** Brief description of the application (required) */
    short_description: string;
    /** Detailed description of the application */
    long_description?: string;
    /** URL to application's icon/image */
    image?: string;
    /** External application URL for integrations */
    external_app_url?: string;
    /** API key for external integrations */
    external_api_key?: string;
    /** Custom headers for external API calls */
    external_headers?: {
        [key: string]: string;
    }
    /** Whether the application is currently active */
    active?: boolean;
    /** Tags for categorizing the application */
    tags?: string[];
    /** Keywords for search functionality */
    keywords?: string[];
    /** Extended properties for custom integrations */
    extensors?: {
        [key: string]: string;
    }
    /** External system identifier */
    external_id?: string;
}

// Tool interfaces
export interface ToolInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    name?: string;
    friendly_name?: string;
    short_description: string;
    tool_schema: string;
    required_environment_variables?: string[];
    source_url?: string;
    url?: string;
    public?: boolean;
    active?: boolean;
    keywords?: string[];
    tags?: string[];
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Agent interfaces
export interface AgentInterface extends BaseEntity {
    id?: string;
    name: string;
    org?: string;
    user?: string;
    short_description: string;
    long_description?: string;
    image?: string;
    model?: string;
    temperature?: number;
    max_tokens?: number;
    system_prompt?: string;
    public?: boolean;
    active?: boolean;
    tags?: string[];
    keywords?: string[];
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Agent Group interfaces
export interface AgentGroupInterface extends BaseEntity {
    id?: string;
    name: string;
    org?: string;
    user?: string;
    short_description: string;
    long_description?: string;
    image?: string;
    agents?: string[];
    public?: boolean;
    active?: boolean;
    tags?: string[];
    keywords?: string[];
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Model interfaces
export interface ModelInterface extends BaseEntity {
    id?: string;
    name: string;
    org?: string;
    user?: string;
    short_description: string;
    long_description?: string;
    provider: string;
    model_id: string;
    max_tokens?: number;
    temperature?: number;
    public?: boolean;
    active?: boolean;
    tags?: string[];
    keywords?: string[];
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Client interfaces
export interface ClientInterface extends BaseEntity {
    id?: string;
    name: string;
    org?: string;
    user?: string;
    client_id: string;
    client_secret?: string;
    redirect_uris?: string[];
    scopes?: string[];
    active?: boolean;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// App Bot interfaces
export interface AppBotInterface extends BaseEntity {
    id?: string;
    app: string | AppInterface;
    response_url: string;
    org?: string;
    user?: string;
    agent?: string;
    agent_group?: string;
    api_key?: string;
    api_key_partial?: string;
    active?: boolean;
    tags?: string[];
    extensors?: {
        [key: string]: string;
    }
    external_id?: string;
    record_history?: RecordHistory;
}

export type DehydratedAppBotInterface = Omit<AppBotInterface, 'id' | 'app'> & { id: string, app: string }

// Billing interfaces
export interface WalletInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    balance: number;
    currency: string;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
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

export interface OrgPermissionInterface extends BaseEntity {
    id?: string;
    org: string;
    user?: string;
    client?: string;
    policy: string | AccessPolicyInterface;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

export interface UserPermissionInterface extends BaseEntity {
    id?: string;
    user: string;
    client: string;
    policy: string | AccessPolicyInterface;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Org User interfaces
export interface OrgUserInterface extends BaseEntity {
    id?: string;
    org: string;
    user: string;
    permission: string;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Objective interfaces
export interface ObjectiveInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    name: string;
    description?: string;
    status: string;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Offering interfaces
export interface OfferingInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    active?: boolean;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Snapshot interfaces
export interface SnapshotInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    type: string;
    data: any;
    metadata?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Vector Index interfaces
export interface VectorIndexInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    name: string;
    description?: string;
    dimensions: number;
    metric: string;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
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

// Agent Log interfaces
export interface AgentLogInterface extends BaseEntity {
    id?: string;
    agent: string;
    messages: any[];
    response?: any;
    metadata?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Agent Tool interfaces
export interface AgentToolInterface extends BaseEntity {
    id?: string;
    agent: string;
    tool: string;
    config?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
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

// App Webhook interfaces
export interface AppWebhookInterface extends BaseEntity {
    id?: string;
    app: string;
    url: string;
    events: string[];
    secret?: string;
    active?: boolean;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Client Session interfaces
export interface ClientSessionInterface extends BaseEntity {
    id?: string;
    client: string;
    token: string;
    expires_at: string;
    metadata?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
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

// Chat completion interfaces
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    max_tokens?: number;
    temperature?: number;
    stream?: boolean;
    logging?: boolean;
    log_id?: string;
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
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
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

export type GetAgentGroupsPayload = {
    data: AgentGroupInterface[];
    paging?: PagingInterface;
}

export type GetAgentGroupPayload = {
    data: AgentGroupInterface;
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

export type GetAppBotsPayload = {
    data: DehydratedAppBotInterface[];
    paging?: PagingInterface;
}

export type GetAppBotPayload = {
    data: DehydratedAppBotInterface;
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

export type GetObjectivesPayload = {
    data: ObjectiveInterface[];
    paging?: PagingInterface;
}

export type GetObjectivePayload = {
    data: ObjectiveInterface;
}

export type GetOfferingsPayload = {
    data: OfferingInterface[];
    paging?: PagingInterface;
}

export type GetOfferingPayload = {
    data: OfferingInterface;
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
 * OAuth configuration interface
 * 
 * Configuration object for OAuth2 Authorization Code flow with PKCE.
 * Used when initializing OAuth instances for secure authentication.
 * 
 * @example
 * ```typescript
 * const oauthConfig: OAuthConfig = {
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 *   appURL: 'https://mosaia.ai',
 *   scopes: ['read', 'write'],
 *   state: 'random-state-string'
 * };
 * ```
 */
export interface OAuthConfig {
    /** OAuth client ID (required) */
    clientId: string;
    /** Redirect URI for the OAuth flow (required) */
    redirectUri: string;
    /** App URL for authorization endpoints (required) */
    appURL: string;
    /** Array of scopes to request (optional) */
    scopes?: string[];
    /** State parameter for CSRF protection (optional) */
    state?: string;
}

/**
 * OAuth token response interface
 * 
 * Response structure returned when exchanging authorization codes for tokens
 * or refreshing access tokens.
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
 * 
 * @example
 * ```typescript
 * const errorResponse: OAuthErrorResponse = {
 *   error: 'invalid_grant',
 *   error_description: 'The authorization code has expired',
 *   error_uri: 'https://docs.mosaia.ai/oauth/errors'
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
