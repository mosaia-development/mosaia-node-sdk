import {
    AppConnectorInterface,
    GetAppConnectorsPayload,
    GetAppConnectorPayload
} from '../types';
import { AppConnector } from '../models';
import { BaseCollection } from './base-collection';

/**
 * App Connectors API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing app connectors in the Mosaia platform.
 * App connectors are specialized integrations that connect applications with AI agents
 * or agent groups, enabling automated responses and workflows within external
 * applications through webhook-style interactions.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve app connectors with filtering and pagination
 * - Create new app connector integrations
 * - Update existing app connector configurations
 * - Delete app connector integrations
 * - Manage webhook endpoints and response URLs
 * - Handle connector-specific API keys and authentication
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const appConnectors = mosaia.appConnectors;
 * 
 * // Get all app connectors
 * const allConnectors = await appConnectors.get();
 * 
 * // Get a specific app connector
 * const connector = await appConnectors.get({}, 'connector-id');
 * 
 * // Create a new app connector
 * const newConnector = await appConnectors.create({
 *   app: 'app-id',
 *   response_url: 'https://myapp.com/webhook',
 *   agent: 'agent-id',
 *   api_key: 'connector-api-key',
 *   client: 'client-id',
 *   response_hook: 'response-hook-id'
 * });
 * ```
 * 
 * @extends BaseCollection<AppConnectorInterface, AppConnector, GetAppConnectorsPayload, GetAppConnectorPayload>
 */
export default class AppConnectors extends BaseCollection<
    AppConnectorInterface,
    AppConnector,
    GetAppConnectorsPayload,
    GetAppConnectorPayload
> {
    /**
     * Creates a new App Connectors API client instance
     * 
     * Initializes the app connectors client with the appropriate endpoint URI
     * and model class for handling app connector operations.
     * 
     * The constructor sets up the API endpoint to `/connector` (or `${uri}/connector` if a base URI is provided),
     * which corresponds to the Mosaia API's app connectors endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/connector`.
     *              If not provided, defaults to `/connector`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/connector)
     * const appConnectors = new AppConnectors();
     * 
     * // Create with custom base URI
     * const appConnectors = new AppConnectors('/api/v1');
     * // This will use endpoint: /api/v1/connector
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/connector`, AppConnector);
    }
} 