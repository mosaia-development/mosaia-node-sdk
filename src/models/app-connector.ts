import { AppConnectorInterface } from '../types';
import { BaseModel } from './base';

/**
 * AppConnector class for managing webhook-based AI integrations
 * 
 * This class represents a specialized integration that connects external
 * applications with AI agents through webhook-style interactions. AppConnectors
 * enable automated responses and workflows by bridging the gap between
 * applications and AI capabilities.
 * 
 * Features:
 * - Webhook endpoint management
 * - Secure API key handling
 * - Agent/group assignment
 * - Response routing
 * - Event handling
 * 
 * @remarks
 * AppConnectors are particularly useful for:
 * - Chat platform integrations (Slack, Discord, etc.)
 * - Custom application webhooks
 * - Automated response systems
 * - Event-driven AI interactions
 * - Secure API access management
 * 
 * @example
 * Basic connector setup:
 * ```typescript
 * import { AppConnector } from 'mosaia-node-sdk';
 * 
 * // Create a Slack integration bot
 * const slackBot = new AppConnector({
 *   app: 'slack-app-id',
 *   response_url: 'https://slack.example.com/webhook',
 *   agent: 'support-agent-id',
 *   name: 'Slack Support Bot'
 * });
 * 
 * await slackBot.save();
 * console.log('Bot API Key:', slackBot.api_key);
 * ```
 * 
 * @example
 * Custom webhook integration:
 * ```typescript
 * // Create a custom webhook bot
 * const webhookBot = new AppConnector({
 *   app: 'custom-app-id',
 *   response_url: 'https://api.example.com/ai-webhook',
 *   agent_group: 'expert-team-id',
 *   name: 'API Integration Bot',
 *   metadata: {
 *     team: 'engineering',
 *     environment: 'production'
 *   }
 * });
 * 
 * // Configure and activate
 * await webhookBot.save();
 * if (webhookBot.isActive()) {
 *   console.log('Webhook URL:', webhookBot.response_url);
 *   console.log('API Key:', webhookBot.api_key);
 * }
 * ```
 * 
 * @extends BaseModel<AppConnectorInterface>
 * @category Models
 */
export default class AppConnector extends BaseModel<AppConnectorInterface> {
    /**
     * Creates a new AppConnector instance
     * 
     * Initializes an app connector that connects external applications with AI agents
     * through webhook-style interactions. The bot manages webhook endpoints,
     * API keys, and routing of responses.
     * 
     * @param data - Configuration data including:
     *               - app: Parent application ID
     *               - response_url: Webhook endpoint URL
     *               - agent: Associated agent ID (optional)
     *               - agent_group: Associated agent group ID (optional)
     *               - name: Bot display name
     *               - metadata: Custom metadata object
     * @param uri - Optional custom URI path for the bot endpoint
     * 
     * @example
     * Basic webhook connector:
     * ```typescript
     * const connector = new AppConnector({
     *   app: 'app-123',
     *   response_url: 'https://api.example.com/webhook',
     *   agent: 'agent-456',
     *   name: 'API Bot'
     * });
     * ```
     * 
     * @example
     * Advanced configuration:
     * ```typescript
     * const connector = new AppConnector({
     *   app: 'app-123',
     *   response_url: 'https://chat.example.com/events',
     *   agent_group: 'group-789',
     *   name: 'Chat Integration',
     *   metadata: {
     *     platform: 'slack',
     *     channel: 'support',
     *     team: 'customer-success'
     *   }
     * }, '/integrations/connector');
     * ```
     */
    constructor(data: Partial<AppConnectorInterface>, uri?: string) {
        super(data, uri || '/connector');
    }
} 