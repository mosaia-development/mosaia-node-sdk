import {
    AppBotInterface,
    GetAppBotsPayload,
    GetAppBotPayload
} from '../types';
import { AppBot } from '../models';
import { BaseCollection } from './base-collection';

/**
 * App Bots API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing app bots in the Mosaia platform.
 * App bots are specialized integrations that connect applications with AI agents
 * or agent groups, enabling automated responses and workflows within external
 * applications through webhook-style interactions.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve app bots with filtering and pagination
 * - Create new app bot integrations
 * - Update existing app bot configurations
 * - Delete app bot integrations
 * - Manage webhook endpoints and response URLs
 * - Handle bot-specific API keys and authentication
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const appBots = mosaia.appBots;
 * 
 * // Get all app bots
 * const allBots = await appBots.get();
 * 
 * // Get a specific app bot
 * const bot = await appBots.get({}, 'bot-id');
 * 
 * // Create a new app bot
 * const newBot = await appBots.create({
 *   app: 'app-id',
 *   response_url: 'https://myapp.com/webhook',
 *   agent: 'agent-id',
 *   api_key: 'bot-api-key'
 * });
 * ```
 * 
 * @extends BaseCollection<AppBotInterface, AppBot, GetAppBotsPayload, GetAppBotPayload>
 */
export default class AppBots extends BaseCollection<
    AppBotInterface,
    AppBot,
    GetAppBotsPayload,
    GetAppBotPayload
> {
    /**
     * Creates a new App Bots API client instance
     * 
     * Initializes the app bots client with the appropriate endpoint URI
     * and model class for handling app bot operations.
     * 
     * The constructor sets up the API endpoint to `/bot` (or `${uri}/bot` if a base URI is provided),
     * which corresponds to the Mosaia API's app bots endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/bot`.
     *              If not provided, defaults to `/bot`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/bot)
     * const appBots = new AppBots();
     * 
     * // Create with custom base URI
     * const appBots = new AppBots('/api/v1');
     * // This will use endpoint: /api/v1/bot
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/bot`, AppBot);
    }
} 