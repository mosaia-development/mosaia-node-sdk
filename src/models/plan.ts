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
     * Approve the plan
     *
     * This method approves a plan that is in DRAFT status. The approval process
     * creates tasks from the plan content. The mode parameter determines whether
     * the plan is auto-executed after approval or requires manual review.
     *
     * @param options - Approval options
     * @param options.mode - Approval mode: 'auto_execute' or 'review' (default: 'review')
     * @returns Promise resolving to approval response data
     *
     * @throws {Error} When plan has no ID
     * @throws {Error} When plan is not in DRAFT status
     * @throws {Error} When API request fails
     *
     * @example
     * ```typescript
     * // Approve for review (default)
     * await plan.approve();
     *
     * // Approve with auto-execution
     * await plan.approve({ mode: 'auto_execute' });
     * ```
     */
    async approve(options: { mode?: 'auto_execute' | 'review' } = {}): Promise<{
        message: string;
        plan: string;
        mode: string;
    }> {
        try {
            if (!this.hasId()) {
                throw new Error('Plan ID is required for approval');
            }

            const response = await this.apiClient.POST<{
                message: string;
                plan: string;
                mode: string;
            }>(`${this.uri}/${this.getId()}/approve`, {
                mode: options.mode || 'review'
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Execute the plan
     *
     * This method triggers plan execution for plans that are in APPROVED status.
     * It sends the plan to the execution queue where tasks will be run.
     * Optionally accepts a message that will be passed to the first eligible task.
     *
     * @param options - Execution options
     * @param options.message - Optional message to pass to the first task
     * @returns Promise resolving to the updated plan data
     *
     * @throws {Error} When plan has no ID
     * @throws {Error} When plan is not in APPROVED status
     * @throws {Error} When API request fails
     *
     * @example
     * ```typescript
     * // Execute plan
     * await plan.execute();
     *
     * // Execute with message for first task
     * await plan.execute({
     *     message: { content: 'Use production settings', role: 'user' }
     * });
     * ```
     */
    async execute(options: { message?: { content: string; role: string } } = {}): Promise<any> {
        try {
            if (!this.hasId()) {
                throw new Error('Plan ID is required for execution');
            }

            const response = await this.apiClient.POST<any>(
                `${this.uri}/${this.getId()}/execute`,
                options.message || {}
            );

            // Update local instance with response data
            this.update(response.data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
}

