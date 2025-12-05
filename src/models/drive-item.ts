import { DriveItemInterface } from '../types';
import { BaseModel } from './base';
import { Access } from '../functions/access';

/**
 * DriveItem class for managing files and documents in drives
 * 
 * This class represents a file or document item within a drive in the Mosaia platform.
 * Drive items contain metadata about files, including their location, size, and type.
 * 
 * Features:
 * - File metadata management
 * - Path and organization
 * - Size and type tracking
 * - URL access
 * 
 * @remarks
 * Drive items represent:
 * - Files stored in drives
 * - Document metadata
 * - File organization and paths
 * - Access URLs
 * 
 * @example
 * Basic drive item:
 * ```typescript
 * import { DriveItem } from 'mosaia-node-sdk';
 * 
 * // Create a drive item
 * const item = new DriveItem({
 *   name: 'document.pdf',
 *   path: '/documents',
 *   size: 1024,
 *   mime_type: 'application/pdf'
 * });
 * 
 * await item.save();
 * ```
 * 
 * @extends BaseModel<DriveItemInterface>
 * @category Models
 */
export default class DriveItem extends BaseModel<DriveItemInterface> {
    /**
     * Creates a new DriveItem instance
     * 
     * Initializes a drive item with the provided metadata and optional URI.
     * The drive item represents a file or document within a drive.
     * 
     * @param data - Drive item metadata
     * @param uri - Optional URI path for the drive item endpoint. Defaults to '/drive/:driveId/item'
     * 
     * @example
     * ```typescript
     * const item = new DriveItem({
     *   name: 'report.pdf',
     *   path: '/reports',
     *   size: 2048,
     *   mime_type: 'application/pdf'
     * });
     * ```
     */
    constructor(data: Partial<DriveItemInterface>, uri?: string) {
        super(data, uri || '/item');
    }

    /**
     * Get the download URL for this file or folder
     * 
     * Returns a URL that can be used to download the file directly or as a ZIP archive if it's a folder.
     * The download is handled by the backend which either redirects to S3 for files
     * or streams a ZIP archive for folders.
     * 
     * @param expiresIn - Number of seconds until the download URL expires (default: 3600 = 1 hour)
     * @returns Promise resolving to the download URL
     * 
     * @throws {Error} If the item is unsaved or if download fails
     * 
     * @example
     * Download a file in the browser:
     * ```typescript
     * const item = await drive.items.get({}, itemId);
     * 
     * // Get download URL and trigger download
     * const url = await item.downloadUrl();
     * window.location.href = url;
     * ```
     * 
     * @example
     * Download with custom expiration:
     * ```typescript
     * // Download URL expires in 2 hours
     * const url = await item.downloadUrl(7200);
     * 
     * // Use with fetch for programmatic download
     * const response = await fetch(url);
     * const blob = await response.blob();
     * ```
     * 
     * @example
     * Download a folder as ZIP:
     * ```typescript
     * const folder = await drive.items.get({}, folderId);
     * const zipUrl = await folder.downloadUrl();
     * // Browser will download the ZIP file
     * window.location.href = zipUrl;
     * ```
     * 
     * @remarks
     * - For files: Returns a URL that redirects to S3 presigned URL
     * - For folders: Returns a URL that streams a ZIP archive
     * - The download URL is authenticated and validates permissions
     */
    async downloadUrl(expiresIn?: number): Promise<string> {
        if (!this.data.id) {
            throw new Error('Cannot get download URL for unsaved drive item');
        }

        // Construct the download URL with optional expiration parameter
        const baseUrl = `${this.getUri()}/download`;
        const params = expiresIn ? `?expires_in=${expiresIn}` : '';
        
        // Return the full download URL
        // The API client's base URL will be prepended automatically when this URL is used
        return `${this.config.apiURL}${baseUrl}${params}`;
    }

    /**
     * Get the access control functionality for this drive item
     * 
     * This getter provides access to the drive item's access control methods through
     * the Access class. It allows for granting and revoking permissions to users,
     * org users, agents, and clients.
     * 
     * @returns An Access instance configured for this drive item
     * 
     * @example
     * Grant access:
     * ```typescript
     * const item = await drive.items.get({}, itemId);
     * 
     * // Grant read access to a user
     * await item.access.grant({ user: 'user123' }, 'read');
     * 
     * // Grant full access to an agent
     * const agent = await client.agents.get({}, agentId);
     * await item.access.grant({ agent: agent }, '*');
     * ```
     * 
     * @example
     * Revoke access:
     * ```typescript
     * // Revoke write access from a user
     * await item.access.revoke({ user: 'user123' }, 'write');
     * 
     * // Revoke all access from an org user
     * const result = await item.access.revoke({ org_user: orgUserObj }, '*');
     * console.log(`Removed ${result.deleted_count} permissions`);
     * ```
     */
    get access(): Access {
        if (!this.data.id) {
            throw new Error('Cannot access permissions for unsaved drive item');
        }
        return new Access(`${this.getUri()}/${this.data.id}`);
    }
}

