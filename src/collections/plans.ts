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

    async batchDelete(
        ids: string[],
        options?: { hardDelete?: boolean }
    ): Promise<{ deleted: string[]; failed: { id: string; error: string }[] }> {
        if (!ids || ids.length === 0) {
            throw new Error('ids must be a non-empty array');
        }

        const body: Record<string, any> = { ids };
        if (options?.hardDelete) {
            body.delete = true;
        }

        const response = await this.apiClient.POST<{
            deleted: string[];
            failed: { id: string; error: string }[];
        }>(`${this.uri}/batch-delete`, body);

        const data = response.data || response;
        return {
            deleted: data.deleted || [],
            failed: data.failed || [],
        };
    }
}

