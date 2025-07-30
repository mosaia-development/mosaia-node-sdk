import { ToolInterface } from '../types';
import { BaseModel } from './base';

/**
 * Tool class for managing tool instances in the Mosaia SDK
 * 
 * Represents an external integration or utility that agents can use to perform
 * specific tasks. Tools provide additional capabilities to AI agents through
 * API integrations, data processing, or external service connections.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - Tool data management and validation
 * - Tool configuration and schema management
 * - Integration with the Mosaia API for tool operations
 * - Tool-specific environment variable handling
 * 
 * @example
 * ```typescript
 * import { Tool } from 'mosaia-node-sdk';
 * 
 * // Create a tool instance
 * const tool = new Tool({
 *   name: 'Weather API Tool',
 *   friendly_name: 'Weather Information',
 *   short_description: 'Get current weather information for any location',
 *   tool_schema: JSON.stringify({
 *     type: 'object',
 *     properties: {
 *       location: { type: 'string' }
 *     }
 *   }),
 *   required_environment_variables: ['WEATHER_API_KEY'],
 *   source_url: 'https://api.weatherapi.com'
 * });
 * 
 * // Access tool data
 * console.log('Tool Name:', tool.name);
 * console.log('Tool Schema:', tool.tool_schema);
 * ```
 * 
 * @extends BaseModel<ToolInterface>
 */
export default class Tool extends BaseModel<ToolInterface> {
    /**
     * Creates a new Tool instance
     * 
     * Initializes a tool with the provided configuration data and optional URI.
     * The tool represents an external integration that agents can utilize.
     * 
     * @param data - Tool configuration data
     * @param uri - Optional URI path for the tool endpoint. Defaults to '/tool'
     * 
     * @example
     * ```typescript
     * const tool = new Tool({
     *   name: 'Database Tool',
     *   short_description: 'Database query tool',
     *   tool_schema: '{"type": "object"}'
     * });
     * ```
     */
    constructor(data: Partial<ToolInterface>, uri?: string) {
        super(data, uri || '/tool');
    }
} 