import {
    AppWebhookInterface,
    GetAppWebhooksPayload,
    GetAppWebhookPayload
} from '../types';
import { AppWebhook } from '../models';
import { BaseCollection } from './base-collection';

/**
 * App Webhooks API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing app webhooks in the Mosaia platform.
 * App webhooks enable external systems to receive notifications about application
 * events, allowing for event-driven integrations and real-time updates.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve app webhooks with filtering and pagination
 * - Create new app webhook configurations
 * - Update existing webhook configurations
 * - Delete app webhook configurations
 * - Manage webhook URLs and event subscriptions
 * - Handle webhook secrets and authentication
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const appWebhooks = mosaia.appWebhooks;
 * 
 * // Get all app webhooks
 * const allWebhooks = await appWebhooks.get();
 * 
 * // Get a specific app webhook
 * const webhook = await appWebhooks.get({}, 'webhook-id');
 * 
 * // Create a new app webhook
 * const newWebhook = await appWebhooks.create({
 *   app: 'app-id',
 *   url: 'https://myapp.com/webhook',
 *   events: ['REQUEST'],
 *   secret: 'webhook-secret-key',
 *   active: true
 * });
 * ```
 * 
 * @extends BaseCollection<AppWebhookInterface, AppWebhook, GetAppWebhooksPayload, GetAppWebhookPayload>
 */
export default class AppWebhooks extends BaseCollection<
    AppWebhookInterface,
    AppWebhook,
    GetAppWebhooksPayload,
    GetAppWebhookPayload
> {
    /**
     * Creates a new App Webhooks API client instance
     * 
     * Initializes the app webhooks client with the appropriate endpoint URI
     * and model class for handling app webhook operations.
     * 
     * The constructor sets up the API endpoint to `/hook` (or `${uri}/hook` if a base URI is provided),
     * which corresponds to the Mosaia API's app webhooks endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/hook`.
     *              If not provided, defaults to `/hook`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/hook)
     * const appWebhooks = new AppWebhooks();
     * 
     * // Create with custom base URI
     * const appWebhooks = new AppWebhooks('/api/v1');
     * // This will use endpoint: /api/v1/hook
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/hook`, AppWebhook);
    }
}

