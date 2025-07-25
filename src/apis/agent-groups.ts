import APIClient from './api-client';
import { MosiaConfig, AgentGroupInterface, GetAgentGroupsPayload, GetAgentGroupPayload, APIResponse, ChatCompletionRequest, ChatCompletionResponse } from '../types';

/**
 * Agent Groups API client for managing AI agent groups
 * 
 * This class provides methods for creating, reading, updating, and deleting
 * agent groups on the Mosaia platform. Agent groups allow multiple agents
 * to collaborate on complex tasks and conversations.
 * 
 * @example
 * ```typescript
 * const agentGroups = new AgentGroups(config);
 * 
 * // Get all agent groups
 * const allGroups = await agentGroups.getAll();
 * 
 * // Get specific agent group
 * const group = await agentGroups.getById('group-id');
 * 
 * // Create new agent group
 * const newGroup = await agentGroups.create({
 *   name: 'Support Team',
 *   short_description: 'Multi-agent support team',
 *   agents: ['agent-1', 'agent-2', 'agent-3']
 * });
 * 
 * // Chat completion with agent group
 * const completion = await agentGroups.chatCompletion({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Help me with a complex issue.' }]
 * });
 * ```
 */
export default class AgentGroups {
    private client: APIClient;

    /**
     * Creates a new Agent Groups API client instance
     * 
     * @param config - Configuration object containing API settings
     */
    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all agent groups with optional filtering and pagination
     * 
     * Retrieves a list of agent groups from the platform with support for
     * filtering, searching, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of agent groups to return
     * @param params.offset - Number of agent groups to skip for pagination
     * @param params.search - Search term to filter groups by name or description
     * @param params.search_type - Type of search to perform
     * @param params.search_types - Array of search types to include
     * @param params.q - Query string for advanced search
     * @param params.active - Filter by active status (true/false)
     * @param params.public - Filter by public status (true/false)
     * @returns Promise that resolves to a paginated list of agent groups
     * 
     * @example
     * ```typescript
     * // Get all agent groups
     * const allGroups = await agentGroups.getAll();
     * 
     * // Get first 10 active groups
     * const activeGroups = await agentGroups.getAll({ 
     *   limit: 10, 
     *   offset: 0, 
     *   active: true 
     * });
     * 
     * // Search for groups
     * const searchResults = await agentGroups.getAll({ 
     *   search: 'support',
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
    }): Promise<APIResponse<GetAgentGroupsPayload>> {
        return this.client.GET<GetAgentGroupsPayload>('/group', params);
    }

    /**
     * Get a specific agent group by its ID
     * 
     * Retrieves detailed information about a single agent group from the platform.
     * 
     * @param id - The unique identifier of the agent group
     * @returns Promise that resolves to the agent group data
     * 
     * @example
     * ```typescript
     * const group = await agentGroups.getById('group-123');
     * console.log('Group name:', group.data.name);
     * console.log('Number of agents:', group.data.agents?.length);
     * console.log('Description:', group.data.short_description);
     * ```
     */
    async getById(id: string): Promise<APIResponse<GetAgentGroupPayload>> {
        return this.client.GET<GetAgentGroupPayload>(`/group/${id}`);
    }

    /**
     * Create a new agent group
     * 
     * Creates a new agent group on the platform with the provided configuration.
     * 
     * @param group - Agent group data for the new group (ID will be generated)
     * @param group.name - Group name (required)
     * @param group.short_description - Brief description of the group
     * @param group.agents - Array of agent IDs to include in the group
     * @param group.public - Whether the group is publicly accessible
     * @returns Promise that resolves to the created agent group data
     * 
     * @example
     * ```typescript
     * const newGroup = await agentGroups.create({
     *   name: 'Customer Support Team',
     *   short_description: 'Multi-agent support team for customer inquiries',
     *   agents: ['agent-1', 'agent-2', 'agent-3'],
     *   public: true,
     *   tags: ['support', 'multi-agent']
     * });
     * 
     * console.log('Created group ID:', newGroup.data.id);
     * ```
     */
    async create(group: Omit<AgentGroupInterface, 'id'>): Promise<APIResponse<GetAgentGroupPayload>> {
        return this.client.POST<GetAgentGroupPayload>('/group', group);
    }

    /**
     * Update an existing agent group
     * 
     * Updates an agent group with the provided data. Only the provided fields
     * will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the agent group to update
     * @param group - Partial agent group data containing only the fields to update
     * @returns Promise that resolves to the updated agent group data
     * 
     * @example
     * ```typescript
     * // Update group name and description
     * const updatedGroup = await agentGroups.update('group-123', {
     *   name: 'Updated Support Team',
     *   short_description: 'Updated description'
     * });
     * 
     * // Add new agents to the group
     * const updatedGroup = await agentGroups.update('group-123', {
     *   agents: ['agent-1', 'agent-2', 'agent-3', 'agent-4']
     * });
     * ```
     */
    async update(id: string, group: Partial<AgentGroupInterface>): Promise<APIResponse<GetAgentGroupPayload>> {
        return this.client.PUT<GetAgentGroupPayload>(`/group/${id}`, group);
    }

    /**
     * Delete an agent group
     * 
     * Removes an agent group from the platform. By default, this performs a soft delete
     * (marks the group as inactive). Use the force parameter for hard deletion.
     * 
     * @param id - The unique identifier of the agent group to delete
     * @param params - Optional parameters for deletion behavior
     * @param params.force - If true, performs a hard delete instead of soft delete
     * @returns Promise that resolves when the agent group is successfully deleted
     * 
     * @example
     * ```typescript
     * // Soft delete (mark as inactive)
     * await agentGroups.delete('group-123');
     * 
     * // Hard delete (permanently remove)
     * await agentGroups.delete('group-123', { force: true });
     * ```
     */
    async delete(id: string, params?: { force?: boolean }): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/group/${id}`, params);
    }

    /**
     * Chat completion with an agent group
     * 
     * Sends a chat completion request to an agent group, allowing multiple
     * agents to collaborate on the response.
     * 
     * @param request - Chat completion request parameters
     * @param request.model - AI model to use for completion
     * @param request.messages - Array of chat messages
     * @param request.max_tokens - Maximum tokens for the response
     * @param request.temperature - Temperature setting (0-2)
     * @returns Promise that resolves to the chat completion response
     * 
     * @example
     * ```typescript
     * const completion = await agentGroups.chatCompletion({
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'system', content: 'You are a team of experts.' },
     *     { role: 'user', content: 'Help me solve this complex problem.' }
     *   ],
     *   max_tokens: 500,
     *   temperature: 0.7
     * });
     * 
     * console.log('Group response:', completion.data.choices[0].message.content);
     * ```
     */
    async chatCompletion(request: ChatCompletionRequest): Promise<APIResponse<ChatCompletionResponse>> {
        return this.client.POST<ChatCompletionResponse>('/group/chat/completions', request);
    }
} 