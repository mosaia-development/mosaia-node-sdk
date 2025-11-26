import {
    PlanInterface,
    GetPlansPayload,
    GetPlanPayload
} from '../types';
import { Plan } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Plans API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing task plans in the Mosaia platform.
 * Task plans are associated with specific tasks.
 * 
 * @extends BaseCollection<PlanInterface, Plan, GetPlansPayload, GetPlanPayload>
 */
export default class Plans extends BaseCollection<
    PlanInterface,
    Plan,
    GetPlansPayload,
    GetPlanPayload
> {
    constructor(uri = '') {
        super(`${uri}/plan`, Plan);
    }
}

