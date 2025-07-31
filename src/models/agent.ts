import {
    AgentInterface,
    GetAgentPayload,
    ChatCompletionRequest,
    ChatCompletionResponse,
    APIResponse
} from '../types';
import { BaseModel } from './base';

/**
 * Agent class for managing AI agent instances in the Mosaia SDK
 * 
 * Represents an AI agent that can perform specific tasks, handle conversations,
 * and execute workflows based on its configuration. Agents are the core AI entities
 * that interact with users and perform intelligent operations.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - Agent data management and validation
 * - Image upload for agent branding and identification
 * - Chat completion operations using the agent
 * - Agent configuration and tool management
 * - Integration with the Mosaia API for agent operations
 * 
 * @example
 * ```typescript
 * import { Agent } from 'mosaia-node-sdk';
 * 
 * // Create an agent instance
 * const agent = new Agent({
 *   name: 'Customer Support Agent',
 *   short_description: 'AI agent for customer inquiries',
 *   model: 'gpt-4',
 *   temperature: 0.7,
 *   system_prompt: 'You are a helpful customer support agent.'
 * });
 * 
 * // Upload an agent avatar
 * const file = new File(['image data'], 'agent-avatar.png', { type: 'image/png' });
 * await agent.uploadImage(file);
 * 
 * // Perform a chat completion with the agent
 * const response = await agent.chatCompletion({
 *   model: 'gpt-4',
 *   messages: [
 *     { role: 'user', content: 'How can I reset my password?' }
 *   ]
 * });
 * ```
 * 
 * @extends BaseModel<AgentInterface>
 */
export default class Agent extends BaseModel<AgentInterface> {
    /**
     * Creates a new Agent instance
     * 
     * Initializes an agent with the provided configuration data and optional URI.
     * The agent represents an AI entity that can perform intelligent tasks.
     * 
     * @param data - Agent configuration data
     * @param uri - Optional URI path for the agent endpoint. Defaults to '/agent'
     * 
     * @example
     * ```typescript
     * const agent = new Agent({
     *   name: 'Support Agent',
     *   short_description: 'Customer support AI',
     *   model: 'gpt-4',
     *   temperature: 0.7
     * });
     * ```
     */
    constructor(data: Partial<AgentInterface>, uri?: string) {
        super(data, uri || '/agent');
    }

    /**
     * Upload an image for the agent
     * 
     * Uploads an image file to be associated with the agent for branding
     * and identification purposes.
     * 
     * @param file - Image file to upload (supports common image formats)
     * @returns Promise that resolves to the updated agent instance
     * @throws {Error} When upload fails or network errors occur
     * 
     * @example
     * ```typescript
     * // Upload an agent avatar
     * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     * const file = fileInput.files[0];
     * 
     * try {
     *   await agent.uploadImage(file);
     *   console.log('Agent image uploaded successfully');
     * } catch (error) {
     *   console.error('Upload failed:', error.message);
     * }
     * ```
     */
    async uploadImage(file: File): Promise<Agent> {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const {
                data,
                error
            } = await this.apiClient.POST<GetAgentPayload>(`${this.getUri()}/image/upload`, formData);
            
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
     * Perform a chat completion with the agent
     * 
     * Sends a chat completion request to the agent and returns the generated response.
     * The agent will use its configured model and settings to provide intelligent responses.
     * Supports both synchronous and asynchronous completion modes.
     * 
     * @param request - Chat completion request parameters including model, messages, and options
     * @param isAsync - Whether to perform an asynchronous completion. Defaults to false.
     * @returns Promise that resolves to the chat completion response
     * 
     * @example
     * ```typescript
     * // Synchronous completion with agent
     * const response = await agent.chatCompletion({
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'system', content: 'You are a helpful assistant.' },
     *     { role: 'user', content: 'What is the weather like today?' }
     *   ],
     *   max_tokens: 150,
     *   temperature: 0.7
     * });
     * 
     * // Asynchronous completion for complex tasks
     * const asyncResponse = await agent.chatCompletion({
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'user', content: 'Analyze this large document and provide a summary.' }
     *   ]
     * }, true);
     * ```
     */
    async chatCompletion(request: ChatCompletionRequest, isAsync: boolean = false): Promise<ChatCompletionResponse> {
        let uri = '/chat/completions';

        if (isAsync) uri += '?type=async';

        return this.apiClient.POST<ChatCompletionResponse>(`${this.getUri()}${uri}`, request);
    }
}