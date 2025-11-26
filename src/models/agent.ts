import { Chat } from '../functions/chat';
import {
    AgentInterface,
    GetAgentPayload
} from '../types';
import { BaseModel } from './base';
import { Image } from '../functions/image';
import { Tasks, Logs } from '../collections';

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
 * await agent.image.upload(file);
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

    /**
     * Get the image functionality for this agent
     * 
     * This getter provides access to the agent's image operations through
     * the Image class. It allows for image uploads and other image-related
     * operations specific to this agent.
     * 
     * @returns A new Image instance configured for this agent
     * 
     * @example
     * ```typescript
     * const updatedAgent = await agent.image.upload<Agent, GetAgentPayload>(file);
     * ```
     */
    get image(): Image {
        return new Image(this.getUri(), (this.data as any).image || '');
    }

    /**
     * Get the tasks collection for this agent
     * 
     * This getter provides access to the agent's tasks collection, allowing
     * you to manage tasks associated with this agent.
     * 
     * @returns Tasks collection for managing agent tasks
     * 
     * @example
     * ```typescript
     * // Get all tasks for this agent
     * const tasks = await agent.tasks.get();
     * 
     * // Create a new task
     * const newTask = await agent.tasks.create({
     *   name: 'Complete analysis',
     *   description: 'Analyze user feedback'
     * });
     * ```
     */
    get tasks(): Tasks {
        return new Tasks(this.getUri());
    }

    /**
     * Get the logs collection for this agent
     * 
     * This getter provides access to the agent's logs collection, allowing
     * you to manage conversation logs and interaction history for this agent.
     * 
     * @returns Logs collection for managing agent logs
     * 
     * @example
     * ```typescript
     * // Get all logs for this agent
     * const logs = await agent.logs.get();
     * 
     * // Get a specific log
     * const log = await agent.logs.get({}, 'log-id');
     * 
     * // Access messages within a log
     * const messages = await log.messages.get();
     * ```
     */
    get logs(): Logs {
        return new Logs(this.getUri());
    }

    /**
     * Like or unlike this agent
     * 
     * Toggles the like status of this agent. If the agent is already liked,
     * it will be unliked, and vice versa.
     * 
     * @returns Promise that resolves to the updated agent instance
     * 
     * @example
     * ```typescript
     * await agent.like();
     * console.log('Agent liked:', agent.liked);
     * ```
     * 
     * @throws {Error} When API request fails
     */
    async like(): Promise<Agent> {
        try {
            const response = await this.apiClient.POST<GetAgentPayload>(`${this.getUri()}/like`);
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

    /**
     * Fork this agent
     * 
     * Creates a copy of this agent that can be independently modified.
     * Useful for creating variations of existing agents.
     * 
     * @param options - Optional fork options
     * @param options.generate_system_message - Whether to generate a new system message
     * @returns Promise resolving to the forked agent instance
     * 
     * @example
     * ```typescript
     * // Basic fork
     * const forkedAgent = await agent.fork();
     * 
     * // Fork with system message generation
     * const forkedAgent = await agent.fork({
     *   generate_system_message: true
     * });
     * ```
     * 
     * @throws {Error} When API request fails
     */
    async fork(options?: { generate_system_message?: boolean }): Promise<Agent> {
        try {
            let uri = `${this.getUri()}/fork`;
            if (options?.generate_system_message) {
                uri += '?generate_system_message=true';
            }
            const response = await this.apiClient.POST<GetAgentPayload>(uri);
            if (!response || !response.data) {
                throw new Error('Invalid response from API');
            }
            return new Agent(response.data);
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
}