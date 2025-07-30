import {
    ToolInterface,
    GetToolsPayload,
    GetToolPayload,
} from '../types';
import { Tool } from '../models';
import { BaseAPI } from './base-api';

/**
 * Tools API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing tools in the Mosaia platform.
 * Tools are external integrations and utilities that agents can use to
 * perform specific tasks, such as API calls, data processing, or
 * external service integrations.
 * 
 * This class inherits from BaseAPI and provides the following functionality:
 * - Retrieve tools with filtering and pagination
 * - Create new tool integrations
 * - Update existing tool configurations
 * - Delete tools
 * - Manage tool schemas and configurations
 * - Handle tool-specific environment variables and requirements
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const tools = mosaia.tools;
 * 
 * // Get all tools
 * const allTools = await tools.get();
 * 
 * // Get a specific tool
 * const tool = await tools.get({}, 'tool-id');
 * 
 * // Create a new tool
 * const newTool = await tools.create({
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
 * ```
 * 
 * @extends BaseAPI<ToolInterface, Tool, GetToolsPayload, GetToolPayload>
 */
export default class Tools extends BaseAPI<
    ToolInterface,
    Tool,
    GetToolsPayload,
    GetToolPayload
> {
    /**
     * Creates a new Tools API client instance
     * 
     * Initializes the tools client with the appropriate endpoint URI
     * and model class for handling tool operations.
     * 
     * The constructor sets up the API endpoint to `/tool` (or `${uri}/tool` if a base URI is provided),
     * which corresponds to the Mosaia API's tools endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/tool`.
     *              If not provided, defaults to `/tool`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/tool)
     * const tools = new Tools();
     * 
     * // Create with custom base URI
     * const tools = new Tools('/api/v1');
     * // This will use endpoint: /api/v1/tool
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/tool`, Tool);
    }
}