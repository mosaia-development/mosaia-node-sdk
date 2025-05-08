import { DEFAULT_CONFIG } from '../config';
import { Tool } from '../models';
import {
    MosiaConfig,
    ToolInterface
} from '../types';
import APIClient from './api-client';

export default class Tools {
    private client: APIClient;
    public config: MosiaConfig;

    constructor(config: MosiaConfig) {
        let baseURL;
        if (config.user) {
            baseURL = `${config.baseURL}/user/${config.user}${DEFAULT_CONFIG.ENDPOINTS.TOOLS}`;
        } else if(config.org) {
            baseURL = `${config.baseURL}/org/${config.org}${DEFAULT_CONFIG.ENDPOINTS.TOOLS}`;
        } else {
            throw new Error('User or org id is required to call tools endpoint');
        }

        this.config = {
            ...config,
            baseURL,
        };
        this.client = new APIClient(this.config);
    }

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

    async create(tool: ToolInterface): Promise<Tool> {
        const { data } = await this.client.POST('', tool);

        return new Tool(this, data as ToolInterface);
    }

    async update(tool: ToolInterface): Promise<Tool> {
        const { data } = await this.client.PUT(`/${tool.id}`, tool);

        return new Tool(this, data as ToolInterface);
    }

    async delete(tool: ToolInterface): Promise<null> {
        const response = await this.client.DELETE<null>(`/${tool.id}`);

        return response.data;
    }
}