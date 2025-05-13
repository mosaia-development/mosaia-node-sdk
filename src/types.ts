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

export interface AppInterface {
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

export interface ToolInterface {
    id?: string;
    org?: string;
    user?: string;
    name?: string;
    friendly_name?: string;
    short_description: string;
    tool_schema: string;
    required_environment_variables?: string[];
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

export interface AppBotInterface {
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
    record_history?: {
        updated_at: string;
        created_at: string;
    }
}

export type DehydratedAppBotInterface = Omit<AppBotInterface, 'id' | 'app'> & { id: string, app: string }

export type GetAppBotsPayload = {
    data: DehydratedAppBotInterface[];
    paging?: PagingInterface
}

export type GetAppBotPayload = {
    data: DehydratedAppBotInterface;
    paging?: PagingInterface
}

export type GetAppsPayload = {
    data: AppInterface[];
    paging?: PagingInterface
}

export type GetAppPayload = {
    data: AppInterface;
    paging?: PagingInterface
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
