import {
    SearchQueryParams,
    SearchResponse,
    AgentInterface,
    AppInterface,
    ToolInterface,
    ModelInterface
} from '../types';
import APIClient from '../utils/api-client';

/**
 * Search API client for the Mosaia SDK
 * 
 * Provides universal search functionality across multiple resource types
 * (agents, apps, tools, models) in the Mosaia platform.
 * 
 * This class provides a specialized search interface that allows searching
 * across multiple resource types simultaneously with a single query.
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const search = mosaia.search;
 * 
 * // Search across all resource types
 * const results = await search.query({
 *   q: 'customer support',
 *   limit: 10
 * });
 * 
 * console.log('Agents:', results.data.agents);
 * console.log('Apps:', results.data.apps);
 * console.log('Tools:', results.data.tools);
 * console.log('Models:', results.data.models);
 * ```
 * 
 * @example
 * ```typescript
 * // Search specific resource types
 * const results = await search.query({
 *   q: 'AI assistant',
 *   search_types: ['agent', 'app'],
 *   limit: 5
 * });
 * 
 * // Or use search_type for single type
 * const agentResults = await search.query({
 *   q: 'support bot',
 *   search_type: 'agent',
 *   limit: 10
 * });
 * ```
 */
export default class Search {
    private apiClient: APIClient;
    private uri: string;

    /**
     * Creates a new Search API client instance
     * 
     * Initializes the search client with the appropriate endpoint URI.
     * The search endpoint provides universal search across multiple resource types.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/search`.
     *              If not provided, defaults to `/search`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/search)
     * const search = new Search();
     * 
     * // Create with custom base URI
     * const search = new Search('/api/v1');
     * // This will use endpoint: /api/v1/search
     * ```
     */
    constructor(uri = '') {
        this.uri = `${uri}/search`;
        this.apiClient = new APIClient();
    }

    /**
     * Perform a universal search across multiple resource types
     * 
     * Searches across agents, apps, tools, and models simultaneously
     * based on the provided query parameters. Returns results grouped
     * by resource type.
     * 
     * @param params - Search query parameters
     * @param params.q - Search query string (will be converted to embeddings for semantic search)
     * @param params.search_types - Array of resource types to search (e.g., ['agent', 'app'])
     * @param params.search_type - Single resource type to search (alternative to search_types)
     * @param params.limit - Maximum number of results per resource type (defaults to 5 if no search_types specified)
     * @returns Promise resolving to search results grouped by resource type
     * 
     * @example
     * ```typescript
     * // Search all resource types
     * const results = await search.query({
     *   q: 'customer support AI',
     *   limit: 10
     * });
     * 
     * // Access results by type
     * if (results.data.agents) {
     *   console.log(`Found ${results.data.agents.length} agents`);
     * }
     * if (results.data.apps) {
     *   console.log(`Found ${results.data.apps.length} apps`);
     * }
     * ```
     * 
     * @example
     * ```typescript
     * // Search specific types only
     * const results = await search.query({
     *   q: 'AI assistant',
     *   search_types: ['agent', 'model'],
     *   limit: 5
     * });
     * 
     * // Check paging information
     * if (results.paging?.agents) {
     *   console.log('Agent search pagination:', results.paging.agents);
     * }
     * ```
     * 
     * @throws {Error} When API request fails
     */
    async query(params: SearchQueryParams): Promise<SearchResponse> {
        try {
            const response = await this.apiClient.GET<SearchResponse>(this.uri, params);
            // If response.data exists and has a data property, it's a wrapped SearchResponse
            // Otherwise, response itself is the SearchResponse
            if (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data) {
                return response.data as SearchResponse;
            }
            return response as SearchResponse;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
}

