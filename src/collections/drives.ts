import {
    DriveInterface,
    GetDrivesPayload,
    GetDrivePayload
} from '../types';
import { Drive } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Drives API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing drives in the Mosaia platform.
 * Drives are containers for organizing and managing files and documents,
 * scoped to users or organizations.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve drives with filtering and pagination
 * - Create new drives
 * - Manage drive configurations
 * - Handle drive-specific metadata
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const drives = mosaia.drives;
 * 
 * // Get all drives
 * const allDrives = await drives.get();
 * 
 * // Get a specific drive
 * const drive = await drives.get({}, 'drive-id');
 * 
 * // Create a new drive
 * const newDrive = await drives.create({
 *   name: 'My Documents',
 *   description: 'Personal document storage'
 * });
 * ```
 * 
 * @extends BaseCollection<DriveInterface, Drive, GetDrivesPayload, GetDrivePayload>
 */
export default class Drives extends BaseCollection<
    DriveInterface,
    Drive,
    GetDrivesPayload,
    GetDrivePayload
> {
    /**
     * Creates a new Drives API client instance
     * 
     * Initializes the drives client with the appropriate endpoint URI
     * and model class for handling drive operations.
     * 
     * The constructor sets up the API endpoint to `/drive` (or `${uri}/drive` if a base URI is provided),
     * which corresponds to the Mosaia API's drives endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/drive`.
     *              If not provided, defaults to `/drive`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/drive)
     * const drives = new Drives();
     * 
     * // Create with custom base URI
     * const drives = new Drives('/api/v1');
     * // This will use endpoint: /api/v1/drive
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/drive`, Drive);
    }
}

