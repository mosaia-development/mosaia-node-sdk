import APIClient from './api-client';
import { MosiaConfig, AgentInterface, GetAgentsPayload, GetAgentPayload, APIResponse, ChatCompletionRequest, ChatCompletionResponse } from '../types';

export default class Agents {
    private client: APIClient;

    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all agents
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
    }): Promise<APIResponse<GetAgentsPayload>> {
        return this.client.GET<GetAgentsPayload>('/agent', params);
    }

    /**
     * Get agent by ID
     */
    async getById(id: string, params?: { export?: string }): Promise<APIResponse<GetAgentPayload>> {
        return this.client.GET<GetAgentPayload>(`/agent/${id}`, params);
    }

    /**
     * Create a new agent
     */
    async create(agent: Omit<AgentInterface, 'id'>): Promise<APIResponse<GetAgentPayload>> {
        return this.client.POST<GetAgentPayload>('/agent', agent);
    }

    /**
     * Update agent by ID
     */
    async update(id: string, agent: Partial<AgentInterface>): Promise<APIResponse<GetAgentPayload>> {
        return this.client.PUT<GetAgentPayload>(`/agent/${id}`, agent);
    }

    /**
     * Delete agent by ID
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/agent/${id}`, params);
    }

    /**
     * Chat completion with agent
     */
    async chatCompletion(request: ChatCompletionRequest): Promise<APIResponse<ChatCompletionResponse>> {
        return this.client.POST<ChatCompletionResponse>('/agent/chat/completions', request);
    }

    /**
     * Async chat completion with agent
     */
    async asyncChatCompletion(request: ChatCompletionRequest & { type: 'async' }): Promise<APIResponse<ChatCompletionResponse>> {
        return this.client.POST<ChatCompletionResponse>('/agent/chat/completions', request);
    }
} 