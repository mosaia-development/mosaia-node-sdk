import { AppInterface } from '../types';
import { BaseModel } from './base';

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
}