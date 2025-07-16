import APIClient from './api-client';
import { MosiaConfig, ModelInterface, GetModelsPayload, GetModelPayload, APIResponse, ChatCompletionRequest, ChatCompletionResponse } from '../types';

export default class Models {
    private client: APIClient;

    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all models
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
        provider?: string;
    }): Promise<APIResponse<GetModelsPayload>> {
        return this.client.GET<GetModelsPayload>('/model', params);
    }

    /**
     * Get model by ID
     */
    async getById(id: string): Promise<APIResponse<GetModelPayload>> {
        return this.client.GET<GetModelPayload>(`/model/${id}`);
    }

    /**
     * Create a new model
     */
    async create(model: Omit<ModelInterface, 'id'>): Promise<APIResponse<GetModelPayload>> {
        return this.client.POST<GetModelPayload>('/model', model);
    }

    /**
     * Update model by ID
     */
    async update(id: string, model: Partial<ModelInterface>): Promise<APIResponse<GetModelPayload>> {
        return this.client.PUT<GetModelPayload>(`/model/${id}`, model);
    }

    /**
     * Delete model by ID
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/model/${id}`, params);
    }

    /**
     * Chat completion with model (OpenAI compatible)
     */
    async chatCompletion(request: ChatCompletionRequest): Promise<APIResponse<ChatCompletionResponse>> {
        return this.client.POST<ChatCompletionResponse>('/model/chat/completions', request);
    }
} 