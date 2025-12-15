import { UploadJobInterface } from '../types';
import { BaseModel } from './base';

/**
 * UploadJob class for tracking individual file uploads
 * 
 * This class represents an individual file upload job in the Mosaia platform.
 * Each UploadJob tracks one file being uploaded to drive via presigned URL.
 * After successful upload, the storage-manager Lambda creates a DriveItem from the UploadJob.
 * 
 * Features:
 * - Individual file upload tracking
 * - Presigned URL management
 * - Automatic quota reservation and reversion
 * - TTL-based cleanup of expired uploads
 * 
 * @remarks
 * Upload workflow:
 * 1. UploadJob created with file metadata → Drive quota reserved
 * 2. Client uploads file using presigned_url
 * 3. Upload triggers event → storage-manager creates DriveItem → UploadJob marked COMPLETED
 * 4. If upload fails → UploadJob marked FAILED → Quota automatically reverted
 * 5. If upload abandoned → TTL cleanup → Quota automatically reverted
 * 
 * @example
 * Basic upload job:
 * ```typescript
 * import { UploadJob } from 'mosaia-node-sdk';
 * 
 * // UploadJob is typically created via Drive.items.uploadFiles()
 * // But can be queried directly:
 * const uploadJob = new UploadJob({
 *   drive: 'drive-id',
 *   filename: 'document.pdf',
 *   size: 1024000,
 *   status: 'PENDING'
 * });
 * ```
 * 
 * @example
 * Check upload status:
 * ```typescript
 * const drive = await mosaia.drives.get({}, 'drive-id');
 * const status = await drive.items.getUploadStatus('upload-job-id');
 * console.log('Status:', status.status);
 * console.log('Expired:', status.is_expired);
 * ```
 * 
 * @example
 * Mark upload as failed:
 * ```typescript
 * await drive.items.markUploadFailed('upload-job-id', {
 *   error: 'upload timeout'
 * });
 * // Quota is automatically reverted
 * ```
 * 
 * @extends BaseModel<UploadJobInterface>
 * @category Models
 */
export default class UploadJob extends BaseModel<UploadJobInterface> {
    /**
     * Creates a new UploadJob instance
     * 
     * Initializes an upload job with the provided metadata and optional URI.
     * The upload job represents a single file being uploaded to a drive.
     * 
     * @param data - Upload job metadata
     * @param uri - Optional URI path for the upload job endpoint. Defaults to '/drive/:driveId/upload'
     * 
     * @example
     * ```typescript
     * const uploadJob = new UploadJob({
     *   drive: 'drive-id',
     *   filename: 'report.pdf',
     *   original_filename: 'report.pdf',
     *   size: 2048000,
     *   mime_type: 'application/pdf',
     *   path: '/documents',
     *   status: 'PENDING',
     *   presigned_url_expires_at: new Date(Date.now() + 300000)
     * });
     * ```
     */
    constructor(data: Partial<UploadJobInterface>, uri?: string) {
        super(data, uri || '/upload');
    }

    /**
     * Get the upload job ID
     */
    get id(): string | undefined {
        return (this.data as any).id;
    }

    /**
     * Get the presigned URL
     */
    get presigned_url(): string | undefined {
        return (this.data as any).presigned_url;
    }

    /**
     * Get the presigned URL expiration date
     */
    get presigned_url_expires_at(): string | Date | undefined {
        return (this.data as any).presigned_url_expires_at;
    }

    /**
     * Get the filename
     */
    get filename(): string {
        return (this.data as any).filename;
    }

    /**
     * Get the MIME type
     */
    get mime_type(): string {
        return (this.data as any).mime_type;
    }

    /**
     * Get the file size
     */
    get size(): number {
        return (this.data as any).size;
    }

    /**
     * Get the file path
     */
    get path(): string | undefined {
        return (this.data as any).path;
    }

    /**
     * Get the upload status
     */
    get status(): string {
        return (this.data as any).status;
    }

    /**
     * Get the failed URL
     */
    get failed_url(): string | undefined {
        return (this.data as any).failed_url;
    }

    /**
     * Get the status URL
     */
    get status_url(): string | undefined {
        return (this.data as any).status_url;
    }

