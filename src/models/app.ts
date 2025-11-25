import { AppInterface, GetAppPayload } from '../types';
import { BaseModel } from './base';
import {
    AppConnectors,
    AppWebhooks
} from '../collections';
import { Image } from '../functions/image';

/**
 * App class for managing AI-powered applications
 * 
 * This class represents an application in the Mosaia platform, serving as a
 * container and orchestrator for AI solutions. Apps provide the structure and
 * configuration for deploying and managing AI capabilities.
 * 
 * Features:
 * - Application lifecycle management
 * - External integration configuration
 * - Security and access control
 * - Resource organization
 * - Usage monitoring
 * 
 * @remarks
 * Applications are the foundational building blocks for deploying AI solutions.
 * They provide:
 * - Centralized configuration management
 * - Integration points with external systems
 * - Security boundary definitions
 * - Resource allocation and monitoring
 * - Usage analytics and reporting
 * 
 * @example
 * Basic app setup:
 * ```typescript
 * import { App } from 'mosaia-node-sdk';
 * 
 * // Create a new application
 * const supportPortal = new App({
 *   name: 'AI Support Portal',
 *   short_description: 'Intelligent customer support',
 *   long_description: 'AI-powered support system with multiple specialized agents',
 *   external_app_url: 'https://support.example.com'
 * });
 * 
 * // Save the application
 * await supportPortal.save();
 * ```
 * 
 * @example
 * External integration:
 * ```typescript
 * // Configure external system integration
 * const app = new App({
 *   name: 'Integration App',
 *   external_app_url: 'https://api.external-system.com',
 *   external_api_key: process.env.EXTERNAL_API_KEY,
 *   external_headers: {
 *     'X-Custom-Header': 'value',
 *     'Authorization': `Bearer ${process.env.AUTH_TOKEN}`
 *   }
 * });
 * 
 * // Test the connection
 * if (app.isActive()) {
 *   console.log('Integration configured successfully');
 * }
 * ```
 * 
 * @extends BaseModel<AppInterface>
 * @category Models
 */
export default class App extends BaseModel<AppInterface> {
    /**
     * Creates a new App instance
     * 
     * Initializes an application with the provided configuration data and optional
     * URI. The application serves as a container for organizing and managing
     * AI-powered solutions.
     * 
     * @param data - Application configuration data including:
     *               - name: Application name
     *               - short_description: Brief description
     *               - long_description: Detailed description
     *               - external_app_url: External system URL
     *               - external_api_key: API key for external system
     *               - external_headers: Custom headers for external requests
     * @param uri - Optional URI path for the application endpoint
     * 
     * @example
     * Basic configuration:
     * ```typescript
     * const app = new App({
     *   name: 'Customer Portal',
     *   short_description: 'AI customer service portal',
     *   external_app_url: 'https://portal.example.com'
     * });
     * ```
     * 
     * @example
     * Full configuration:
     * ```typescript
     * const app = new App({
     *   name: 'Enterprise Solution',
     *   short_description: 'AI-powered enterprise tools',
     *   long_description: 'Comprehensive suite of AI tools for enterprise use',
     *   external_app_url: 'https://enterprise.example.com',
     *   external_api_key: process.env.API_KEY,
     *   external_headers: {
     *     'X-Enterprise-ID': 'ent-123',
     *     'Authorization': 'Bearer token'
     *   }
     * }, '/enterprise/app');
     * ```
     */
    constructor(data: Partial<AppInterface>, uri?: string) {
        super(data, uri || '/app');
    }

    /**
     * Get the app's AI connectors
     * 
     * This getter provides access to the app's connectors through
     * the AppConnectors collection. It enables management of all connectors within
     * the app.
     * 
     * @returns AppConnectors collection for managing connectors
     * 
     * @example
     * List connectors:
     * ```typescript
     * const connectors = await app.connectors.get();
     * connectors.forEach(connector => {
     *   console.log(`Connector: ${connector.name}`);
     * });
     * ```
     * 
     * @example
     * Create connector:
     * ```typescript
     * const connector = await app.connectors.create({
     *   name: 'Customer Support Connector'
     * });
     * ```
     */
    get connectors(): AppConnectors {
        return new AppConnectors(this.getUri());
    }

    /**
     * Get the app's webhooks
     * 
     * This getter provides access to the app's webhooks through
     * the AppWebhooks collection. It enables management of all webhooks within
     * the app for receiving notifications about application events.
     * 
     * @returns AppWebhooks collection for managing webhooks
     * 
     * @example
     * List webhooks:
     * ```typescript
     * const webhooks = await app.webhooks.get();
     * webhooks.forEach(webhook => {
     *   console.log(`Webhook URL: ${webhook.url}`);
     * });
     * ```
     * 
     * @example
     * Create webhook:
     * ```typescript
     * const webhook = await app.webhooks.create({
     *   url: 'https://myapp.com/webhook',
     *   events: ['REQUEST'],
     *   secret: 'webhook-secret-key'
     * });
     * ```
     */
    get webhooks(): AppWebhooks {
        return new AppWebhooks(this.getUri());
    }

    /**
     * Get the image functionality for this app
     * 
     * This getter provides access to the app's image operations through
     * the Image class. It allows for image uploads and other image-related
     * operations specific to this app.
     * 
     * @returns A new Image instance configured for this app
     * 
     * @example
     * ```typescript
     * const updatedApp = await app.image.upload<App, GetAppPayload>(file);
     * ```
     */
    get image(): Image {
        return new Image(this.getUri(), (this.data as any).image || '');
    }

    /**
     * Like or unlike this app
     * 
     * Toggles the like status of this app. If the app is already liked,
     * it will be unliked, and vice versa.
     * 
     * @returns Promise that resolves to the updated app instance
     * 
     * @example
     * ```typescript
     * await app.like();
     * console.log('App liked:', app.liked);
     * ```
     * 
     * @throws {Error} When API request fails
     */
    async like(): Promise<App> {
        try {
            const response = await this.apiClient.POST<GetAppPayload>(`${this.getUri()}/like`);
            if (!response || !response.data) {
                throw new Error('Invalid response from API');
            }
            this.update(response.data);
            return this;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
}