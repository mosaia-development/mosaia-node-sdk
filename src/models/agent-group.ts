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
     * Get the chat function
     * 
     * @returns The chat function
     */
    get chat() {
        return new Chat(this.getUri());
    }
} 