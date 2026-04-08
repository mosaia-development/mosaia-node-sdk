import {
    ActivityInterface,
    ActivityQueryParams,
    BatchAPIResponse,
    GetActivitiesPayload,
    GetActivityPayload
} from '../types';
import { Activity } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Activities API client for the Mosaia SDK.
 *
 * Provides read-only access to the append-only activity audit log. Activities
 * are produced server-side by `recordActivity()` whenever a meaningful
 * mutation lands on a user/org-scoped resource (plans, tasks, triggers,
 * agents, drives, etc.). The platform does NOT expose create / update /
 * delete endpoints for activities — they are immutable from the client's
 * perspective.
 *
 * The api-core route applies a per-resource-type IAM filter, so a caller
 * only sees activity rows whose underlying resource they have read access
 * to. Owner scoping (user OR org) is also enforced server-side.
 *
 * Common use cases:
 *   - Render an activity feed in the UI ("Plan X was updated 5 minutes ago")
 *   - Audit who did what to a given resource
 *   - Replay history alongside the live `/v1/activity` SSE stream
 *
 * Mount points (set via the optional `uri` constructor arg):
 *   - top-level:    `new Activities()`              → `/activity`
 *   - org-scoped:   `new Activities('/org/{id}')`   → `/org/{id}/activity`
 *   - user-scoped:  `new Activities('/user/{id}')`  → `/user/{id}/activity`
 *
 * @example
 * Most recent activities for the authenticated user/org:
 * ```typescript
 * const result = await mosaia.activities.get({ limit: 25 });
 * result.data?.forEach(a => console.log(a.operation, a.resource, a.resource_id));
 * ```
 *
 * @example
 * Filter by resource type:
 * ```typescript
 * const planActivity = await mosaia.activities.get({ resource: 'plan', limit: 50 });
 * ```
 *
 * @example
 * History for one specific resource:
 * ```typescript
 * const history = await mosaia.activities.get({
 *     resource: 'plan',
 *     resource_id: '69d578be8d8fa7c19c7335e3'
 * });
 * ```
 *
 * @example
 * Cursor-style replay (resume from the last seen id):
 * ```typescript
 * const next = await mosaia.activities.get({ since: lastSeenId, limit: 100 });
 * ```
 *
 * @example
 * Fetch a single activity by id:
 * ```typescript
 * const activity = await mosaia.activities.get({}, 'activity-id');
 * ```
 *
 * @extends BaseCollection<ActivityInterface, Activity, GetActivitiesPayload, GetActivityPayload>
 */
export default class Activities extends BaseCollection<
    ActivityInterface,
    Activity,
    GetActivitiesPayload,
    GetActivityPayload
> {
    constructor(uri = '') {
        super(`${uri}/activity`, Activity);
    }

    /** Get a single activity by id. Read-only — no create/update/delete. */
    async get(params: ActivityQueryParams | undefined, id: string): Promise<Activity | null>;
    /** List activities matching the given typed query params. */
    async get(params?: ActivityQueryParams): Promise<BatchAPIResponse<Activity>>;
    async get(
        params?: ActivityQueryParams,
        id?: string
    ): Promise<BatchAPIResponse<Activity> | Activity | null> {
        if (id !== undefined) {
            return super.get(params, id);
        }
        return super.get(params);
    }
}
