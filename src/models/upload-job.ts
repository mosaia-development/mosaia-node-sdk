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

        const response = await this.apiClient.POST<any>(
            this.failed_url,
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
}

