import {
    TaskInterface,
    GetTasksPayload,
    GetTaskPayload
} from '../types';
import { Task } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Tasks API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing tasks in the Mosaia platform.
 * 
 * @extends BaseCollection<TaskInterface, Task, GetTasksPayload, GetTaskPayload>
 */
export default class Tasks extends BaseCollection<
    TaskInterface,
    Task,
    GetTasksPayload,
    GetTaskPayload
> {
    constructor(uri = '') {
        super(`${uri}/task`, Task);
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

