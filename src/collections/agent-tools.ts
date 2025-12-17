import AgentTool from '../models/agent-tool';
import {
    AgentToolInterface,
    GetToolPayload,
    GetToolsPayload
} from '../types';
import { BaseCollection } from './base-collection';

/**
 * Agent Tools API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing agent tools in the Mosaia platform.
 * Agent Tools are external integrations and utilities that agents can use to
 * perform specific tasks, such as API calls, data processing, or
 * external service integrations.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - execute tools
 * 
 * @extends BaseCollection<AgentToolInterface, AgentTool, GetToolsPayload, GetToolPayload>
 */
export default class AgentTools extends BaseCollection<
    AgentToolInterface,
    AgentTool,
    GetToolsPayload,
    GetToolPayload
> {
    /**
     * Creates a new Agent Tools API client instance
     * 
     * Initializes the agnet tools client with the appropriate endpoint URI
     * and model class for handling agent tool operations.
     * 
     * The constructor sets up the API endpoint to `/tool` (or `${uri}/tool` if a base URI is provided),
     * which corresponds to the Mosaia API's agent tools endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/tool`.
     *              If not provided, defaults to `/tool`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/tool)
     * const agentTools = new AgentTools();
     * 
     * // Create with custom base URI
     * const agentTools = new AgentTools('/api/v1');
     * // This will use endpoint: /api/v1/agent/tool
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/tool`, AgentTool);
    }
}
