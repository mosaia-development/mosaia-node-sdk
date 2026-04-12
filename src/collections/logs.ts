import {
    AgentLogInterface,
    GetLogsPayload,
    GetLogPayload
} from '../types';
import { Log } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Logs API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing agent logs in the Mosaia platform.
 * Logs track conversations and interactions with agents.
 * 
 * @extends BaseCollection<AgentLogInterface, Log, GetLogsPayload, GetLogPayload>
 */
export default class Logs extends BaseCollection<
    AgentLogInterface,
    Log,
    GetLogsPayload,
    GetLogPayload
> {
    constructor(uri = '') {
        super(`${uri}/log`, Log);
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

