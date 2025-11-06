import { TaskInterface, PlanInterface } from '../types';
import { BaseModel } from './base';
import { Plans } from '../collections';

/**
 * Task class for managing tasks
 * 
 * This class represents a task in the Mosaia platform.
 * 
 * @extends BaseModel<TaskInterface>
 * @category Models
 */
export default class Task extends BaseModel<TaskInterface> {
    constructor(data: Partial<TaskInterface>, uri?: string) {
        super(data, uri || '/task');
    }

    /**
     * Get the task's plans collection
     * 
     * @returns Plans collection for managing task plans
     */
    get plans(): Plans {
        return new Plans(this.getUri());
    }
}

