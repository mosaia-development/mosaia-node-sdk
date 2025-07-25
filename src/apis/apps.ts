import {
    MosiaConfig,
    AppInterface
} from '../types';
import { App } from '../models';
import APIClient from './api-client';
import { DEFAULT_CONFIG } from '../config';

export default class Apps {
    private client: APIClient;
    public config: MosiaConfig;

    constructor(config: MosiaConfig) {
        const apiURL = `${config.apiURL}${DEFAULT_CONFIG.ENDPOINTS.APPS}`;

        this.config = {
            ...config,
            apiURL,
        };
        this.client = new APIClient(this.config);
    }

    // Example endpoint methods
    async get(app?: AppInterface): Promise<App[] | App | null> {
        let uri = '';

        if (app && app.id) uri += `/${app.id}`;
        const { data } = await this.client.GET(uri);
    
        if (Array.isArray(data)) {
            return data.map((app) => new App(this, app));
        }

        if (data) {
            return new App(this, data as AppInterface);
        }
        return null;
    }

    async create(app: AppInterface): Promise<App> {
        const { data } = await this.client.POST('', app);

        return new App(this, data as AppInterface);
    }

    async update(app: AppInterface): Promise<App>  {
        const { data } = await this.client.PUT(`/${app.id}`, app);

        return new App(this, data as AppInterface);
    }

    async delete(app: AppInterface): Promise<null>  {
        const response = await this.client.DELETE<null>(`/${app.id}`);

        return response.data;
    }
}