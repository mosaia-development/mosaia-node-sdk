import { TriggerInterface } from '../types';
import { BaseModel } from './base';

/** Response from the trigger execute API (202). */
export interface TriggerExecuteResponse {
    message: string;
    triggerId: string;
}

/**
 * Trigger class for managing scheduled and event-based triggers (CRON, WEBHOOK, EVENT, MANUAL).
 *
 * Triggers can be scoped to an agent, task, or plan. CRON triggers run on a schedule (e.g. daily);
 * use config.cron_expression, config.timezone, and config.run_once for one-shot.
 *
 * @extends BaseModel<TriggerInterface>
 * @category Models
 */
export default class Trigger extends BaseModel<TriggerInterface> {
    constructor(data: Partial<TriggerInterface>, uri?: string) {
        super(data, uri || '/trigger');
    }

    /**
     * Manually execute the trigger (async; invokes trigger-executor Lambda).
     * Returns immediately with a confirmation; the actual run is asynchronous.
     *
     * @returns Promise resolving to the execute response (message, triggerId)
     *
     * @example
     * ```typescript
     * const trigger = await mosaia.triggers.get({}, triggerId);
     * const result = await trigger.execute();
     * // { message: 'Trigger execution initiated', triggerId: '...' }
     * ```
     */
    async execute(): Promise<TriggerExecuteResponse> {
        const response = await this.apiClient.POST<TriggerExecuteResponse>(`${this.getUri()}/execute`, {});
        if (!response?.data) {
            throw new Error('Invalid response from execute API');
        }
        return response.data as TriggerExecuteResponse;
    }
}
