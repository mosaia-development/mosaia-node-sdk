import { AgentToolInterface } from '../types';
import { BaseModel } from './base';

/**
 * Agent Tool class for managing agent capabilities
 * 
 * This class represents an external integration or utility that extends
 * agent capabilities in the Mosaia platform. Tools enable agents to
 * interact with external services, process data, and perform specialized
 * tasks through well-defined interfaces.
 * 
 * Features:
 * - Schema validation
 * - Environment management
 * - API integration
 * - Data transformation
 * - Error handling
 * 
 * @remarks
 * Agent Tools provide:
 * - External service integration
 * - Data processing capabilities
 * - API access management
 * - Input/output validation
 * - Environment configuration
 * 
 * Common tool types:
 * - API integrations
 * - Database connectors
 * - File processors
 * - Data transformers
 * - Service clients
 * 
 * @extends BaseModel<AgentToolInterface>
 * @category Models
 */
export default class AgentTool extends BaseModel<AgentToolInterface> {
    /**
     * Creates a new agent tool configuration
     * 
     * Initializes an agent tool that extends agent capabilities through external
     * integrations. Tools provide a standardized interface for agents to
     * interact with external services and process data.
     * 
     * @param data - Configuration data including:
     *               - name: Tool identifier
     *               - friendly_name: Display name
     *               - short_description: Brief description
     *               - tool_schema: JSON Schema for inputs
     *               - required_environment_variables: Required env vars
     *               - source_url: Integration endpoint
     *               - metadata: Additional tool data
     * @param uri - Optional custom URI path for the tool endpoint
     * 
     */
    constructor(data: Partial<AgentToolInterface>, uri?: string) {
        super(data, uri || '/tool');
    }

    /**
     * Execute this agent tool
     * 
     * @returns Promise that resolves to the output of the agent tool call
     * 
     * @example
     * ```typescript
     * const output = await tool.execute({some: 'args'});
     * console.log('Tool output:', output);
     * ```
     * 
     * @throws {Error} When API request fails
     */
    async execute(args: object): Promise<object> {
        try {
            const response = await this.apiClient.POST(`${this.getUri()}/execute`, args);
            if (!response || !response.data) {
                throw new Error('Invalid response from API');
            }

            return response.data;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
} 
