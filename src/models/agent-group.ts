import {
    AgentGroupInterface,
    GetAgentGroupPayload
} from '../types';
import { BaseModel } from './base';
import { Chat } from '../functions/chat';
import { Image } from '../functions/image';

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
 * await supportTeam.image.upload(logo);
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
     * Get the image functionality for this agent group
     * 
     * This getter provides access to the agent group's image operations through
     * the Image class. It allows for image uploads and other image-related
     * operations specific to this agent group.
     * 
     * @returns A new Image instance configured for this agent group
     * 
     * @example
     * ```typescript
     * const updatedGroup = await agentGroup.image.upload<AgentGroup, GetAgentGroupPayload>(file);
     * ```
     */
    get image(): Image {
        return new Image(this.getUri(), (this.data as any).image || '');
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

    /**
     * Like or unlike this agent group
     * 
     * Toggles the like status of this agent group. If the group is already liked,
     * it will be unliked, and vice versa.
     * 
     * @returns Promise that resolves to the updated agent group instance
     * 
     * @example
     * ```typescript
     * await agentGroup.like();
     * console.log('Group liked:', agentGroup.liked);
     * ```
     * 
     * @throws {Error} When API request fails
     */
    async like(): Promise<AgentGroup> {
        try {
            const response = await this.apiClient.POST<GetAgentGroupPayload>(`${this.getUri()}/like`);
            if (!response || !response.data) {
                throw new Error('Invalid response from API');
            }
            this.update(response.data);
            return this;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
} 