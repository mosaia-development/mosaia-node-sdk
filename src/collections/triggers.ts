import {
    TriggerInterface,
    GetTriggersPayload,
    GetTriggerPayload
} from '../types';
import { Trigger } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Triggers API client for the Mosaia SDK
 *
 * Provides CRUD operations for triggers (CRON, WEBHOOK, EVENT, MANUAL).
 * Can be used top-level (mosaia.triggers) or scoped to a task (task.triggers) or plan (plan.triggers).
 *
 * @extends BaseCollection<TriggerInterface, Trigger, GetTriggersPayload, GetTriggerPayload>
 */
export default class Triggers extends BaseCollection<
    TriggerInterface,
    Trigger,
    GetTriggersPayload,
    GetTriggerPayload
> {
    constructor(uri = '') {
        super(`${uri}/trigger`, Trigger);
    }
}
