import {
    MosiaConfig,
    AppInterface,
    AppBotInterface
} from '../types';
import { AppBot } from '../models';
import APIClient from './api-client';
import Apps from './apps';
import { DEFAULT_CONFIG } from '../config';

export default class AppBots {
    private client: APIClient;
    public config: MosiaConfig;

    constructor(apps: Apps, app?: AppInterface) {
        const { config } = apps;
        let baseURL = config.baseURL;

        if (app && app.id) baseURL += `/${app.id}`;
        baseURL += DEFAULT_CONFIG.ENDPOINTS.BOTS;

        this.config = {
            ...config,
            baseURL,
        };
        this.client = new APIClient(this.config);
    }

    // Example endpoint methods
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

    async getById(bot: AppBotInterface): Promise<AppBot | null> {
        let uri = `/${bot.id}`;
        const { data } = await this.client.GET(uri);

        if (data) {
            return new AppBot(this, {...data, api_key: bot.api_key} as AppBotInterface);
        }
        return null;
    }

    async create(bot: AppBotInterface): Promise<AppBot> {
        const { data } = await this.client.POST('', bot);

        return new AppBot(this, data as AppBotInterface);
    }

    async update(bot: AppBotInterface): Promise<AppBot>  {
        const { data } = await this.client.PUT(`/${bot.id}`, bot);

        return new AppBot(this, data as AppBotInterface);
    }

    async delete(bot: AppBotInterface): Promise<null>  {
        const response = await this.client.DELETE<null>(`/${bot.id}`);

        return response.data;
    }
}