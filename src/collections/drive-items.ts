import {
    DriveItemInterface,
    GetDriveItemsPayload,
    GetDriveItemPayload
} from '../types';
import { DriveItem } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Drive Items API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing drive items (files and documents) in the Mosaia platform.
 * Drive items are files and documents stored within drives.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve drive items with filtering and pagination
 * - Create new drive items (metadata-only or with file uploads)
 * - Update drive item metadata
 * - Delete drive items
 * - Handle file uploads
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const drive = await mosaia.drives.get({}, 'drive-id');
 * const items = drive.items;
 * 
 * // Get all items in the drive
 * const allItems = await items.get();
 * 
 * // Get a specific item
 * const item = await items.get({}, 'item-id');
 * 
 * // Create a metadata-only item
 * const newItem = await items.create({
 *   name: 'document.pdf',
 *   path: '/documents',
 *   size: 1024
 * });
 * ```
 * 
 * @extends BaseCollection<DriveItemInterface, DriveItem, GetDriveItemsPayload, GetDriveItemPayload>
 */
export default class DriveItems extends BaseCollection<
    DriveItemInterface,
    DriveItem,
    GetDriveItemsPayload,
    GetDriveItemPayload
> {
    /**
     * Creates a new Drive Items API client instance
     * 
     * Initializes the drive items client with the appropriate endpoint URI
     * and model class for handling drive item operations.
     * 
     * The constructor sets up the API endpoint to `/drive/:driveId/item` (or `${uri}/drive/:driveId/item` if a base URI is provided),
     * which corresponds to the Mosaia API's drive items endpoint.
     * 
     * @param uri - Base URI path. Typically `/drive/:driveId` where `:driveId` is the drive ID.
     *              If not provided, defaults to `/drive/item`.
     * 
     * @example
     * ```typescript
     * // Create with drive URI
     * const items = new DriveItems('/drive/drive-id-123');
     * 
     * // Create via drive model instance
     * const drive = await mosaia.drives.get({}, 'drive-id');
     * const items = drive.items; // Uses drive.getUri() internally
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/item`, DriveItem);
    }

    /**
     * Upload files to the drive
     * 
     * Uploads one or more files to the drive. This method supports both
     * single file and batch file uploads. For large files (>100MB), files
     * are processed asynchronously via multipart upload.
     * 
     * @param files - Array of File objects to upload
     * @param options - Optional upload options
     * @param options.path - Optional path within the drive (defaults to '/')
     * @returns Promise resolving to upload job information
     * 
     * @example
     * ```typescript
     * // Single file upload
     * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     * const file = fileInput.files[0];
     * 
     * const result = await items.uploadFiles([file], {
     *   path: '/documents'
     * });
     * 
     * console.log('Upload job ID:', result.jobId);
     * ```
     * 
     * @example
     * ```typescript
     * // Batch file upload
     * const files = Array.from(fileInput.files);
     * const result = await items.uploadFiles(files, {
     *   path: '/uploads'
     * });
     * ```
     * 
     * @throws {Error} When upload fails or no files provided
     */
    async uploadFiles(files: File[], options?: { path?: string }): Promise<{ jobId: string; message: string; statusUrl?: string }> {
        try {
            if (!files || files.length === 0) {
                throw new Error('At least one file is required for upload');
            }

            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });
            
            if (options?.path) {
                formData.append('path', options.path);
            }

            const response = await this.apiClient.POST<any>(this.uri, formData);
            return response.data || response as any;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Upload a single file to the drive
     * 
     * Convenience method for uploading a single file. For large files (>100MB),
     * the upload is processed asynchronously via multipart upload.
     * 
     * @param file - File object to upload
     * @param options - Optional upload options
     * @param options.path - Optional path within the drive (defaults to '/')
     * @returns Promise resolving to upload job information
     * 
     * @example
     * ```typescript
     * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     * const file = fileInput.files[0];
     * 
     * const result = await items.uploadFile(file, {
     *   path: '/documents'
     * });
     * 
     * console.log('Upload job ID:', result.jobId);
     * console.log('Status URL:', result.statusUrl);
     * ```
     * 
     * @throws {Error} When upload fails
     */
    async uploadFile(file: File, options?: { path?: string }): Promise<{ jobId: string; message: string; statusUrl?: string }> {
        return this.uploadFiles([file], options);
    }

    /**
     * Get upload job status
     * 
     * Retrieves the status of an asynchronous file upload job.
     * 
     * @param jobId - The upload job ID returned from uploadFile or uploadFiles
     * @returns Promise resolving to upload job status information
     * 
     * @example
     * ```typescript
     * const result = await items.uploadFile(file);
     * 
     * // Check upload status
     * const status = await items.getUploadStatus(result.jobId);
     * console.log('Upload progress:', status.progress.percentage + '%');
     * console.log('Status:', status.status);
     * ```
     * 
     * @throws {Error} When job not found or API request fails
     */
    async getUploadStatus(jobId: string): Promise<{
        jobId: string;
        status: string;
        progress: {
            total: number;
            processed: number;
            successful: number;
            failed: number;
            percentage: number;
        };
        size: {
            total: number;
            uploaded: number;
            percentage: number;
        };
        files: any[];
        startedAt?: Date;
        completedAt?: Date;
        errorSummary?: any;
    }> {
        try {
            const response = await this.apiClient.GET<any>(`${this.uri}/upload/${jobId}`);
            return response.data || response as any;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
}

