import {
    MeterInterface,
    GetMetersPayload,
    GetMeterPayload
} from '../types';
import { Meter } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Meters API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing usage meters in the Mosaia platform.
 * Meters track service consumption and associated costs for billing and resource
 * management purposes. Meters can be associated with either organizations or users.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve usage meters with filtering and pagination
 * - Create new usage meters
 * - Update existing meter configurations
 * - Delete usage meters
 * - Manage organization and user associations
 * - Handle usage tracking and billing
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const meters = mosaia.meters;
 * 
 * // Get all usage meters
 * const allMeters = await meters.get();
 * 
 * // Get a specific usage meter
 * const meter = await meters.get({}, 'meter-id');
 * 
 * // Create a new usage meter
 * const newMeter = await meters.create({
 *   org: 'org-id',
 *   type: 'api_calls',
 *   value: 1000,
 *   metadata: {
 *     service: 'ai-completion',
 *     model: 'gpt-4'
 *   }
 * });
 * ```
 * 
 * @extends BaseCollection<MeterInterface, Meter, GetMetersPayload, GetMeterPayload>
 */
export default class Meters extends BaseCollection<
    MeterInterface,
    Meter,
    GetMetersPayload,
    GetMeterPayload
> {
    /**
     * Creates a new Meters API client instance
     * 
     * Initializes the meters client with the appropriate endpoint URI
     * and model class for handling meter operations.
     * 
     * The constructor sets up the API endpoint to `/billing/usage` (or `${uri}/billing/usage` if a base URI is provided),
     * which corresponds to the Mosaia API's usage meters endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/billing/usage`.
     *              If not provided, defaults to `/billing/usage`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/billing/usage)
     * const meters = new Meters();
     * 
     * // Create with custom base URI (e.g., for org-scoped access)
     * const meters = new Meters('/org/org-id');
     * // This will use endpoint: /org/org-id/billing/usage
     * 
     * // Create for user-scoped access
     * const userMeters = new Meters('/user/user-id');
     * // This will use endpoint: /user/user-id/billing/usage
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/billing/usage`, Meter);
    }
}

