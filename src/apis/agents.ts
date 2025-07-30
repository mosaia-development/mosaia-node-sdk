import {
    AgentInterface,
    GetAgentsPayload,
    GetAgentPayload
} from '../types';
import { Agent } from '../models';
import { BaseAPI } from './base-api';

/**
 * Agents API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing AI agents in the Mosaia platform.
 * Agents are AI-powered entities that can perform specific tasks, handle conversations,
 * and execute workflows based on their configuration and assigned tools.
 * 
 * This class inherits from BaseAPI and provides the following functionality:
 * - Retrieve agents with filtering and pagination
 * - Create new agents with custom configurations
 * - Update existing agent settings and properties
 * - Delete agents
 * - Manage agent tools and configurations
 * - Handle agent-specific operations like chat completions
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const agents = mosaia.agents;
 * 
 * // Get all agents
 * const allAgents = await agents.get();
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
 * 
 * // Use agent for chat completion
 * if (agent instanceof Agent) {
 *   const response = await agent.chatCompletion({
 *     model: 'gpt-4',
 *     messages: [
 *       { role: 'user', content: 'How can I reset my password?' }
 *     ]
 *   });
 * }
 * ```
 * 
 * @extends BaseAPI<AgentInterface, Agent, GetAgentsPayload, GetAgentPayload>
 */
export default class Agents extends BaseAPI<
    AgentInterface,
    Agent,
    GetAgentsPayload,
    GetAgentPayload
> {
    /**
     * Creates a new Agents API client instance
     * 
     * Initializes the agents client with the appropriate endpoint URI
     * and model class for handling agent operations.
     * 
     * The constructor sets up the API endpoint to `/agent` (or `${uri}/agent` if a base URI is provided),
     * which corresponds to the Mosaia API's agents endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/agent`.
     *              If not provided, defaults to `/agent`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/agent)
     * const agents = new Agents();
     * 
     * // Create with custom base URI
     * const agents = new Agents('/api/v1');
     * // This will use endpoint: /api/v1/agent
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/agent`, Agent);
    }
}