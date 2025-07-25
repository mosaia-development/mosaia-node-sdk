import APIClient from './api-client';
import { MosiaConfig, AgentInterface, GetAgentsPayload, GetAgentPayload, APIResponse, ChatCompletionRequest, ChatCompletionResponse } from '../types';

/**
 * Agents API client for managing AI agents
 * 
 * This class provides methods for creating, reading, updating, and deleting
 * AI agents on the Mosaia platform. Agents can be configured with different
 * models, prompts, and settings for AI interactions.
 * 
 * @example
 * ```typescript
 * const agents = new Agents(config);
 * 
 * // Get all agents
 * const allAgents = await agents.getAll();
 * 
 * // Get specific agent
 * const agent = await agents.getById('agent-id');
 * 
 * // Create new agent
 * const newAgent = await agents.create({
 *   name: 'My AI Assistant',
 *   short_description: 'Helpful AI assistant',
 *   model: 'gpt-4',
 *   system_prompt: 'You are a helpful assistant.'
 * });
 * 
 * // Chat completion with agent
 * const completion = await agents.chatCompletion({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * });
 * ```
 */
export default class Agents {
    private client: APIClient;

    /**
     * Creates a new Agents API client instance
     * 
     * @param config - Configuration object containing API settings
     */
    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all agents with optional filtering and pagination
     * 
     * Retrieves a list of agents from the platform with support for
     * filtering, searching, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of agents to return
     * @param params.offset - Number of agents to skip for pagination
     * @param params.search - Search term to filter agents by name or description
     * @param params.search_type - Type of search to perform
     * @param params.search_types - Array of search types to include
     * @param params.q - Query string for advanced search
     * @param params.active - Filter by active status (true/false)
     * @param params.public - Filter by public status (true/false)
     * @returns Promise that resolves to a paginated list of agents
     * 
     * @example
     * ```typescript
     * // Get all agents
     * const allAgents = await agents.getAll();
     * 
     * // Get first 10 active agents
     * const activeAgents = await agents.getAll({ 
     *   limit: 10, 
     *   offset: 0, 
     *   active: true 
     * });
     * 
     * // Search for agents
     * const searchResults = await agents.getAll({ 
     *   search: 'assistant',
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
    }): Promise<APIResponse<GetAgentsPayload>> {
        return this.client.GET<GetAgentsPayload>('/agent', params);
    }

    /**
     * Get a specific agent by its ID
     * 
     * Retrieves detailed information about a single agent from the platform.
     * 
     * @param id - The unique identifier of the agent
     * @param params - Optional parameters
     * @param params.export - Export format for the agent data
     * @returns Promise that resolves to the agent data
     * 
     * @example
     * ```typescript
     * const agent = await agents.getById('agent-123');
     * console.log('Agent name:', agent.data.name);
     * console.log('Model:', agent.data.model);
     * console.log('System prompt:', agent.data.system_prompt);
     * ```
     */
    async getById(id: string, params?: { export?: string }): Promise<APIResponse<GetAgentPayload>> {
        return this.client.GET<GetAgentPayload>(`/agent/${id}`, params);
    }

    /**
     * Create a new agent
     * 
     * Creates a new AI agent on the platform with the provided configuration.
     * 
     * @param agent - Agent data for the new agent (ID will be generated)
     * @param agent.name - Agent name (required)
     * @param agent.short_description - Brief description of the agent
     * @param agent.model - AI model to use (e.g., 'gpt-4', 'gpt-3.5-turbo')
     * @param agent.system_prompt - System prompt for the agent
     * @param agent.temperature - Temperature setting for responses (0-2)
     * @param agent.max_tokens - Maximum tokens for responses
     * @returns Promise that resolves to the created agent data
     * 
     * @example
     * ```typescript
     * const newAgent = await agents.create({
     *   name: 'Customer Support Agent',
     *   short_description: 'AI agent for customer support',
     *   model: 'gpt-4',
     *   system_prompt: 'You are a helpful customer support agent.',
     *   temperature: 0.7,
     *   max_tokens: 1000,
     *   public: true
     * });
     * 
     * console.log('Created agent ID:', newAgent.data.id);
     * ```
     */
    async create(agent: Omit<AgentInterface, 'id'>): Promise<APIResponse<GetAgentPayload>> {
        return this.client.POST<GetAgentPayload>('/agent', agent);
    }

    /**
     * Update an existing agent
     * 
     * Updates an agent with the provided data. Only the provided fields
     * will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the agent to update
     * @param agent - Partial agent data containing only the fields to update
     * @returns Promise that resolves to the updated agent data
     * 
     * @example
     * ```typescript
     * // Update agent name and description
     * const updatedAgent = await agents.update('agent-123', {
     *   name: 'Updated Agent Name',
     *   short_description: 'Updated description'
     * });
     * 
     * // Update agent model and settings
     * const updatedAgent = await agents.update('agent-123', {
     *   model: 'gpt-4-turbo',
     *   temperature: 0.5,
     *   max_tokens: 2000
     * });
     * ```
     */
    async update(id: string, agent: Partial<AgentInterface>): Promise<APIResponse<GetAgentPayload>> {
        return this.client.PUT<GetAgentPayload>(`/agent/${id}`, agent);
    }

    /**
     * Delete an agent
     * 
     * Removes an agent from the platform. By default, this performs a soft delete
     * (marks the agent as inactive). Use the force parameter for hard deletion.
     * 
     * @param id - The unique identifier of the agent to delete
     * @param params - Optional parameters for deletion behavior
     * @param params.force - If true, performs a hard delete instead of soft delete
     * @returns Promise that resolves when the agent is successfully deleted
     * 
     * @example
     * ```typescript
     * // Soft delete (mark as inactive)
     * await agents.delete('agent-123');
     * 
     * // Hard delete (permanently remove)
     * await agents.delete('agent-123', { force: true });
     * ```
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/agent/${id}`, params);
    }

    /**
     * Chat completion with an agent
     * 
     * Sends a chat completion request to a specific agent and returns
     * the AI-generated response.
     * 
     * @param request - Chat completion request parameters
     * @param request.model - AI model to use for completion
     * @param request.messages - Array of chat messages
     * @param request.max_tokens - Maximum tokens for the response
     * @param request.temperature - Temperature setting (0-2)
     * @param request.stream - Whether to stream the response
     * @returns Promise that resolves to the chat completion response
     * 
     * @example
     * ```typescript
     * const completion = await agents.chatCompletion({
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'system', content: 'You are a helpful assistant.' },
     *     { role: 'user', content: 'What is the capital of France?' }
     *   ],
     *   max_tokens: 100,
     *   temperature: 0.7
     * });
     * 
     * console.log('Response:', completion.data.choices[0].message.content);
     * ```
     */
    async chatCompletion(request: ChatCompletionRequest): Promise<APIResponse<ChatCompletionResponse>> {
        return this.client.POST<ChatCompletionResponse>('/agent/chat/completions', request);
    }

    /**
     * Asynchronous chat completion with an agent
     * 
     * Sends an asynchronous chat completion request to a specific agent.
     * This is useful for long-running conversations or when you need
     * to handle the response asynchronously.
     * 
     * @param request - Chat completion request parameters with async type
     * @param request.type - Must be 'async' for asynchronous completion
     * @param request.model - AI model to use for completion
     * @param request.messages - Array of chat messages
     * @returns Promise that resolves to the chat completion response
     * 
     * @example
     * ```typescript
     * const completion = await agents.asyncChatCompletion({
     *   type: 'async',
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'user', content: 'Generate a long story for me.' }
     *   ]
     * });
     * 
     * console.log('Async response:', completion.data.choices[0].message.content);
     * ```
     */
    async asyncChatCompletion(request: ChatCompletionRequest & { type: 'async' }): Promise<APIResponse<ChatCompletionResponse>> {
        return this.client.POST<ChatCompletionResponse>('/agent/chat/completions', request);
    }
} 