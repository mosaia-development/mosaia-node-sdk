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
}

