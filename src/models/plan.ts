import { PlanInterface } from '../types';
import { BaseModel } from './base';
import Tasks from '../collections/tasks';
import Triggers from '../collections/triggers';

/** Options for approving a plan. Plan must be in DRAFT status. */
export interface PlanApproveOptions {
    /** 'auto_execute' to create tasks and start execution; 'review' to create tasks only (default). */
    mode?: 'auto_execute' | 'review';
}

/** Response from the plan approve API (202). */
export interface PlanApproveResponse {
    message: string;
    plan: string;
    mode: string;
}

/** Optional message when executing a plan (e.g. passed to the first eligible task). */
export interface PlanExecuteMessage {
    content: string;
    /** Defaults to 'user' when not provided. */
    role?: string;
}

/**
 * Plan class for managing task plans
 * 
 * This class represents a task plan in the Mosaia platform.
 * 
 * @extends BaseModel<PlanInterface>
 * @category Models
 */
export default class Plan extends BaseModel<PlanInterface> {
    constructor(data: Partial<PlanInterface>, uri?: string) {
        super(data, uri || '/plan');
    }

    /**
     * Get the plan's tasks collection
     * 
     * @returns Tasks collection for managing plan tasks
     */
    get tasks(): Tasks {
        return new Tasks(this.getUri());
    }

    /**
     * Get triggers scoped to this plan (e.g. CRON triggers for this plan).
     */
    get triggers(): Triggers {
        return new Triggers(this.getUri());
    }

    /**
     * Trigger plan execution (sends to plan-task-manager queue).
     * Optional message is passed to the first eligible task when the plan runs.
     *
     * @param message - Optional message, e.g. { content: string, role: 'user' }
     * @returns Promise resolving to the updated plan from the API
     *
     * @example
     * ```typescript
     * const plan = await mosaia.plans.get({}, planId);
     * await plan.execute();
     * ```
     *
     * @example
     * With a message for the first task:
     * ```typescript
     * await plan.execute({ content: 'Use folder X for the destination', role: 'user' });
     * ```
     */
    async execute(message?: PlanExecuteMessage): Promise<PlanInterface> {
        const body = message
            ? { content: message.content, role: message.role ?? 'user' }
            : {};
        const response = await this.apiClient.POST<PlanInterface>(`${this.getUri()}/execute`, body);
        if (!response?.data) {
            throw new Error('Invalid response from execute API');
        }
        this.update(response.data as Partial<PlanInterface>);
        return response.data;
    }

    /**
     * Approve a plan (create tasks, optionally auto-execute).
     * Plan must be in DRAFT status.
     *
     * @param options - Optional { mode: 'auto_execute' | 'review' }; defaults to 'review'
     * @returns Promise resolving to the approve response (message, plan id, mode)
     *
     * @example
     * ```typescript
     * const plan = await mosaia.plans.get({}, planId);
     * await plan.approve();
     * ```
     *
     * @example
     * Auto-execute after approval:
     * ```typescript
     * await plan.approve({ mode: 'auto_execute' });
     * ```
     */
    async approve(options?: PlanApproveOptions): Promise<PlanApproveResponse> {
        const response = await this.apiClient.POST<PlanApproveResponse>(
            `${this.getUri()}/approve`,
            options ?? {}
        );
        if (!response?.data) {
            throw new Error('Invalid response from approve API');
        }
        return response.data as PlanApproveResponse;
    }
}

