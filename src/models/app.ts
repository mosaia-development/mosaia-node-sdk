import { AppInterface } from '../types';
import { BaseModel } from './base';

/**
 * App class for managing application instances in the Mosaia SDK
 * 
 * Represents an application in the Mosaia platform that serves as a container
 * for AI-powered solutions. Applications are the primary entry points for users
 * to interact with agents, tools, and workflows.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - Application data management and validation
 * - Application configuration and settings management
 * - Integration with the Mosaia API for application operations
 * - External application URL and API key management
 * 
 * @example
 * ```typescript
 * import { App } from 'mosaia-node-sdk';
 * 
 * // Create an application instance
 * const app = new App({
 *   name: 'Customer Support Portal',
 *   short_description: 'AI-powered customer support application',
 *   long_description: 'A comprehensive customer support solution using AI agents',
 *   external_app_url: 'https://support.example.com',
 *   external_api_key: 'external-api-key',
 *   external_headers: {
 *     'Authorization': 'Bearer token'
 *   }
 * });
 * 
 * // Access application data
 * console.log('App Name:', app.name);
 * console.log('External URL:', app.external_app_url);
 * ```
 * 
 * @extends BaseModel<AppInterface>
 */
export default class App extends BaseModel<AppInterface> {
    /**
     * Creates a new App instance
     * 
     * Initializes an application with the provided configuration data and optional URI.
     * The application represents a container for AI-powered solutions.
     * 
     * @param data - Application configuration data
     * @param uri - Optional URI path for the application endpoint. Defaults to '/app'
     * 
     * @example
     * ```typescript
     * const app = new App({
     *   name: 'My AI App',
     *   short_description: 'AI-powered application',
     *   external_app_url: 'https://myapp.com'
     * });
     * ```
     */
    constructor(data: Partial<AppInterface>, uri?: string) {
        super(data, uri || '/app');
    }
}