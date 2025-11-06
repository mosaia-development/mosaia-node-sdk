import { SnapshotInterface } from '../types';
import { BaseModel } from './base';

/**
 * Snapshot class for managing snapshots
 * 
 * This class represents a snapshot in the Mosaia platform, which is a
 * point-in-time capture of data (e.g., agent log exports).
 * 
 * @extends BaseModel<SnapshotInterface>
 * @category Models
 */
export default class Snapshot extends BaseModel<SnapshotInterface> {
    constructor(data: Partial<SnapshotInterface>, uri?: string) {
        super(data, uri || '/snapshot');
    }
}

