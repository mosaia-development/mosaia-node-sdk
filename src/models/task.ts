import { TaskInterface, PlanInterface } from '../types';
import { BaseModel } from './base';
import { Plans, Triggers } from '../collections';

/** Optional message when executing a task (e.g. user review response when task was in REVIEW). */
export interface TaskExecuteMessage {
    content: string;
    /** Defaults to 'user' when not provided. */
    role?: string;
}

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
     * Get triggers scoped to this task (e.g. CRON triggers for this task).
     */
    get triggers(): Triggers {
        return new Triggers(this.getUri());
    }

    /**
     * Trigger task execution (sends to plan-task-manager queue).
     * Task must be in PENDING or REVIEW status.
     *
     * @param message - Optional message, e.g. { content: string, role: 'user' } for review response
     * @returns Promise resolving to the updated task from the API
     *
     * @example
     * ```typescript
     * const task = await mosaia.tasks.get({}, taskId);
     * await task.execute();
     * ```
     *
     * @example
     * With a user message (e.g. after REVIEW):
     * ```typescript
     * await task.execute({ content: 'Approved with changes', role: 'user' });
     * ```
     */
    async execute(message?: TaskExecuteMessage): Promise<TaskInterface> {
        const body = message
            ? { content: message.content, role: message.role ?? 'user' }
            : {};
        const response = await this.apiClient.POST<TaskInterface>(`${this.getUri()}/execute`, body);
        if (!response?.data) {
            throw new Error('Invalid response from execute API');
        }
        this.update(response.data as Partial<TaskInterface>);
        return response.data;
    }

    /**
     * Interrupt a running task. Sets the AgentLog to STANDBY (stops the
     * agent loop) and the task status to REVIEW so the user can provide feedback.
     *
     * @returns Promise resolving to the updated task from the API
     *
     * @example
     * ```typescript
     * const task = await mosaia.tasks.get({}, taskId);
     * await task.interrupt();
     * // task.status === 'REVIEW'
     * ```
     */
    async interrupt(): Promise<TaskInterface> {
        const response = await this.apiClient.POST<TaskInterface>(`${this.getUri()}/interrupt`, {});
        if (!response?.data) {
            throw new Error('Invalid response from interrupt API');
        }
        this.update(response.data as Partial<TaskInterface>);
        return response.data;
    }
}

