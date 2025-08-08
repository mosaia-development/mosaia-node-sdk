import { Chat } from '../functions/chat';
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
 * This class represents an AI agent that can perform tasks, handle conversations,
 * and execute workflows. Agents are the core AI entities in the platform,
 * providing natural language understanding and task automation capabilities.
 * 
 * Features:
 * - Agent configuration management
 * - Chat and completion operations
 * - Image/avatar management
 * - Tool integration
 * - Model configuration
 * 
 * @remarks
 * Agents can be configured with different models, temperature settings,
 * and system prompts to customize their behavior. They can also be
 * assigned tools to extend their capabilities.
 * 
 * @example
 * Basic agent usage:
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
 * ```
 * 
 * @example
 * Using chat capabilities:
 * ```typescript
 * // Chat with the agent
 * const response = await agent.chat.completions.create({
 *   messages: [
 *     { role: 'user', content: 'How can I reset my password?' }
 *   ],
 *   temperature: 0.7,
 *   max_tokens: 150
 * });
 * 
 * console.log('Agent response:', response.choices[0].message.content);
 * ```
 * 
 * @extends BaseModel<AgentInterface>
 * @category Models
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
     * Get the chat functionality for this agent
     * 
     * This getter provides access to the agent's chat capabilities through
     * the Chat class. It allows for chat completions and other chat-related
     * operations specific to this agent.
     * 
     * @returns A new Chat instance configured for this agent
     * 
     * @example
     * Basic chat:
     * ```typescript
     * const response = await agent.chat.completions.create({
     *   messages: [
     *     { role: 'user', content: 'Hello!' }
     *   ]
     * });
     * ```
     * 
     * @example
     * Advanced chat configuration:
     * ```typescript
     * const response = await agent.chat.completions.create({
     *   messages: [
     *     { role: 'system', content: 'You are a helpful assistant.' },
     *     { role: 'user', content: 'What can you help me with?' }
     *   ],
     *   temperature: 0.7,
     *   max_tokens: 150,
     *   stream: false
     * });
     * 
     * console.log('Response:', response.choices[0].message.content);
     * ```
     */
    get chat() {
        return new Chat(this.getUri());
    }
}