import {
    AgentInterface,
    GetAgentsPayload,
    GetAgentPayload
} from '../types';
import { Agent } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Agents API client for managing AI agents in the Mosaia platform
 * 
 * This class provides comprehensive functionality for managing AI agents,
 * which are intelligent entities that can perform tasks, handle conversations,
 * and execute workflows based on their configuration and assigned tools.
 * 
 * Features:
 * - Create and configure AI agents
 * - Manage agent settings and properties
 * - Handle agent tools and capabilities
 * - Support for chat and completion operations
 * - Integration with models and tools
 * 
 * @remarks
 * Agents can be configured with different models, temperature settings,
 * and system prompts to customize their behavior. They can also be
 * assigned tools to extend their capabilities.
 * 
 * @example
 * Basic agent operations:
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const agents = mosaia.agents;
 * 
 * // List all agents with filtering
 * const allAgents = await agents.get({
 *   limit: 10,
 *   q: 'support',
 *   active: true
 * });
 * 
 * // Get a specific agent
 * const agent = await agents.get({}, 'agent-id');
 * 
 * // Create a new agent
 * const newAgent = await agents.create({
 *   name: 'Customer Support Agent',
 *   short_description: 'AI agent for handling customer inquiries',
 *   model: 'gpt-4',
 *   temperature: 0.7,
 *   max_tokens: 1000,
 *   system_prompt: 'You are a helpful customer support agent.'
 * });
 * ```
 * 
 * @example
 * Using agent chat capabilities:
 * ```typescript
 * // Get an agent
 * const agent = await agents.get({}, 'agent-id');
 * 
 * if (agent instanceof Agent) {
 *   // Use the new chat completions API
 *   const response = await agent.chat.completions.create({
 *     messages: [
 *       { role: 'user', content: 'How can I reset my password?' }
 *     ],
 *     temperature: 0.7,
 *     max_tokens: 150
 *   });
 *   
 *   console.log('Agent response:', response.choices[0].message.content);
 * }
 * ```
 * 
 * @extends BaseCollection<AgentInterface, Agent, GetAgentsPayload, GetAgentPayload>
 * @category Collections
 */
export default class Agents extends BaseCollection<
    AgentInterface,
    Agent,
    GetAgentsPayload,
    GetAgentPayload
> {
    /**
     * Creates a new Agents API client instance
     * 
     * Initializes an Agents collection for managing AI agents through the API.
     * The collection provides methods for creating, retrieving, and managing
     * agent configurations.
     * 
     * @param uri - Optional base URI path (e.g., '/org/123' for org-scoped agents)
     * 
     * @example
     * Default initialization:
     * ```typescript
     * // Uses /agent endpoint
     * const agents = new Agents();
     * 
     * // Create a new agent
     * const agent = await agents.create({
     *   name: 'Support Bot',
     *   shortDescription: 'Customer support agent'
     * });
     * ```
     * 
     * @example
     * Organization-scoped agents:
     * ```typescript
     * // Uses /org/123/agent endpoint
     * const orgAgents = new Agents('/org/123');
     * 
     * // List org's agents
     * const agents = await orgAgents.get({
     *   active: true,
     *   limit: 10
     * });
     * ```
     * 
     * @category Collections
     */
    constructor(uri = '') {
        super(`${uri}/agent`, Agent);
    }
}