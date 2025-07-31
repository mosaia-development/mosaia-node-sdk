import {
    AgentGroupInterface,
    APIResponse,
    ChatCompletionRequest,
    ChatCompletionResponse,
    GetAgentGroupPayload
} from '../types';
import { BaseModel } from './base';

/**
 * AgentGroup class for managing agent group instances in the Mosaia SDK
 * 
 * Represents a collection of AI agents that can work together to perform coordinated
 * tasks and workflows. Agent groups allow for organizing multiple agents with
 * shared configurations and collaborative capabilities.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - Agent group data management and validation
 * - Image upload for group branding and identification
 * - Chat completion operations using the agent group
 * - Group configuration and member management
 * - Integration with the Mosaia API for group operations
 * 
 * @example
 * ```typescript
 * import { AgentGroup } from 'mosaia-node-sdk';
 * 
 * // Create an agent group instance
 * const agentGroup = new AgentGroup({
 *   name: 'Customer Support Team',
 *   short_description: 'AI agents for customer support',
 *   agents: ['agent-1', 'agent-2', 'agent-3']
 * });
 * 
 * // Upload a group image
 * const file = new File(['image data'], 'group-logo.png', { type: 'image/png' });
 * await agentGroup.uploadImage(file);
 * 
 * // Perform a chat completion with the group
 * const response = await agentGroup.chatCompletion({
 *   model: 'gpt-4',
 *   messages: [
 *     { role: 'user', content: 'I need help with my order.' }
 *   ]
 * });
 * ```
 * 
 * @extends BaseModel<AgentGroupInterface>
 */
export default class AgentGroup extends BaseModel<AgentGroupInterface> {
    /**
     * Creates a new AgentGroup instance
     * 
     * Initializes an agent group with the provided configuration data and optional URI.
     * The agent group represents a collection of AI agents that can work together.
     * 
     * @param data - Agent group configuration data
     * @param uri - Optional URI path for the agent group endpoint. Defaults to '/group'
     * 
     * @example
     * ```typescript
     * const agentGroup = new AgentGroup({
     *   name: 'Support Team',
     *   short_description: 'Customer support agents',
     *   agents: ['agent-1', 'agent-2']
     * });
     * ```
     */
    constructor(data: Partial<AgentGroupInterface>, uri?: string) {
        super(data, uri || '/group');
    }

    /**
     * Upload an image for the agent group
     * 
     * Uploads an image file to be associated with the agent group for branding
     * and identification purposes.
     * 
     * @param file - Image file to upload (supports common image formats)
     * @returns Promise that resolves to the updated agent group instance
     * @throws {Error} When upload fails or network errors occur
     * 
     * @example
     * ```typescript
     * // Upload a group logo
     * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     * const file = fileInput.files[0];
     * 
     * try {
     *   await agentGroup.uploadImage(file);
     *   console.log('Image uploaded successfully');
     * } catch (error) {
     *   console.error('Upload failed:', error.message);
     * }
     * ```
     */
    async uploadImage(file: File): Promise<AgentGroup> {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const {
                data,
                error
            } = await this.apiClient.POST<GetAgentGroupPayload>(`${this.getUri()}/image/upload`, formData);
            
            if (error) {
                throw new Error(error.message);
            }
            this.update(data as any);
    
            return this;
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Perform a chat completion with the agent group
     * 
     * Sends a chat completion request to the agent group and returns the generated response.
     * The agent group will coordinate among its member agents to provide the best response.
     * Supports both synchronous and asynchronous completion modes.
     * 
     * @param request - Chat completion request parameters including model, messages, and options
     * @param isAsync - Whether to perform an asynchronous completion. Defaults to false.
     * @returns Promise that resolves to the chat completion response
     * 
     * @example
     * ```typescript
     * // Synchronous completion with agent group
     * const response = await agentGroup.chatCompletion({
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'system', content: 'You are a customer support team.' },
     *     { role: 'user', content: 'I have a billing question.' }
     *   ],
     *   max_tokens: 200,
     *   temperature: 0.7
     * });
     * 
     * // Asynchronous completion for complex queries
     * const asyncResponse = await agentGroup.chatCompletion({
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'user', content: 'Analyze my entire order history and provide recommendations.' }
     *   ]
     * }, true);
     * ```
     */
    async chatCompletion(request: ChatCompletionRequest, isAsync: boolean = false): Promise<APIResponse<ChatCompletionResponse>> {
        let uri = '/chat/completions';

        if (isAsync) uri += '?type=async';
        return this.apiClient.POST<ChatCompletionResponse>(`${this.getUri()}${uri}`, request);
    }
} 