import { DEFAULT_CONFIG } from '../config';
import { Tool } from '../models';
import {
    MosiaConfig,
    ToolInterface
} from '../types';
import APIClient from './api-client';

/**
 * Tools API client for managing tools and integrations
 * 
 * This class provides methods for creating, reading, updating, and deleting
 * tools on the Mosaia platform. Tools are integrations that can be used by
 * agents and applications. Requires either a user or organization context.
 * 
 * @example
 * ```typescript
 * const tools = new Tools(config);
 * 
 * // Get all tools
 * const allTools = await tools.get();
 * 
 * // Get specific tool
 * const tool = await tools.get({ id: 'tool-id' });
 * 
 * // Get tool by name
 * const tool = await tools.getByName('my-tool');
 * 
 * // Create new tool
 * const newTool = await tools.create({
 *   name: 'My Tool',
 *   short_description: 'Description',
 *   tool_schema: '{}'
 * });
 * ```
 */
export default class Tools {
    private client: APIClient;
    public config: MosiaConfig;

    /**
     * Creates a new Tools API client instance
     * 
     * @param config - Configuration object containing API settings
     * @throws {Error} When neither user nor org ID is provided in config
     */
    constructor(config: MosiaConfig) {
        let apiURL;
        if (config.user) {
            apiURL = `${config.apiURL}/user/${config.user}${DEFAULT_CONFIG.ENDPOINTS.TOOLS}`;
        } else if(config.org) {
            apiURL = `${config.apiURL}/org/${config.org}${DEFAULT_CONFIG.ENDPOINTS.TOOLS}`;
        } else {
            throw new Error('User or org id is required to call tools endpoint');
        }

        this.config = {
            ...config,
            apiURL,
        };
        this.client = new APIClient(this.config);
    }

    /**
     * Get tools with optional filtering
     * 
     * Retrieves tools from the platform. If a tool parameter with an ID
     * is provided, returns a single tool. Otherwise, returns all tools.
     * 
     * @param tool - Optional tool object with ID to get a specific tool
     * @returns Promise that resolves to an array of tools, a single tool, or null
     * 
     * @example
     * ```typescript
     * // Get all tools
     * const allTools = await tools.get();
     * 
     * // Get specific tool by ID
     * const tool = await tools.get({ id: 'tool-123' });
     * 
     * // Get specific tool by full tool object
     * const toolData = { id: 'tool-123', name: 'My Tool' };
     * const tool = await tools.get(toolData);
     * ```
     */
    async get(tool?: ToolInterface): Promise<Tool[] | Tool | null> {
        let uri = '';

        if (tool && tool.id) uri += `/${tool.id}`;
        const { data } = await this.client.GET(uri);

        if (Array.isArray(data)) {
            return data.map(tool => new Tool(this, tool));
        }

        if (data) {
            return new Tool(this, data as ToolInterface);
        }
        return null;
    }

    /**
     * Get a tool by its name
     * 
     * Retrieves a specific tool from the platform by searching for its name.
     * 
     * @param name - The name of the tool to find
     * @returns Promise that resolves to the tool if found, or null
     * 
     * @example
     * ```typescript
     * const tool = await tools.getByName('web-search-tool');
     * if (tool) {
     *   console.log('Found tool:', tool.name);
     * } else {
     *   console.log('Tool not found');
     * }
     * ```
     */
    async getByName(name: string): Promise<Tool | null> {
        const uri = `?name=${name}`;
        const { data } = await this.client.GET(uri);

        if (Array.isArray(data)) {
            if(data.length) {
                return (data.map(tool => new Tool(this, tool)))[0];
            } else {
                return null;
            }
        }

        if (data) {
            return new Tool(this, data as ToolInterface);
        }
        return null;
    }

    /**
     * Create a new tool
     * 
     * Creates a new tool on the platform with the provided data.
     * 
     * @param tool - Tool data for the new tool (ID will be generated)
     * @returns Promise that resolves to the created tool
     * 
     * @example
     * ```typescript
     * const newTool = await tools.create({
     *   name: 'Web Search Tool',
     *   friendly_name: 'Web Search',
     *   short_description: 'Search the web for information',
     *   tool_schema: JSON.stringify({
     *     type: 'object',
     *     properties: {
     *       query: { type: 'string', description: 'Search query' }
     *     }
     *   }),
     *   public: true
     * });
     * 
     * console.log('Created tool ID:', newTool.id);
     * ```
     */
    async create(tool: ToolInterface): Promise<Tool> {
        const { data } = await this.client.POST('', tool);

        return new Tool(this, data as ToolInterface);
    }

    /**
     * Update an existing tool
     * 
     * Updates a tool with the provided data. The tool parameter must
     * include an ID to identify which tool to update.
     * 
     * @param tool - Tool data to update (must include ID)
     * @returns Promise that resolves to the updated tool
     * 
     * @example
     * ```typescript
     * const updatedTool = await tools.update({
     *   id: 'tool-123',
     *   name: 'Updated Tool Name',
     *   short_description: 'Updated description'
     * });
     * ```
     */
    async update(tool: ToolInterface): Promise<Tool> {
        const { data } = await this.client.PUT(`/${tool.id}`, tool);

        return new Tool(this, data as ToolInterface);
    }

    /**
     * Delete a tool
     * 
     * Removes a tool from the platform. The tool parameter must
     * include an ID to identify which tool to delete.
     * 
     * @param tool - Tool to delete (must include ID)
     * @returns Promise that resolves to null when deletion is successful
     * 
     * @example
     * ```typescript
     * await tools.delete({ id: 'tool-123' });
     * console.log('Tool deleted successfully');
     * ```
     */
    async delete(tool: ToolInterface): Promise<null> {
        const response = await this.client.DELETE<null>(`/${tool.id}`);

        return response.data;
    }
}