import {
    AgentInterface,
    GetAgentsPayload,
    GetAgentPayload
} from '../types';
import { Agent } from '../models';
import { BaseAPI } from './base-api';

/**
 * Agents API client for managing AI agents
 * 
 * This class provides methods for creating, reading, updating, and deleting
 * AI agents on the Mosaia platform. Agents are AI-powered assistants that
 * can be configured with different models, prompts, and capabilities.
 * 
 * @example
 * ```typescript
 * const agents = new Agents();
 * 
 * // Get all agents
 * const allAgents = await agents.getAll();
 * 
 * // Get specific agent
 * const agent = await agents.getById('agent-id');
 * 
 * // Create new agent
 * const newAgent = await agents.create({
 *   name: 'Customer Support Agent',
 *   short_description: 'AI agent for customer support',
 *   model: 'gpt-4',
 *   system_prompt: 'You are a helpful customer support agent.',
 *   temperature: 0.7,
 *   max_tokens: 1000,
 *   public: true
 * });
 * 
 * // Update agent
 * const updatedAgent = await agents.update('agent-id', {
 *   temperature: 0.5
 * });
 * 
 * // Delete agent
 * await agents.delete('agent-id');
 * ```
 */
export default class Agents extends BaseAPI<
    AgentInterface,
    Agent,
    GetAgentsPayload,
    GetAgentPayload
> {
    constructor(uri = '') {
        super(`${uri}/agent`, Agent);
    }
}