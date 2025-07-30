import {
    AgentGroupInterface,
    GetAgentGroupsPayload,
    GetAgentGroupPayload
} from '../types';
import { AgentGroup } from '../models';
import { BaseAPI } from './base-api';

/**
 * Agent Groups API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing agent groups in the Mosaia platform.
 * Agent groups allow you to organize and manage multiple AI agents together,
 * enabling coordinated workflows and shared configurations.
 * 
 * This class inherits from BaseAPI and provides the following functionality:
 * - Retrieve agent groups with filtering and pagination
 * - Create new agent groups
 * - Update existing agent groups
 * - Delete agent groups
 * - Manage agent group memberships
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const agentGroups = mosaia.agentGroups;
 * 
 * // Get all agent groups
 * const groups = await agentGroups.get();
 * 
 * // Get a specific agent group
 * const group = await agentGroups.get({}, 'group-id');
 * 
 * // Create a new agent group
 * const newGroup = await agentGroups.create({
 *   name: 'My Agent Group',
 *   short_description: 'A group of AI agents for customer support',
 *   agents: ['agent-1', 'agent-2']
 * });
 * ```
 * 
 * @extends BaseAPI<AgentGroupInterface, AgentGroup, GetAgentGroupsPayload, GetAgentGroupPayload>
 */
export default class AgentGroups extends BaseAPI<
    AgentGroupInterface,
    AgentGroup,
    GetAgentGroupsPayload,
    GetAgentGroupPayload
> {
    /**
     * Creates a new Agent Groups API client instance
     * 
     * Initializes the agent groups client with the appropriate endpoint URI
     * and model class for handling agent group operations.
     * 
     * The constructor sets up the API endpoint to `/group` (or `${uri}/group` if a base URI is provided),
     * which corresponds to the Mosaia API's agent groups endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/group`.
     *              If not provided, defaults to `/group`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/group)
     * const agentGroups = new AgentGroups();
     * 
     * // Create with custom base URI
     * const agentGroups = new AgentGroups('/api/v1');
     * // This will use endpoint: /api/v1/group
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/group`, AgentGroup);
    }
} 