import APIClient from './api-client';
import { MosiaConfig, ModelInterface, GetModelsPayload, GetModelPayload, QueryParams, APIResponse, ChatCompletionRequest, ChatCompletionResponse } from '../types';
import { ConfigurationManager } from '../config';

/**
 * Models API client for managing AI models
 * 
 * This class provides methods for creating, reading, updating, and deleting
 * AI models on the Mosaia platform. Models define the AI capabilities
 * available for agents and applications.
 * 
 * @example
 * ```typescript
 * const models = new Models();
 * 
 * // Get all models
 * const allModels = await models.getAll();
 * 
 * // Get specific model
 * const model = await models.getById('model-id');
 * 
 * // Create new model
 * const newModel = await models.create({
 *   name: 'GPT-4 Model',
 *   provider: 'openai',
 *   model_id: 'gpt-4',
 *   short_description: 'Advanced language model'
 * });
 * ```
 */
export default class Models {
    private client: APIClient;
    private configManager: ConfigurationManager;

    /**
     * Creates a new Models API client instance
     * 
     * Uses ConfigurationManager for configuration settings.
     */
    constructor() {
        this.configManager = ConfigurationManager.getInstance();
        this.client = new APIClient();
    }

    /**
     * Get the current configuration
     */
    private get config(): MosiaConfig {
        return this.configManager.getConfig();
    }

    /**
     * Get all models with optional filtering and pagination
     * 
     * Retrieves a list of AI models from the platform with support for
     * filtering, searching, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of models to return
     * @param params.offset - Number of models to skip for pagination
     * @param params.search - Search term to filter models by name or description
     * @param params.search_type - Type of search to perform
     * @param params.search_types - Array of search types to include
     * @param params.q - Query string for advanced search
     * @param params.active - Filter by active status (true/false)
     * @param params.public - Filter by public status (true/false)
     * @param params.provider - Filter by model provider (e.g., 'openai', 'anthropic')
     * @returns Promise that resolves to a paginated list of models
     * 
     * @example
     * ```typescript
     * // Get all models
     * const allModels = await models.getAll();
     * 
     * // Get first 10 active OpenAI models
     * const openaiModels = await models.getAll({ 
     *   limit: 10, 
     *   offset: 0, 
     *   active: true,
     *   provider: 'openai'
     * });
     * 
     * // Search for GPT models
     * const gptModels = await models.getAll({ 
     *   search: 'gpt',
     *   limit: 20 
     * });
     * ```
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
     * Get a specific model by its ID
     * 
     * Retrieves detailed information about a single AI model from the platform.
     * 
     * @param id - The unique identifier of the model
     * @returns Promise that resolves to the model data
     * 
     * @example
     * ```typescript
     * const model = await models.getById('model-123');
     * console.log('Model name:', model.data.name);
     * console.log('Provider:', model.data.provider);
     * console.log('Model ID:', model.data.model_id);
     * console.log('Max tokens:', model.data.max_tokens);
     * ```
     */
    async getById(id: string): Promise<APIResponse<GetModelPayload>> {
        return this.client.GET<GetModelPayload>(`/model/${id}`);
    }

    /**
     * Create a new AI model
     * 
     * Creates a new AI model on the platform with the provided configuration.
     * 
     * @param model - Model data for the new model (ID will be generated)
     * @param model.name - Model name (required)
     * @param model.short_description - Brief description of the model
     * @param model.provider - Model provider (e.g., 'openai', 'anthropic') (required)
     * @param model.model_id - Provider-specific model identifier (required)
     * @param model.max_tokens - Maximum tokens for responses (optional)
     * @param model.temperature - Temperature setting (0-2) (optional)
     * @param model.public - Whether the model is publicly accessible (optional)
     * @returns Promise that resolves to the created model data
     * 
     * @example
     * ```typescript
     * const newModel = await models.create({
     *   name: 'Custom GPT-4 Turbo',
     *   short_description: 'Custom GPT-4 Turbo model with specific settings',
     *   provider: 'openai',
     *   model_id: 'gpt-4-turbo-preview',
     *   max_tokens: 4000,
     *   temperature: 0.7,
     *   public: true,
     *   tags: ['gpt-4', 'turbo', 'custom']
     * });
     * 
     * console.log('Created model ID:', newModel.data.id);
     * ```
     */
    async create(model: Omit<ModelInterface, 'id'>): Promise<APIResponse<GetModelPayload>> {
        return this.client.POST<GetModelPayload>('/model', model);
    }

    /**
     * Update an existing AI model
     * 
     * Updates a model with the provided data. Only the provided fields
     * will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the model to update
     * @param model - Partial model data containing only the fields to update
     * @returns Promise that resolves to the updated model data
     * 
     * @example
     * ```typescript
     * // Update model name and description
     * const updatedModel = await models.update('model-123', {
     *   name: 'Updated GPT-4 Model',
     *   short_description: 'Updated description'
     * });
     * 
     * // Update model settings
     * const updatedModel = await models.update('model-123', {
     *   max_tokens: 8000,
     *   temperature: 0.5
     * });
     * 
     * // Make model public
     * const updatedModel = await models.update('model-123', {
     *   public: true
     * });
     * ```
     */
    async update(id: string, model: Partial<ModelInterface>): Promise<APIResponse<GetModelPayload>> {
        return this.client.PUT<GetModelPayload>(`/model/${id}`, model);
    }

    /**
     * Delete an AI model
     * 
     * Removes an AI model from the platform. By default, this performs a soft delete
     * (marks the model as inactive). Use the force parameter for hard deletion.
     * 
     * @param id - The unique identifier of the model to delete
     * @param params - Optional parameters for deletion behavior
     * @param params.force - If true, performs a hard delete instead of soft delete
     * @returns Promise that resolves when the model is successfully deleted
     * 
     * @example
     * ```typescript
     * // Soft delete (mark as inactive)
     * await models.delete('model-123');
     * 
     * // Hard delete (permanently remove)
     * await models.delete('model-123', { force: true });
     * ```
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/model/${id}`, params);
    }

    /**
     * Chat completion with a model (OpenAI compatible)
     * 
     * Sends a chat completion request to a specific model using the
     * OpenAI-compatible API format.
     * 
     * @param request - Chat completion request parameters
     * @param request.model - AI model to use for completion
     * @param request.messages - Array of chat messages
     * @param request.max_tokens - Maximum tokens for the response
     * @param request.temperature - Temperature setting (0-2)
     * @param request.stream - Whether to stream the response
     * @param request.logging - Whether to log the completion
     * @param request.log_id - Log identifier for tracking
     * @returns Promise that resolves to the chat completion response
     * 
     * @example
     * ```typescript
     * const completion = await models.chatCompletion({
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'system', content: 'You are a helpful assistant.' },
     *     { role: 'user', content: 'What is the capital of France?' }
     *   ],
     *   max_tokens: 100,
     *   temperature: 0.7,
     *   logging: true,
     *   log_id: 'conversation-123'
     * });
     * 
     * console.log('Response:', completion.data.choices[0].message.content);
     * console.log('Usage:', completion.data.usage);
     * ```
     */
    async chatCompletion(request: ChatCompletionRequest): Promise<APIResponse<ChatCompletionResponse>> {
        return this.client.POST<ChatCompletionResponse>('/model/chat/completions', request);
    }
} 