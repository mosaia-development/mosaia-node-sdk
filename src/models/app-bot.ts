import { AppBotInterface } from '../types';
import { BaseModel } from './base';

/**
 * AppBot class for managing application bot instances in the Mosaia SDK
 * 
 * Represents a specialized integration that connects applications with AI agents
 * or agent groups through webhook-style interactions. App bots enable automated
 * responses and workflows within external applications.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - App bot data management and validation
 * - Webhook endpoint and response URL management
 * - Bot-specific API key and authentication handling
 * - Integration with the Mosaia API for app bot operations
 * 
 * @example
 * ```typescript
 * import { AppBot } from 'mosaia-node-sdk';
 * 
 * // Create an app bot instance
 * const appBot = new AppBot({
 *   app: 'app-id',
 *   response_url: 'https://myapp.com/webhook',
 *   agent: 'agent-id',
 *   api_key: 'bot-api-key',
 *   api_key_partial: 'bot-***-key'
 * });
 * 
 * // Access app bot data
 * console.log('Response URL:', appBot.response_url);
 * console.log('API Key Partial:', appBot.api_key_partial);
 * ```
 * 
 * @extends BaseModel<AppBotInterface>
 */
export default class AppBot extends BaseModel<AppBotInterface> {
    /**
     * Creates a new AppBot instance
     * 
     * Initializes an app bot with the provided configuration data and optional URI.
     * The app bot represents a webhook integration between an application and AI agents.
     * 
     * @param data - App bot configuration data
     * @param uri - Optional URI path for the app bot endpoint. Defaults to '/bot'
     * 
     * @example
     * ```typescript
     * const appBot = new AppBot({
     *   app: 'my-app-id',
     *   response_url: 'https://myapp.com/webhook',
     *   agent: 'support-agent-id'
     * });
     * ```
     */
    constructor(data: Partial<AppBotInterface>, uri?: string) {
        super(data, uri || '/bot');
    }
} 