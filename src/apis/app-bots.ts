import {
    MosiaConfig,
    AppInterface,
    AppBotInterface
} from '../types';
import { AppBot } from '../models';
import APIClient from './api-client';
import Apps from './apps';
import { DEFAULT_CONFIG } from '../config';

/**
 * App Bots API client for managing application bots
 * 
 * This class provides methods for creating, reading, updating, and deleting
 * bots associated with applications. App bots are AI-powered interfaces
 * that can be integrated into applications for user interactions.
 * 
 * @example
 * ```typescript
 * const apps = new Apps(config);
 * const appBots = new AppBots(apps, { id: 'app-123' });
 * 
 * // Get all bots for an app
 * const allBots = await appBots.get();
 * 
 * // Get specific bot
 * const bot = await appBots.get({ id: 'bot-id' });
 * 
 * // Create new bot
 * const newBot = await appBots.create({
 *   app: 'app-123',
 *   response_url: 'https://webhook.com/callback',
 *   agent: 'agent-456'
 * });
 * ```
 */
export default class AppBots {
    private client: APIClient;
    public config: MosiaConfig;

    /**
     * Creates a new App Bots API client instance
     * 
     * @param apps - Apps API instance for context
     * @param app - Optional app object to scope bot operations to a specific app
     */
    constructor(apps: Apps, app?: AppInterface) {
        const { config } = apps;
        let apiURL = config.apiURL;

        if (app && app.id) apiURL += `/${app.id}`;
        apiURL += DEFAULT_CONFIG.ENDPOINTS.BOTS;

        this.config = {
            ...config,
            apiURL,
        };
        this.client = new APIClient(this.config);
    }

    /**
     * Get app bots with optional filtering
     * 
     * Retrieves bots associated with the current app context. If a bot parameter
     * with an ID is provided, returns a single bot. Otherwise, returns all bots.
     * 
     * @param bot - Optional bot object with ID to get a specific bot
     * @returns Promise that resolves to an array of bots, a single bot, or null
     * 
     * @example
     * ```typescript
     * // Get all bots for the current app
     * const allBots = await appBots.get();
     * 
     * // Get specific bot by ID
     * const bot = await appBots.get({ id: 'bot-123' });
     * 
     * // Get specific bot by full bot object
     * const botData = { id: 'bot-123', app: 'app-456' };
     * const bot = await appBots.get(botData);
     * ```
     */
    async get(bot?: AppBotInterface): Promise<AppBot[] | AppBot | null> {
        let uri = '';

        if (bot && bot.id) uri += `/${bot.id}`;
        const { data } = await this.client.GET(uri);

        if (Array.isArray(data)) {
            return data.map((bot) => new AppBot(this, bot));
        }

        if (data) {
            return new AppBot(this, data as AppBotInterface);
        }
        return null;
    }

    /**
     * Get a specific app bot by its ID
     * 
     * Retrieves detailed information about a single app bot, including
     * the API key for authentication.
     * 
     * @param bot - Bot object with ID and API key
     * @returns Promise that resolves to the bot data with API key
     * 
     * @example
     * ```typescript
     * const bot = await appBots.getById({ 
     *   id: 'bot-123', 
     *   api_key: 'bot-api-key' 
     * });
     * 
     * console.log('Bot name:', bot?.name);
     * console.log('Response URL:', bot?.response_url);
     * ```
     */
    async getById(bot: AppBotInterface): Promise<AppBot | null> {
        let uri = `/${bot.id}`;
        const { data } = await this.client.GET(uri);

        if (data) {
            return new AppBot(this, {...data, api_key: bot.api_key} as AppBotInterface);
        }
        return null;
    }

    /**
     * Create a new app bot
     * 
     * Creates a new bot associated with an application. The bot can be
     * configured with an agent or agent group for AI interactions.
     * 
     * @param bot - Bot data for the new bot (ID will be generated)
     * @param bot.app - Application ID the bot belongs to (required)
     * @param bot.response_url - Webhook URL for bot responses (required)
     * @param bot.agent - Agent ID to use for AI interactions (optional)
     * @param bot.agent_group - Agent group ID to use for AI interactions (optional)
     * @returns Promise that resolves to the created bot
     * 
     * @example
     * ```typescript
     * const newBot = await appBots.create({
     *   app: 'app-123',
     *   response_url: 'https://myapp.com/webhook',
     *   agent: 'agent-456',
     *   active: true,
     *   tags: ['support', 'ai']
     * });
     * 
     * console.log('Created bot ID:', newBot.id);
     * ```
     */
    async create(bot: AppBotInterface): Promise<AppBot> {
        const { data } = await this.client.POST('', bot);

        return new AppBot(this, data as AppBotInterface);
    }

    /**
     * Update an existing app bot
     * 
     * Updates a bot with the provided data. The bot parameter must
     * include an ID to identify which bot to update.
     * 
     * @param bot - Bot data to update (must include ID)
     * @returns Promise that resolves to the updated bot
     * 
     * @example
     * ```typescript
     * const updatedBot = await appBots.update({
     *   id: 'bot-123',
     *   response_url: 'https://new-webhook.com/callback',
     *   agent: 'new-agent-789'
     * });
     * ```
     */
    async update(bot: AppBotInterface): Promise<AppBot>  {
        const { data } = await this.client.PUT(`/${bot.id}`, bot);

        return new AppBot(this, data as AppBotInterface);
    }

    /**
     * Delete an app bot
     * 
     * Removes a bot from the platform. The bot parameter must
     * include an ID to identify which bot to delete.
     * 
     * @param bot - Bot to delete (must include ID)
     * @returns Promise that resolves to null when deletion is successful
     * 
     * @example
     * ```typescript
     * await appBots.delete({ id: 'bot-123' });
     * console.log('Bot deleted successfully');
     * ```
     */
    async delete(bot: AppBotInterface): Promise<null>  {
        const response = await this.client.DELETE<null>(`/${bot.id}`);

        return response.data;
    }
}