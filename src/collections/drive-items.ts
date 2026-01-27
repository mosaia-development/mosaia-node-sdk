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
     * @param options.onProgress - Optional progress callback that receives the UploadJob and progress (0-100) for each file
     * @returns Promise resolving to upload information with UploadJob instances
     * 
     * @example
     * ```typescript
     * // Single file upload
     * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     * const file = fileInput.files[0];
     * 
     * const result = await items.uploadFiles([file], {
     *   path: '/documents',
     *   onProgress: (uploadJob, progress) => {
     *     console.log(`${uploadJob.name}: ${progress}%`);
     *   }
     * });
     * 
     * // Files are automatically uploaded to S3
     * console.log('Upload jobs:', result.uploadJobs);
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
     * for (let i = 0; i < result.uploadJobs.length; i++) {
     *   const uploadJob = result.uploadJobs[i];
     *   const file = files[i];
     *   console.log(`Uploading ${uploadJob.name}...`);
     *   try {
     *     await uploadJob.upload(file, {
     *       onProgress: (progress) => {
     *         console.log(`${uploadJob.name}: ${progress}%`);
     *       }
     *     });
     *   } catch (error) {
     *     console.error(`Failed to upload ${uploadJob.name}:`, error);
     *     await uploadJob.markFailed(error.message);
     *   }
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
            onProgress?: (uploadJob: UploadJob, progress: number) => void;
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
            // Validate files
            if (!files || files.length === 0) {
                throw new Error('No files provided for upload');
            }

            // Filter out invalid files (empty or null)
            console.log('=== SDK uploadFiles: File Validation ===');
            console.log(`Total files received: ${files.length}`);
            console.log('Files received:', files.map((f, idx) => ({
                index: idx,
                name: f?.name || 'NO NAME',
                size: f?.size ?? 'NO SIZE',
                sizeType: typeof f?.size,
                type: f?.type || 'NO TYPE',
                isFile: f instanceof File,
                constructor: f?.constructor?.name,
            })));

            const validFiles = files.filter((file, idx) => {
                if (!file) {
                    console.warn(`SDK: File at index ${idx} is null or undefined`);
                    return false;
                }
                
                // Ensure size is a number and greater than 0
                const size = typeof file.size === 'number' ? file.size : Number(file.size);
                const isValid = !isNaN(size) && size > 0;
                
                if (!isValid) {
                    console.warn(`SDK: Filtering out invalid file at index ${idx}:`, {
                        name: file.name,
                        size: file.size,
                        sizeType: typeof file.size,
                        sizeNumber: size,
                        isNaN: isNaN(size),
                    });
                    return false;
                }
                
                return true;
            });

            console.log(`SDK: Valid files: ${validFiles.length} out of ${files.length}`);
            if (validFiles.length > 0) {
                console.log('SDK: Valid files details:', validFiles.map((f, idx) => ({
                    index: idx,
                    name: f.name,
                    size: f.size,
                    type: f.type,
                })));
            }

            if (validFiles.length === 0) {
                throw new Error('No valid files provided. All files are empty or invalid.');
            }

            const formData = new FormData();
            
            // Append valid files
            console.log('SDK: Appending files to FormData...');
            validFiles.forEach((file, idx) => {
                console.log(`SDK: Appending file ${idx}: ${file.name} (${file.size} bytes)`);
                formData.append('files', file);
            });

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

            console.log('SDK: FormData prepared, sending POST request to:', this.uri);
            console.log('SDK: FormData entries:', {
                hasFiles: validFiles.length > 0,
                filesCount: validFiles.length,
                hasPath: !!options?.path,
                path: options?.path,
                hasRelativePaths: !!options?.relativePaths,
                preserveStructure: options?.preserveStructure,
            });

            const response = await this.apiClient.POST<any>(this.uri, formData);
            
            console.log('SDK: Response received:', {
                hasData: !!response.data,
                hasFiles: !!(response.data || response).files,
                filesCount: (response.data || response).files?.length || 0,
            });
            const data = response.data || response;
            
            // Convert file info to UploadJob instances
            const uploadJobs = (data.files || []).map((fileInfo: any, index: number) => {
                // Map snake_case API response to UploadJobInterface
                const uploadJobData: Partial<UploadJobInterface> = {
                    id: fileInfo.upload_job_id,
                    name: fileInfo.name,
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
            
            // Automatically upload files to drive
            // This is the expected behavior when calling uploadFiles()
            const uploadPromises = uploadJobs.map(async (uploadJob: UploadJob, index: number) => {
                const file = validFiles[index];
                if (!file) {
                    throw new Error(`File not found for upload job ${uploadJob.id}`);
                }
                
                try {
                    const onProgressCallback = options?.onProgress;
                    await uploadJob.upload(file, {
                        onProgress: onProgressCallback 
                            ? (progress: number) => onProgressCallback(uploadJob, progress)
                            : undefined
                    });
                } catch (error: any) {
                    // Mark as failed if upload fails
                    try {
                        await uploadJob.markFailed(error.message || 'Upload failed');
                    } catch (markFailedError) {
                        // Ignore errors when marking as failed
                        console.error('Failed to mark upload as failed:', markFailedError);
                    }
                    throw error;
                }
            });
            
            // Wait for all uploads to complete (or fail)
            await Promise.allSettled(uploadPromises);
            
            return {
                message: data.message,
                uploadJobs,
                instructions: data.instructions
            };
        } catch (error: any) {
            // The API client returns error objects with message, code, and status
            // Preserve all error details
            const errorMessage = error?.message || error?.error?.message || 'Unknown error occurred';
            const errorWithDetails = new Error(String(errorMessage));
            
            // Preserve status code if available
            if (error?.status) {
                (errorWithDetails as any).status = error.status;
            }
            
            // Preserve full error response if available
            if (error?.response) {
                (errorWithDetails as any).response = error.response;
            }
            
            // Preserve error code if available
            if (error?.code) {
                (errorWithDetails as any).code = error.code;
            }
            
            // Preserve full error object for debugging
            if (error && typeof error === 'object') {
                Object.assign(errorWithDetails, error);
            }
            
            throw errorWithDetails;
        }
    }

    /**
     * Find a drive item or directory by URL path
     * 
     * Resolves a URL path to a drive item by traversing the folder hierarchy.
     * If the path resolves to a directory, returns an array of all items within that directory.
     * If the path resolves to a file, returns a single DriveItem.
     * 
     * @param path - URL path like '/documents/report.pdf' or '/folder1/subfolder/file.txt'
     * @param options - Optional options for path resolution
     * @param options.caseSensitive - Whether name matching is case-sensitive (default: true)
     * @returns Promise resolving to DriveItem for files, DriveItem[] for directories, or null if not found
     * 
     * @example
     * Find a file by path:
     * ```typescript
     * const item = await items.findByPath('/documents/report.pdf');
     * if (item) {
     *   console.log('Found file:', item.name);
     * }
     * ```
     * 
     * @example
     * Find a directory (returns array):
     * ```typescript
     * const items = await items.findByPath('/documents');
     * if (Array.isArray(items)) {
     *   console.log(`Directory contains ${items.length} items`);
     *   items.forEach(item => console.log(item.name));
     * }
     * ```
     * 
     * @example
     * Case-insensitive matching:
     * ```typescript
     * const item = await items.findByPath('/Report.PDF', { caseSensitive: false });
     * ```
     * 
     * @throws {Error} When path resolution fails or API error occurs
     */
    async findByPath(
        path: string,
        options?: { caseSensitive?: boolean }
    ): Promise<DriveItem | DriveItem[] | null> {
        try {
            if (!path || path.trim().length === 0) {
                throw new Error('Path is required');
            }

            // Normalize path: remove leading slash if present (API expects path without leading slash)
            const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

            // Build query parameters
            const queryParams: Record<string, string> = {};
            if (options?.caseSensitive !== undefined) {
                queryParams.caseSensitive = options.caseSensitive.toString();
            }

            // The current URI is already /drive/:driveId/item
            // For root path "/", call the root endpoint directly
            // Otherwise, construct: /drive/:driveId/item/{path}
            const baseUri = this.uri.endsWith('/') ? this.uri.slice(0, -1) : this.uri;
            const pathUri = normalizedPath.length === 0 
                ? baseUri  // Root path: /drive/:driveId/item
                : `${baseUri}/${normalizedPath}`;  // Nested path: /drive/:driveId/item/{path}

            // Make GET request to the path endpoint
            const response = await this.apiClient.GET<DriveItemInterface | DriveItemInterface[]>(pathUri, queryParams);
            const data = response.data || response;

            // Handle null/undefined (not found)
            if (data === null || data === undefined) {
                return null;
            }

            // Check if response is an array (directory listing)
            if (Array.isArray(data)) {
                // Return array of DriveItem instances
                return data.map(itemData => new DriveItem(itemData));
            } else {
                // Return single DriveItem instance
                return new DriveItem(data);
            }
        } catch (error: any) {
            // Handle 404 as null (not found)
            if (error.status === 404) {
                return null;
            }
            // Re-throw other errors
            if (error.message) {
                throw new Error(String(error.message));
            }
            throw new Error('Unknown error occurred while resolving path');
        }
    }

}

