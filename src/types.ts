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
 * Organization entity interface
 * 
 * Represents an organization in the Mosaia platform. Organizations can contain
 * multiple users, applications, and other resources. They provide a way to
 * group and manage related resources and users.
 * 
 * @example
 * ```typescript
 * const org: OrganizationInterface = {
 *   id: 'org-123',
 *   name: 'Acme Corp',
 *   short_description: 'Leading technology company',
 *   long_description: 'Acme Corp is a leading technology company specializing in AI solutions...',
 *   image: 'https://example.com/logo.png',
 *   external_id: 'acme-corp-123',
 *   extensors: {
 *     industry: 'technology',
 *     founded_year: '2020'
 *   },
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
    };
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
    // Collection getters (available on App model instances)
    readonly connectors?: any; // AppConnectors collection
    readonly webhooks?: any; // AppWebhooks collection
    // Note: image property conflicts with image URL string, so not typed here
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
    };
    // Collection getters (available on Agent model instances)
    readonly chat?: any; // Chat functionality
    // Note: image property conflicts with image URL string, so not typed here
    readonly tasks?: any; // Tasks collection
    readonly logs?: any; // Logs collection
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

// Drive interfaces
export interface DriveInterface extends BaseEntity {
    id?: string;
    org?: string;
    user?: string;
    name: string;
    description?: string;
    active?: boolean;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    };
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

// Agent Log interfaces
export interface AgentLogInterface extends BaseEntity {
    id?: string;
    agent: string;
    response?: any;
    metadata?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    };
    // Collection getters (available on Log model instances)
    readonly messages?: any; // Messages collection (replaces messages: any[] data property)
    readonly snapshots?: any; // Snapshots collection
}

// Agent Tool interfaces
export interface AgentToolInterface extends BaseEntity {
    id?: string;
    agent: AgentInterface;
    tool: ToolInterface;
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

// Message interfaces
export interface MessageInterface extends BaseEntity {
    id?: string;
    log: string;
    role?: string;
    content?: string;
    metadata?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Scope interfaces
export interface ScopeInterface {
    id?: string;
    name: string;
    description?: string;
}

// Task interfaces
export interface TaskInterface extends BaseEntity {
    id?: string;
    name?: string;
    description?: string;
    status?: string;
    metadata?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    };
    // Collection getters (available on Task model instances)
    readonly plans?: any; // Plans collection
}

export interface PlanInterface extends BaseEntity {
    id?: string;
    task: string;
    name?: string;
    description?: string;
    plan?: any;
    metadata?: {
        [key: string]: any;
    }
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
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