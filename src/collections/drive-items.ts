import {
    DriveItemInterface,
    GetDriveItemsPayload,
    GetDriveItemPayload,
    UploadJobInterface
} from '../types';
import { DriveItem, UploadJob } from '../models';
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
     * Upload files to the drive using presigned URLs
     * 
     * Uploads one or more files to the drive using presigned URLs for direct S3 uploads.
     * Each file gets its own UploadJob for independent tracking.
     * This method supports batch file uploads and directory uploads with structure preservation.
     * The backend returns presigned URLs that you can use to upload files directly to S3.
     * 
     * @param files - Array of File objects to upload (required for file uploads)
     * @param options - Optional upload options
     * @param options.path - Base path where files should be uploaded (defaults to '/')
     * @param options.relativePaths - Array of relative paths for directory structure preservation
     * @param options.preserveStructure - Boolean flag to enable/disable structure preservation (default: true if relativePaths provided)
     * @returns Promise resolving to upload information with UploadJob instances
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
     * // Get UploadJob instance for the file
     * const uploadJob = result.uploadJobs[0];
     * console.log('Upload job ID:', uploadJob.id);
     * 
     * // Upload to S3 using presigned_url
     * await fetch(uploadJob.presigned_url, {
     *   method: 'PUT',
     *   body: file,
     *   headers: { 'Content-Type': uploadJob.mime_type }
     * });
     * 
     * // Check if expired
     * if (uploadJob.isExpired()) {
     *   await uploadJob.markFailed('Upload expired');
     * }
     * ```
     * 
     * @example
     * ```typescript
     * // Batch file upload with directory structure
     * const files = Array.from(fileInput.files);
     * const result = await items.uploadFiles(files, {
     *   path: '/uploads',
     *   relativePaths: ['folder1/file1.txt', 'folder2/file2.txt'],
     *   preserveStructure: true
     * });
     * 
     * // Each file can be tracked independently
     * for (const uploadJob of result.uploadJobs) {
     *   console.log(`Uploading ${uploadJob.filename}...`);
     *   await fetch(uploadJob.presigned_url, {
     *     method: 'PUT',
     *     body: files[result.uploadJobs.indexOf(uploadJob)]
     *   });
     * }
     * ```
     * 
     * @throws {Error} When upload fails
     */
    async uploadFiles(
        files: File[], 
        options?: { 
            path?: string;
            relativePaths?: string[] | string;
            preserveStructure?: boolean;
        }
    ): Promise<{
        message: string;
        uploadJobs: UploadJob[];
        instructions: {
            step1: string;
            step2: string;
            step3: string;
        };
    }> {
        try {
            const formData = new FormData();
            
            // Append files if provided
            if (files && files.length > 0) {
                files.forEach(file => {
                    formData.append('files', file);
                });
            }

            // Append path if provided
            if (options?.path) {
                formData.append('path', options.path);
            }

            // Append relativePaths if provided (can be array or JSON string)
            if (options?.relativePaths) {
                if (Array.isArray(options.relativePaths)) {
                    formData.append('relativePaths', JSON.stringify(options.relativePaths));
                } else {
                    formData.append('relativePaths', options.relativePaths);
                }
            }

            // Append preserveStructure flag
            if (options?.preserveStructure !== undefined) {
                formData.append('preserveStructure', options.preserveStructure.toString());
            }

            const response = await this.apiClient.POST<any>(this.uri, formData);
            const data = response.data || response;
            
            // Convert file info to UploadJob instances
            const uploadJobs = (data.files || []).map((fileInfo: any) => {
                // Map snake_case API response to UploadJobInterface
                const uploadJobData: Partial<UploadJobInterface> = {
                    id: fileInfo.upload_job_id,
                    filename: fileInfo.filename,
                    size: fileInfo.size,
                    mime_type: fileInfo.mime_type,
                    path: fileInfo.path,
                    presigned_url: fileInfo.presigned_url,
                    presigned_url_expires_at: fileInfo.expires_at,
                    status: 'PENDING',
                    started_at: new Date().toISOString(),
                    // Store URLs for convenience
                    ...(fileInfo.failed_url && { failed_url: fileInfo.failed_url }),
                    ...(fileInfo.status_url && { status_url: fileInfo.status_url })
                };
                
                return new UploadJob(uploadJobData);
            });
            
            return {
                message: data.message,
                uploadJobs,
                instructions: data.instructions
            };
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }

}

