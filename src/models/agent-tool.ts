import { ToolInterface, GetToolPayload, AgentToolInterface } from '../types';
import { BaseModel } from './base';
import { Image } from '../functions/image';

/**
 * Tool class for managing agent capabilities
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
 * Tools provide:
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
 * @example
 * Basic API tool:
 * ```typescript
 * import { Tool } from 'mosaia-node-sdk';
 * 
 * // Create a weather API tool
 * const weatherTool = new Tool({
 *   name: 'weather-api',
 *   friendly_name: 'Weather Service',
 *   short_description: 'Get weather forecasts',
 *   tool_schema: JSON.stringify({
 *     type: 'object',
 *     properties: {
 *       location: {
 *         type: 'string',
 *         description: 'City name or coordinates'
 *       },
 *       units: {
 *         type: 'string',
 *         enum: ['metric', 'imperial'],
 *         default: 'metric'
 *       }
 *     },
 *     required: ['location']
 *   }),
 *   required_environment_variables: ['WEATHER_API_KEY'],
 *   source_url: 'https://api.weather.com'
 * });
 * 
 * await weatherTool.save();
 * ```
 * 
 * @example
 * Database tool:
 * ```typescript
 * // Create a database query tool
 * const dbTool = new Tool({
 *   name: 'db-query',
 *   friendly_name: 'Database Query',
 *   short_description: 'Execute database queries',
 *   tool_schema: JSON.stringify({
 *     type: 'object',
 *     properties: {
 *       query: {
 *         type: 'string',
 *         description: 'SQL query to execute'
 *       },
 *       params: {
 *         type: 'array',
 *         items: { type: 'string' },
 *         description: 'Query parameters'
 *       },
 *       timeout: {
 *         type: 'number',
 *         default: 30000
 *       }
 *     },
 *     required: ['query']
 *   }),
 *   required_environment_variables: [
 *     'DB_HOST',
 *     'DB_USER',
 *     'DB_PASS',
 *     'DB_NAME'
 *   ],
 *   metadata: {
 *     type: 'database',
 *     engine: 'postgresql',
 *     version: '14',
 *     max_connections: 10
 *   }
 * });
 * 
 * if (dbTool.isActive()) {
 *   console.log('Database tool ready');
 *   console.log('Schema:', JSON.parse(dbTool.tool_schema));
 * }
 * ```
 * 
 * @extends BaseModel<AgentToolInterface>
 * @category Models
 */
export default class AgentTool extends BaseModel<AgentToolInterface> {
    /**
     * Creates a new tool configuration
     * 
     * Initializes a tool that extends agent capabilities through external
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
     * @example
     * Basic file processor:
     * ```typescript
     * const fileTool = new Tool({
     *   name: 'file-processor',
     *   friendly_name: 'File Processor',
     *   short_description: 'Process and transform files',
     *   tool_schema: JSON.stringify({
     *     type: 'object',
     *     properties: {
     *       file_path: {
     *         type: 'string',
     *         description: 'Path to input file'
     *       },
     *       output_format: {
     *         type: 'string',
     *         enum: ['json', 'csv', 'xml'],
     *         default: 'json'
     *       }
     *     },
     *     required: ['file_path']
     *   })
     * });
     * ```
     * 
     * @example
     * API integration:
     * ```typescript
     * const apiTool = new Tool({
     *   name: 'api-client',
     *   friendly_name: 'API Integration',
     *   short_description: 'Make API requests',
     *   tool_schema: JSON.stringify({
     *     type: 'object',
     *     properties: {
     *       method: {
     *         type: 'string',
     *         enum: ['GET', 'POST', 'PUT', 'DELETE']
     *       },
     *       endpoint: {
     *         type: 'string',
     *         pattern: '^/'
     *       },
     *       headers: {
     *         type: 'object',
     *         additionalProperties: true
     *       },
     *       body: {
     *         type: 'object',
     *         additionalProperties: true
     *       }
     *     },
     *     required: ['method', 'endpoint']
     *   }),
     *   required_environment_variables: [
     *     'API_KEY',
     *     'API_SECRET'
     *   ],
     *   source_url: 'https://api.service.com',
     *   metadata: {
     *     version: '1.0',
     *     rate_limit: 100,
     *     timeout: 5000
     *   }
     * }, '/integrations/tool');
     * ```
     */
    constructor(data: Partial<AgentToolInterface>, uri?: string) {
        super(data, uri || '/tool');
    }

    /**
     * Execute this tool
     * 
     * @returns Promise that resolves to the output of the tool call
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
