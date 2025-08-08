import {
    AgentGroupInterface,
    APIResponse,
    ChatCompletionRequest,
    ChatCompletionResponse,
    GetAgentGroupPayload
} from '../types';
import { BaseModel } from './base';
import { Chat } from '../functions/chat';

/**
 * AgentGroup class for managing collaborative AI agent groups
 * 
 * This class represents a collection of AI agents that work together to handle
 * complex tasks and workflows. Agent groups enable coordinated responses and
 * shared knowledge across multiple specialized agents.
 * 
 * Features:
 * - Group configuration management
 * - Member agent coordination
 * - Collaborative chat capabilities
 * - Group branding/image management
 * - Shared knowledge base
 * 
 * @remarks
 * Agent groups are particularly useful for scenarios requiring multiple
 * specialized agents to work together, such as:
 * - Customer support teams with different expertise
 * - Multi-step workflow automation
 * - Complex problem-solving requiring diverse skills
 * 
 * @example
 * Basic group setup:
 * ```typescript
 * import { AgentGroup } from 'mosaia-node-sdk';
 * 
 * // Create a support team group
 * const supportTeam = new AgentGroup({
 *   name: 'Customer Support Team',
 *   short_description: 'Collaborative support agents',
 *   agents: ['billing-expert', 'tech-support', 'general-help']
 * });
 * 
 * // Add branding
 * const logo = new File(['...'], 'team-logo.png', { type: 'image/png' });
 * await supportTeam.uploadImage(logo);
 * ```
 * 
 * @example
 * Using group chat:
 * ```typescript
 * // Engage with the agent group
 * const response = await supportTeam.chat.completions.create({
 *   messages: [
 *     {
 *       role: 'user',
 *       content: 'I have a billing question about my subscription.'
 *     }
 *   ],
 *   temperature: 0.7
 * });
 * 
 * console.log('Team response:', response.choices[0].message.content);
 * ```
 * 
 * @extends BaseModel<AgentGroupInterface>
 * @category Models
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
     * Get the chat functionality for this agent group
     * 
     * This getter provides access to the group's collaborative chat capabilities
     * through the Chat class. It enables coordinated responses from multiple
     * agents within the group.
     * 
     * @returns A new Chat instance configured for this agent group
     * 
     * @example
     * Basic group chat:
     * ```typescript
     * const response = await group.chat.completions.create({
     *   messages: [
     *     { role: 'user', content: 'I need help with a complex issue.' }
     *   ]
     * });
     * ```
     * 
     * @example
     * Advanced group chat with context:
     * ```typescript
     * const response = await group.chat.completions.create({
     *   messages: [
     *     {
     *       role: 'system',
     *       content: 'You are a collaborative team of experts.'
     *     },
     *     {
     *       role: 'user',
     *       content: 'This problem requires both technical and billing expertise.'
     *     }
     *   ],
     *   temperature: 0.7,
     *   max_tokens: 200
     * });
     * 
     * console.log('Team response:', response.choices[0].message.content);
     * ```
     */
    get chat() {
        return new Chat(this.getUri());
    }
} 