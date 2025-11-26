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
     * Upload files to the drive using presigned URLs
     * 
     * Uploads one or more files to the drive using presigned URLs for direct S3 uploads.
     * This method supports batch file uploads and directory uploads with structure preservation.
     * The backend returns presigned URLs that you can use to upload files directly to S3.
     * 
     * @param files - Array of File objects to upload (required for file uploads)
     * @param options - Optional upload options
     * @param options.path - Base path where files should be uploaded (defaults to '/')
     * @param options.relativePaths - Array of relative paths for directory structure preservation
     * @param options.preserveStructure - Boolean flag to enable/disable structure preservation (default: true if relativePaths provided)
     * @returns Promise resolving to upload job information with presigned URLs
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
     * console.log('Upload job ID:', result.uploadJob.id);
     * // Upload each file to S3 using presignedUrl
     * for (const fileInfo of result.files) {
     *   await fetch(fileInfo.presignedUrl, {
     *     method: 'PUT',
     *     body: file
     *   });
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
        uploadJob: {
            id: string;
            status: string;
            total_files: number;
            total_size: number;
            started_at: Date;
        };
        files: Array<{
            fileId: string;
            filename: string;
            presignedUrl: string;
            mimeType: string;
            size: number;
            path: string;
            expiresIn: number;
            expiresAt: Date;
            failedUrl: string;
        }>;
        statusUrl: string;
        instructions: {
            step1: string;
            step2: string;
            step3: string;
            step4: string;
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
     * Convenience method for uploading a single file using presigned URLs for direct S3 upload.
     * 
     * @param file - File object to upload
     * @param options - Optional upload options
     * @param options.path - Optional path within the drive (defaults to '/')
     * @param options.relativePath - Optional relative path for the file
     * @param options.preserveStructure - Boolean flag to enable/disable structure preservation
     * @returns Promise resolving to upload job information with presigned URL
     * 
     * @example
     * ```typescript
     * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     * const file = fileInput.files[0];
     * 
     * const result = await items.uploadFile(file, {
     *   path: '/documents',
     *   relativePath: 'folder/file.txt'
     * });
     * 
     * console.log('Upload job ID:', result.uploadJob.id);
     * // Upload file to S3 using presignedUrl
     * const fileInfo = result.files[0];
     * await fetch(fileInfo.presignedUrl, {
     *   method: 'PUT',
     *   body: file
     * });
     * ```
     * 
     * @throws {Error} When upload fails
     */
    async uploadFile(
        file: File, 
        options?: { 
            path?: string;
            relativePath?: string;
            preserveStructure?: boolean;
        }
    ): Promise<{
        message: string;
        uploadJob: {
            id: string;
            status: string;
            total_files: number;
            total_size: number;
            started_at: Date;
        };
        files: Array<{
            fileId: string;
            filename: string;
            presignedUrl: string;
            mimeType: string;
            size: number;
            path: string;
            expiresIn: number;
            expiresAt: Date;
            failedUrl: string;
        }>;
        statusUrl: string;
        instructions: {
            step1: string;
            step2: string;
            step3: string;
            step4: string;
        };
    }> {
        return this.uploadFiles([file], {
            ...options,
            relativePaths: options?.relativePath ? [options.relativePath] : undefined
        });
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
     * const status = await items.getUploadStatus(result.uploadJob.id);
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

    /**
     * Mark a file upload as failed
     * 
     * Marks a file upload as failed if the client-side upload to S3 fails.
     * This method should be called if the upload to the presigned URL fails.
     * 
     * @param fileId - The file ID of the upload to mark as failed
     * @param error - Optional error message or object describing the failure
     * @returns Promise resolving to the file status after marking as failed
     * 
     * @example
     * ```typescript
     * try {
     *   const result = await items.uploadFile(file);
     *   const fileInfo = result.files[0];
     *   
     *   // Try to upload to S3
     *   const uploadResponse = await fetch(fileInfo.presignedUrl, {
     *     method: 'PUT',
     *     body: file
     *   });
     *   
     *   if (!uploadResponse.ok) {
     *     // Mark as failed if S3 upload fails
     *     await items.markUploadFailed(fileInfo.fileId, {
     *       error: `Upload failed: ${uploadResponse.statusText}`
     *     });
     *   }
     * } catch (error) {
     *   // Mark as failed if there's an exception
     *   await items.markUploadFailed(fileInfo.fileId, {
     *     error: error.message
     *   });
     * }
     * ```
     * 
     * @throws {Error} When file not found or API request fails
     */
    async markUploadFailed(
        fileId: string, 
        error?: { error?: string; errorMessage?: string }
    ): Promise<{
        fileId: string;
        status: string;
        upload_status: string;
        upload_error?: string;
    }> {
        try {
            if (!fileId) {
                throw new Error('File ID is required');
            }

            const response = await this.apiClient.POST<any>(
                `${this.uri}/${fileId}/failed`,
                error || { error: 'Upload failed' }
            );
            return response.data || response as any;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
}

