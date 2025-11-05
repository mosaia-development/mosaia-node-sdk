import {
    SnapshotInterface,
    GetSnapshotsPayload,
    GetSnapshotPayload
} from '../types';
import { Snapshot } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Snapshots API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing log snapshots in the Mosaia platform.
 * Log snapshots are point-in-time exports of log data, associated with specific logs.
 * 
 * @extends BaseCollection<SnapshotInterface, Snapshot, GetSnapshotsPayload, GetSnapshotPayload>
 */
export default class Snapshots extends BaseCollection<
    SnapshotInterface,
    Snapshot,
    GetSnapshotsPayload,
    GetSnapshotPayload
> {
    constructor(uri = '') {
        super(`${uri}/snapshot`, Snapshot);
    }
}
