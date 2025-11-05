import { NotificationEmailInterface, NotificationResponseInterface } from '../types';
import APIClient from '../utils/api-client';

/**
 * Notifications API client for the Mosaia SDK
 * 
 * Provides email notification functionality for sending emails through the Mosaia platform.
 * This is useful for sending transactional emails, notifications, and other communications.
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const notifications = mosaia.notifications;
 * 
 * // Send an email
 * const result = await notifications.sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   text: 'Welcome to our platform!',
 *   html: '<h1>Welcome!</h1><p>Welcome to our platform!</p>'
 * });
 * ```
 */
export default class Notifications {
    private apiClient: APIClient;
    private uri: string;

    constructor(uri = '') {
        this.uri = `${uri}/notify`;
        this.apiClient = new APIClient();
    }

    /**
     * Send an email notification
     * 
     * Sends an email through the Mosaia platform's notification service.
     * Supports both plain text and HTML email formats.
     * 
     * @param email - Email notification data
     * @param email.to - Recipient email address (required)
     * @param email.subject - Email subject line (required)
     * @param email.text - Plain text email content (required if html not provided)
     * @param email.html - HTML email content (required if text not provided)
     * @returns Promise resolving to notification response
     * 
     * @example
     * ```typescript
     * // Send plain text email
     * const result = await notifications.sendEmail({
     *   to: 'user@example.com',
     *   subject: 'Password Reset',
     *   text: 'Your password reset code is: 123456'
     * });
     * ```
     * 
     * @example
     * ```typescript
     * // Send HTML email
     * const result = await notifications.sendEmail({
     *   to: 'user@example.com',
     *   subject: 'Welcome!',
     *   html: '<h1>Welcome!</h1><p>Thank you for joining!</p>'
     * });
     * ```
     * 
     * @throws {Error} When email sending fails or required fields are missing
     */
    async sendEmail(email: NotificationEmailInterface): Promise<NotificationResponseInterface> {
        try {
            const response = await this.apiClient.POST<NotificationResponseInterface>(`${this.uri}/email`, email);
            return response.data || response as NotificationResponseInterface;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
}

