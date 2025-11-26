import { AppWebhookInterface } from '../types';
import { BaseModel } from './base';

/**
 * AppWebhook class for managing application webhook configurations
 * 
 * This class represents a webhook configuration that enables external systems
 * to receive notifications about application events. AppWebhooks handle
 * webhook URLs, event types, and integration configuration for receiving
 * notifications from the Mosaia platform.
 * 
 * Features:
 * - Webhook URL management
 * - Event type configuration
 * - Secret key handling for webhook security
 * - Active/inactive status management
 * - External system integration
 * 
 * @remarks
 * AppWebhooks are particularly useful for:
 * - External system notifications
 * - Event-driven integrations
 * - Real-time application updates
 * - Third-party service integrations
 * - Secure webhook delivery
 * 
 * @example
 * Basic webhook setup:
 * ```typescript
 * import { AppWebhook } from 'mosaia-node-sdk';
 * 
 * // Create a webhook for request events
 * const webhook = new AppWebhook({
 *   app: 'app-id',
 *   url: 'https://myapp.com/webhook',
 *   events: ['REQUEST'],
 *   secret: 'webhook-secret-key'
 * });
 * 
 * await webhook.save();
 * console.log('Webhook URL:', webhook.url);
 * ```
 * 
 * @example
 * Advanced webhook configuration:
 * ```typescript
 * // Create a webhook with multiple event types
 * const webhook = new AppWebhook({
 *   app: 'app-id',
 *   url: 'https://api.example.com/webhooks',
 *   events: ['REQUEST', 'RESPONSE'],
 *   secret: 'secure-secret-key',
 *   active: true,
 *   external_id: 'external-webhook-id',
 *   extensors: {
 *     environment: 'production',
 *     team: 'engineering'
 *   }
 * });
 * 
 * // Configure and activate
 * await webhook.save();
 * if (webhook.active) {
 *   console.log('Webhook is active:', webhook.url);
 * }
 * ```
 * 
 * @extends BaseModel<AppWebhookInterface>
 * @category Models
 */
export default class AppWebhook extends BaseModel<AppWebhookInterface> {
    /**
     * Creates a new AppWebhook instance
     * 
     * Initializes a webhook configuration that enables external systems to receive
     * notifications about application events. The webhook manages URL, event types,
     * and security configuration.
     * 
     * @param data - Configuration data including:
     *               - app: Parent application ID
     *               - url: Webhook endpoint URL where notifications will be sent
     *               - events: Array of event types to subscribe to
     *               - secret: Optional secret key for webhook authentication
     *               - active: Whether the webhook is currently active
     *               - external_id: Optional external system identifier
     *               - extensors: Optional custom metadata object
     * @param uri - Optional custom URI path for the webhook endpoint
     * 
     * @example
     * Basic webhook:
     * ```typescript
     * const webhook = new AppWebhook({
     *   app: 'app-123',
     *   url: 'https://api.example.com/webhook',
     *   events: ['REQUEST']
     * });
     * ```
     * 
     * @example
     * Advanced configuration:
     * ```typescript
     * const webhook = new AppWebhook({
     *   app: 'app-123',
     *   url: 'https://api.example.com/webhooks',
     *   events: ['REQUEST', 'RESPONSE'],
     *   secret: 'webhook-secret',
     *   active: true,
     *   external_id: 'ext-123',
     *   extensors: {
     *     platform: 'slack',
     *     channel: 'notifications'
     *   }
     * }, '/integrations/webhook');
     * ```
     */
    constructor(data: Partial<AppWebhookInterface>, uri?: string) {
        super(data, uri || '/hook');
    }
}

