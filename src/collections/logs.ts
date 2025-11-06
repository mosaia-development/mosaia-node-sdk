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
}

