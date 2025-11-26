import {
    AppInterface,
    GetAppsPayload,
    GetAppPayload
} from '../types';
import { App } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Applications API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing applications in the Mosaia platform.
 * Applications are the primary containers for AI-powered solutions, serving as
 * the entry point for users to interact with agents, tools, and workflows.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve applications with filtering and pagination
 * - Create new applications with custom configurations
 * - Manage application integrations and external connections
 * - Handle application-specific metadata and configurations
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const apps = mosaia.apps;
 * 
 * // Get all applications
 * const allApps = await apps.get();
 * 
 * // Get a specific application
 * const app = await apps.get({}, 'app-id');
 * 
 * // Create a new application
 * const newApp = await apps.create({
 *   name: 'Customer Support Portal',
 *   short_description: 'AI-powered customer support application',
 *   long_description: 'A comprehensive customer support solution using AI agents',
 *   external_app_url: 'https://support.example.com',
 *   external_api_key: 'external-api-key'
 * });
 * 
 * // Like an app (via model instance)
 * await app.like();
 * ```
 * 
 * @extends BaseCollection<AppInterface, App, GetAppsPayload, GetAppPayload>
 */
export default class Apps extends BaseCollection<
    AppInterface,
    App,
    GetAppsPayload,
    GetAppPayload
> {
    /**
     * Creates a new Applications API client instance
     * 
     * Initializes the applications client with the appropriate endpoint URI
     * and model class for handling application operations.
     * 
     * The constructor sets up the API endpoint to `/app` (or `${uri}/app` if a base URI is provided),
     * which corresponds to the Mosaia API's applications endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/app`.
     *              If not provided, defaults to `/app`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/app)
     * const apps = new Apps();
     * 
     * // Create with custom base URI
     * const apps = new Apps('/api/v1');
     * // This will use endpoint: /api/v1/app
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/app`, App);
    }
}