    /**
     * Mark this upload job as failed
     * 
     * Marks the upload as failed and automatically reverts the reserved drive quota.
     * This should be called when the client-side upload fails.
     * Uses the failed_url provided by the API.
     * 
     * @param errorMessage - Error message describing the failure
     * @returns Promise resolving to updated upload job data
     * 
     * @example
     * ```typescript
     * try {
     *   // Upload to failed
     *   await uploadJob.markFailed('Network timeout during upload');
     * } catch (error) {
     *   console.error('Failed to mark upload as failed:', error);
     * }
     * ```
     * 
     * @throws {Error} When API request fails or failed_url not available
     */
    async markFailed(errorMessage?: string): Promise<UploadJobInterface> {
        if (!this.failed_url) {
            throw new Error('Cannot mark upload as failed: failed_url not available');
        }

        // The failed_url from the API already includes /v1/, but the API client
        // prepends the base URL which also includes /v1/. We need to strip the /v1/ prefix
        // if it exists, or use the URL directly if it's an absolute URL.
        let url = this.failed_url;
        
        // If it's a relative URL starting with /v1/, remove the /v1/ prefix
        // The API client will add it back with the base URL
        if (url.startsWith('/v1/')) {
            url = url.substring(3); // Remove '/v1' prefix, keep the leading '/'
        }
        // If it's an absolute URL, use it directly (but this shouldn't happen)
        else if (url.startsWith('http://') || url.startsWith('https://')) {
            // For absolute URLs, we'd need to use fetch directly, but this case shouldn't occur
            // as the API returns relative URLs
        }

        const response = await this.apiClient.POST<any>(
            url,
            { error: errorMessage || 'Upload failed' }
        );

        // Update local instance data with new status
        const updated = response.data || response;
        Object.assign(this.data, updated);
        
        return this.toJSON();
    }

    /**
     * Check if the presigned URL has expired
     * 
     * @returns True if the presigned URL has expired
     * 
     * @example
     * ```typescript
     * if (uploadJob.isExpired()) {
     *   console.log('Presigned URL has expired - cannot upload');
     * }
     * ```
     */
    isExpired(): boolean {
        if (!this.presigned_url_expires_at) return false;
        const expiresAt = typeof this.presigned_url_expires_at === 'string' 
            ? new Date(this.presigned_url_expires_at)
            : this.presigned_url_expires_at;
        return new Date() > expiresAt;
    }

    /**
     * Upload item to drive using upload
     * 
     * Uploads an item to the drive using the presigned URL with all required headers,
     * including the server-side encryption header required by the bucket policy.
     * 
     * @param file - The File or Blob to upload
     * @param options - Optional upload options
     * @param options.onProgress - Optional progress callback that receives upload progress (0-100)
     * @returns Promise that resolves when upload completes successfully
     * 
     * @example
     * ```typescript
     * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     * const file = fileInput.files[0];
     * 
     * const result = await drive.items.uploadFiles([file]);
     * const uploadJob = result.uploadJobs[0];
     * 
     * try {
     *   await uploadJob.upload(file, {
     *     onProgress: (progress) => {
     *       console.log(`Upload progress: ${progress}%`);
     *     }
     *   });
     *   console.log('Upload successful!');
     * } catch (error) {
     *   console.error('Upload failed:', error);
     *   await uploadJob.markFailed(error.message);
     * }
     * ```
     * 
     * @throws {Error} When presigned URL is missing, expired, or upload fails
     */
    async upload(
        file: File | Blob,
        options?: {
            onProgress?: (progress: number) => void;
        }
    ): Promise<void> {
        if (!this.presigned_url) {
            throw new Error('Cannot upload: presigned URL not available');
        }
        if (this.isExpired()) {
            throw new Error('Cannot upload: presigned URL has expired');
        }
        const presignedUrl = this.presigned_url as string;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            if (options?.onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const progress = Math.round((e.loaded / e.total) * 100);
                        options.onProgress!(progress);
                    }
                });
            }

            // Handle successful upload
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            });

            // Handle upload errors
            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed due to network error'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload was aborted'));
            });

            // Configure and send the request
            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', this.mime_type || 'application/octet-stream');
            
            // Note: x-amz-server-side-encryption header is not needed - the bucket has
            // default encryption enabled via BucketEncryption property. All objects
            // will be automatically encrypted with AES256.
            
            xhr.send(file);
        });
    }
}

