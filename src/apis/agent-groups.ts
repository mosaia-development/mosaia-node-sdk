import APIClient from './api-client';
import { MosiaConfig, AgentGroupInterface, GetAgentGroupsPayload, GetAgentGroupPayload, APIResponse, ChatCompletionRequest, ChatCompletionResponse } from '../types';

export default class AgentGroups {
    private client: APIClient;

    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all agent groups
     */
    async getAll(params?: {
        limit?: number;
        offset?: number;
        search?: string;
        search_type?: string;
        search_types?: string[];
        q?: string;
        active?: boolean;
        public?: boolean;
    }): Promise<APIResponse<GetAgentGroupsPayload>> {
        return this.client.GET<GetAgentGroupsPayload>('/group', params);
    }

    /**
     * Get agent group by ID
     */
    async getById(id: string): Promise<APIResponse<GetAgentGroupPayload>> {
        return this.client.GET<GetAgentGroupPayload>(`/group/${id}`);
    }

    /**
     * Create a new agent group
     */
    async create(group: Omit<AgentGroupInterface, 'id'>): Promise<APIResponse<GetAgentGroupPayload>> {
        return this.client.POST<GetAgentGroupPayload>('/group', group);
    }

    /**
     * Update agent group by ID
     */
    async update(id: string, group: Partial<AgentGroupInterface>): Promise<APIResponse<GetAgentGroupPayload>> {
        return this.client.PUT<GetAgentGroupPayload>(`/group/${id}`, group);
    }

    /**
     * Delete agent group by ID
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/group/${id}`, params);
    }

    /**
     * Chat completion with agent group
     */
    async chatCompletion(request: ChatCompletionRequest): Promise<APIResponse<ChatCompletionResponse>> {
        return this.client.POST<ChatCompletionResponse>('/group/chat/completions', request);
    }
} 