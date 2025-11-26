import { MeterInterface } from '../types';
import { BaseModel } from './base';

/**
 * Meter class for managing usage meters and billing
 * 
 * This class represents a usage meter in the Mosaia platform, which tracks
 * service consumption and associated costs for billing and resource management
 * purposes. Meters can be associated with either organizations or users.
 * 
 * Features:
 * - Usage tracking
 * - Cost metering
 * - Organization and user associations
 * - Metadata storage
 * - Billing integration
 * 
 * @remarks
 * Usage meters are crucial for:
 * - Billing and invoicing
 * - Resource consumption tracking
 * - Cost analysis
 * - Usage analytics
 * - Quota management
 * 
 * @example
 * Basic meter creation:
 * ```typescript
 * import { Meter } from 'mosaia-node-sdk';
 * 
 * // Create a meter for an organization
 * const meter = new Meter({
 *   org: 'org-id',
 *   type: 'api_calls',
 *   value: 1000,
 *   metadata: {
 *     service: 'ai-completion',
 *     model: 'gpt-4'
 *   }
 * });
 * 
 * await meter.save();
 * ```
 * 
 * @example
 * User meter:
 * ```typescript
 * // Create a meter for a user
 * const userMeter = new Meter({
 *   user: 'user-id',
 *   type: 'storage',
 *   value: 5000,
 *   metadata: {
 *     unit: 'MB',
 *     period: 'monthly'
 *   }
 * });
 * 
 * await userMeter.save();
 * ```
 * 
 * @extends BaseModel<MeterInterface>
 * @category Models
 */
export default class Meter extends BaseModel<MeterInterface> {
    /**
     * Creates a new Meter instance
     * 
     * Initializes a usage meter with the provided configuration data.
     * Meters track service consumption and costs for billing purposes.
     * 
     * @param data - Configuration data including:
     *               - org: Organization ID (optional, if org-scoped)
     *               - user: User ID (optional, if user-scoped)
     *               - type: Meter type (e.g., 'api_calls', 'storage', 'compute')
     *               - value: Usage value
     *               - metadata: Additional usage details
     * @param uri - Optional custom URI path for the meter endpoint
     * 
     * @example
     * Organization meter:
     * ```typescript
     * const meter = new Meter({
     *   org: 'org-123',
     *   type: 'api_calls',
     *   value: 1000
     * });
     * ```
     * 
     * @example
     * User meter with metadata:
     * ```typescript
     * const meter = new Meter({
     *   user: 'user-456',
     *   type: 'storage',
     *   value: 5000,
     *   metadata: {
     *     unit: 'MB',
     *     period: 'monthly',
     *     service: 'file-storage'
     *   }
     * }, '/user/billing/usage');
     * ```
     */
    constructor(data: Partial<MeterInterface>, uri?: string) {
        super(data, uri || '/billing/usage');
    }
}

