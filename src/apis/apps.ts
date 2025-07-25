import {
    MosiaConfig,
    AppInterface
} from '../types';
import { App } from '../models';
import APIClient from './api-client';
import { DEFAULT_CONFIG } from '../config';

/**
 * Applications API client for managing applications
 * 
 * This class provides methods for creating, reading, updating, and deleting
 * applications on the Mosaia platform. Applications can contain bots, tools,
 * and other integrations.
 * 
 * @example
 * ```typescript
 * const apps = new Apps(config);
 * 
 * // Get all apps
 * const allApps = await apps.get();
 * 
 * // Get specific app
 * const app = await apps.get({ id: 'app-id' });
 * 
 * // Create new app
 * const newApp = await apps.create({
 *   name: 'My App',
 *   short_description: 'Description'
 * });
 * ```
 */
export default class Apps {
    private client: APIClient;
    public config: MosiaConfig;

    /**
     * Creates a new Applications API client instance
     * 
     * @param config - Configuration object containing API settings
     */
    constructor(config: MosiaConfig) {
        const apiURL = `${config.apiURL}${DEFAULT_CONFIG.ENDPOINTS.APPS}`;

        this.config = {
            ...config,
            apiURL,
        };
        this.client = new APIClient(this.config);
    }

    /**
     * Get applications with optional filtering
     * 
     * Retrieves applications from the platform. If an app parameter with an ID
     * is provided, returns a single app. Otherwise, returns all apps.
     * 
     * @param app - Optional app object with ID to get a specific application
     * @returns Promise that resolves to an array of apps, a single app, or null
     * 
     * @example
     * ```typescript
     * // Get all apps
     * const allApps = await apps.get();
     * 
     * // Get specific app by ID
     * const app = await apps.get({ id: 'app-123' });
     * 
     * // Get specific app by full app object
     * const appData = { id: 'app-123', name: 'My App' };
     * const app = await apps.get(appData);
     * ```
     */
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

    /**
     * Create a new application
     * 
     * Creates a new application on the platform with the provided data.
     * 
     * @param app - Application data for the new app (ID will be generated)
     * @returns Promise that resolves to the created application
     * 
     * @example
     * ```typescript
     * const newApp = await apps.create({
     *   name: 'My AI Assistant',
     *   short_description: 'AI-powered customer support',
     *   org: 'org-123',
     *   tags: ['ai', 'support']
     * });
     * 
     * console.log('Created app ID:', newApp.id);
     * ```
     */
    async create(app: AppInterface): Promise<App> {
        const { data } = await this.client.POST('', app);

        return new App(this, data as AppInterface);
    }

    /**
     * Update an existing application
     * 
     * Updates an application with the provided data. The app parameter must
     * include an ID to identify which application to update.
     * 
     * @param app - Application data to update (must include ID)
     * @returns Promise that resolves to the updated application
     * 
     * @example
     * ```typescript
     * const updatedApp = await apps.update({
     *   id: 'app-123',
     *   name: 'Updated App Name',
     *   short_description: 'Updated description'
     * });
     * ```
     */
    async update(app: AppInterface): Promise<App>  {
        const { data } = await this.client.PUT(`/${app.id}`, app);

        return new App(this, data as AppInterface);
    }

    /**
     * Delete an application
     * 
     * Removes an application from the platform. The app parameter must
     * include an ID to identify which application to delete.
     * 
     * @param app - Application to delete (must include ID)
     * @returns Promise that resolves to null when deletion is successful
     * 
     * @example
     * ```typescript
     * await apps.delete({ id: 'app-123' });
     * console.log('App deleted successfully');
     * ```
     */
    async delete(app: AppInterface): Promise<null>  {
        const response = await this.client.DELETE<null>(`/${app.id}`);

        return response.data;
    }
}