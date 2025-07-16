"use strict";

export interface MosiaConfig {
    apiKey?: string;
    version?: string;
    baseURL?: string;
    frontendURL?: string;
    clientId?: string;
    clientSecret?: string;
    user?: string;
    org?: string;
}

export interface APIResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export interface ErrorResponse {
    message: string;
    code: string;
    status: number;
}

export interface PagingInterface {
    offset?: number;
    limit?: number;
    total?: number;
    page?: number;
    total_pages?: number;
}

// Base interfaces
export interface BaseEntity {
    id?: string;
    active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface RecordHistory {
    updated_at: string;
    created_at: string;
}

// User interfaces
export interface UserInterface extends BaseEntity {
    id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    image?: string;
    public_address?: string;
    org?: string;
    user?: string;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// Organization interfaces
export interface OrganizationInterface extends BaseEntity {
    id?: string;
    name: string;
    short_description?: string;
    long_description?: string;
    image?: string;
    external_id?: string;
    extensors?: {
        [key: string]: string;
    }
}

// App interfaces
export interface AppInterface extends BaseEntity {
    id?: string;
    name: string;
    org?: string;
    user?: string;
    short_description: string;
    long_description?: string;
    image?: string;
    external_app_url?: string;
    external_api_key?: string
    external_headers?: {
        [key: string]: string;
    }
    active?: boolean;
    tags?: string[];
    keywords?: string[];
    extensors?: {
        [key: string]: string;
    }
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

export interface OAuthConfig {
    clientId: string;
    redirectUri: string;
    scopes?: string[];
    state?: string;
}

export interface OAuthTokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    sub: string;
    iat: string;
    exp: string;
}

export interface OAuthErrorResponse {
    error: string;
    error_description?: string;
    error_uri?: string;
}
