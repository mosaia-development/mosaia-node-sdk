import {
    UploadJobInterface,
    GetUploadJobsPayload,
    GetUploadJobPayload
} from '../types';
import { UploadJob } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Upload Jobs API client for the Mosaia SDK
 * 
 * Provides operations for managing individual file upload jobs in the Mosaia platform.
 * Each UploadJob tracks a single file being uploaded via presigned URL.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve upload jobs with filtering and pagination
 * - Get individual upload job status
 * - Mark uploads as failed (with automatic quota reversion)
 * 
 * @remarks
 * UploadJobs are typically created automatically via Drive.items.uploadFiles().
 * This collection provides direct access for status checking and management.
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const drive = await mosaia.drives.get({}, 'drive-id');
 * 
 * // Access upload jobs through drive
 * // Note: Upload jobs are accessed via drive.items.getUploadStatus()
 * 
 * // Query upload jobs for a drive
 * const uploadJobs = new UploadJobs(`/drive/${drive.id}`);
 * const pending = await uploadJobs.get({ status: 'PENDING' });
 * ```
 * 
 * @extends BaseCollection<UploadJobInterface, UploadJob, GetUploadJobsPayload, GetUploadJobPayload>
 */
export default class UploadJobs extends BaseCollection<
    UploadJobInterface,
    UploadJob,
    GetUploadJobsPayload,
    GetUploadJobPayload
> {
    /**
     * Creates a new Upload Jobs API client instance
     * 
     * Initializes the upload jobs client with the appropriate endpoint URI
     * and model class for handling upload job operations.
     * 
     * The constructor sets up the API endpoint to `/drive/:driveId/upload` (or `${uri}/upload` if a base URI is provided),
     * which corresponds to the Mosaia API's upload job endpoint.
     * 
     * @param uri - Base URI path. Typically `/drive/:driveId` where `:driveId` is the drive ID.
     *              If not provided, defaults to `/upload`.
     * 
     * @example
     * ```typescript
     * // Create with drive URI
     * const uploadJobs = new UploadJobs('/drive/drive-id-123');
     * 
     * // Get all pending upload jobs
     * const pending = await uploadJobs.get({ status: 'PENDING' });
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/upload`, UploadJob);
    }
}