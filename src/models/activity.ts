import { ActivityInterface } from '../types';
import { BaseModel } from './base';

/**
 * Activity model.
 *
 * Represents a single append-only audit row recording a meaningful change to
 * a user/org-scoped resource on the Mosaia platform. Activity rows are
 * produced by the SSE relay's activity-bus producer (which tails a single
 * cluster-wide change stream and writes one row per qualifying mutation) and
 * consumed by the `/v1/activity` REST + SSE endpoints.
 *
 * Each activity carries a snapshot of the source document at the time of the
 * change in `payload`, so consumers don't need to re-fetch the source. The
 * snapshot is denormalized on purpose — it will *not* be kept in sync with
 * later edits to the source document.
 *
 * Activities are read-only from the client's perspective; the platform does
 * not expose create/update/delete endpoints for the activities collection.
 *
 * @extends BaseModel<ActivityInterface>
 * @category Models
 *
 * @example
 * ```typescript
 * const activities = await mosaia.activities.get({ resource: 'plan', limit: 20 });
 * for (const activity of activities.data ?? []) {
 *     console.log(`${activity.operation} ${activity.resource} ${activity.resource_id}`);
 * }
 * ```
 */
export default class Activity extends BaseModel<ActivityInterface> {
    constructor(data: Partial<ActivityInterface>, uri?: string) {
        super(data, uri || '/activity');
    }
}
