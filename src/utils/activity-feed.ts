/**
 * @fileoverview Activity feed subscription helper.
 *
 * Wraps the SSE relay's `/v1/activity` endpoint, which streams append-only
 * audit-log rows from the `activities` collection. Each row represents one
 * change to a watched resource (currently agents, drives, drive items,
 * plans, tasks, triggers, vector indexes) that references the
 * authenticated requester's user or org.
 *
 * Supports historical replay via `since`: pass the `id` of the last
 * activity you've already processed and the relay will first emit all
 * newer activities (up to its replay limit) before switching to a live
 * stream — so a client coming back online catches up cleanly with one
 * subscription.
 *
 * @module utils/activity-feed
 */

import {
    subscribeToSSE,
    SSESubscribeHandlers,
    SSESubscription,
} from './sse-client';

/**
 * CRUD verb matching the IAM action vocabulary. The producer normalizes
 * Mongo change-stream operations into this set: `insert` → `create`,
 * `update`/`replace` → `update`, `delete` → `delete`. `read` is absent
 * because change streams only fire on mutations.
 */
export type ActivityOperation = 'create' | 'update' | 'delete';

/**
 * One row from the `activities` collection. Both `user` and `org` may be
 * set when the source document references both.
 */
export interface Activity<TPayload = any> {
    /** Stringified ObjectId of the activity row itself. */
    id: string;
    /** Stringified ObjectId of the owning user, if any. */
    user?: string;
    /** Stringified ObjectId of the owning org, if any. */
    org?: string;
    /** Normalized resource name (e.g. `'drive'`, `'task'`, `'vector_index'`). */
    resource: string;
    /** Stringified ObjectId of the affected source document. */
    resource_id: string;
    /** What kind of change occurred. */
    operation: ActivityOperation;
    /** Snapshot of the source document at the time of the change. */
    payload: TPayload;
    /** Resume-token-derived dedupe key (server-side, usually not needed). */
    event_id?: string;
    /** When the activity row was written. */
    created_at: string;
}

/**
 * Initial connection metadata, delivered as the first `START` event.
 */
export interface ActivityStartInfo {
    feed: 'activity';
    /** `'user:<id>'` or `'org:<id>'` — whichever scope the relay resolved. */
    scope: string;
    /** Echo of the `since` query parameter, if any. */
    since?: string;
    /** Allowlist of collections currently surfaced by the relay. */
    collections: string[];
}

/**
 * Options for {@link subscribeToActivity}.
 */
export interface SubscribeToActivityOptions {
    /**
     * If provided, the relay will first replay all activities owned by the
     * requester with `_id > since` (up to the server's replay limit) before
     * switching to a live change stream. Pass the `id` of the last activity
     * you've already processed.
     */
    since?: string;
}

/**
 * Subscribe to the unified activity feed for the authenticated requester.
 *
 * Opens a single SSE connection to the relay's `/v1/activity` endpoint.
 * The relay scopes events to `requestOrg` if present, otherwise
 * `requestUser`.
 *
 * @example Catch up + stay current
 * ```ts
 * import { subscribeToActivity } from '@mosaia/mosaia-node-sdk';
 *
 * const lastSeenId = localStorage.getItem('activity:lastId') ?? undefined;
 *
 * const sub = subscribeToActivity({
 *   onStart: (info) => console.log('connected', info.collections),
 *   onUpdate: (activity) => {
 *     localStorage.setItem('activity:lastId', activity.id);
 *     reduceActivity(activity);
 *   },
 *   onError: (err) => console.error(err),
 * }, { since: lastSeenId });
 *
 * // Later
 * sub.close();
 * ```
 */
export function subscribeToActivity<TPayload = any>(
    handlers: SSESubscribeHandlers<Activity<TPayload>, ActivityStartInfo>,
    options: SubscribeToActivityOptions = {}
): SSESubscription {
    let path = '/activity';
    if (options.since) {
        path += `?since=${encodeURIComponent(options.since)}`;
    }
    return subscribeToSSE<Activity<TPayload>, ActivityStartInfo>(path, handlers);
}
