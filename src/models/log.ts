import { AgentLogInterface } from '../types';
import { BaseModel } from './base';
import { Messages, Snapshots } from '../collections';

/**
 * Log class for managing agent logs
 * 
 * This class represents an agent log in the Mosaia platform.
 * 
 * @extends BaseModel<AgentLogInterface>
 * @category Models
 */
export default class Log extends BaseModel<AgentLogInterface> {
    constructor(data: Partial<AgentLogInterface>, uri?: string) {
        super(data, uri || '/log');
    }

    /**
     * Get the log's messages collection
     * 
     * @returns Messages collection for managing log messages
     */
    get messages(): Messages {
        return new Messages(this.getUri());
    }

    /**
     * Get the log's snapshots collection
     * 
     * @returns Snapshots collection for managing log snapshots
     */
    get snapshots(): Snapshots {
        return new Snapshots(this.getUri());
    }
}

