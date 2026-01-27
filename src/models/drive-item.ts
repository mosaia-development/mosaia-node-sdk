import { DriveItemInterface } from '../types';
import { BaseModel } from './base';
import { VectorIndexes } from '../collections';
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
     * Get the drive item's vector indexes collection
     * 
     * This getter provides access to the drive item's vector indexes through
     * the VectorIndexes collection. It enables management of all vector indexes
     * associated with this drive item (folder).
     * 
     * **Note**: Vector indexes are typically associated with folders, not individual files.
     * 
     * @returns VectorIndexes collection for managing vector indexes
     * 
     * @example
     * List indexes for a folder:
     * ```typescript
     * const folder = await drive.items.get({}, folderId);
     * const indexes = await folder.indexes.get({ active: true });
     * indexes.forEach(index => {
     *   console.log(`Index: ${index.name}`);
     * });
     * ```
     * 
     * @example
     * Create index for a folder:
     * ```typescript
     * const folder = await drive.items.get({}, folderId);
     * const index = await folder.indexes.create({
     *   name: 'Folder Search Index',
     *   description: 'Index for searching folder contents'
     * });
     * ```
     */
    get indexes(): VectorIndexes {
        if (!this.data.id) {
            throw new Error('Cannot access indexes for unsaved drive item');
        }
        return new VectorIndexes(this.getUri());
    }

    /**
     * Get the access control functionality for this drive item
     * 
     * This getter provides access to the drive item's access control methods through
     * the Access class. It allows for granting and revoking permissions to users,
     * org users, agents, and clients.
     * 
     * **Important**: The available roles depend on whether the item is a directory (folder)
     * or a file:
     * - **Directories** can use: READ_ONLY, VIEWER, EDITOR, CONTRIBUTOR (includes create), MANAGER
     * - **Files** can use: READ_ONLY, VIEWER, EDITOR (no create), MANAGER
     * 
     * @returns An Access instance configured for this drive item
     * 
     * @example
     * Grant access to a directory (folder):
     * ```typescript
     * const directory = await drive.items.get({}, directoryId);
     * 
     * // Directories support all roles including CONTRIBUTOR
     * await directory.access.grantByRole({ org_user: 'orguser123' }, 'CONTRIBUTOR');
     * 
     * // Grant editor role
     * await directory.access.grantByRole({ org_user: 'orguser123' }, 'EDITOR');
     * 
     * // Grant path-based access
     * await directory.access.grantByRole(
     *   { org_user: 'orguser123' },
     *   'EDITOR',
     *   { mode: 'path', folder_role: 'READ_ONLY' }
     * );
     * ```
     * 
     * @example
     * Grant access to a file:
     * ```typescript
     * const file = await drive.items.get({}, fileId);
     * 
     * // Files can use VIEWER, EDITOR, or MANAGER (not CONTRIBUTOR)
     * await file.access.grantByRole({ org_user: 'orguser123' }, 'EDITOR');
     * 
     * // CONTRIBUTOR is not valid for files
     * // await file.access.grantByRole({ org_user: 'orguser123' }, 'CONTRIBUTOR'); // ❌ Invalid
     * ```
     * 
     * @example
     * Revoke access:
     * ```typescript
     * const item = await drive.items.get({}, itemId);
     * 
     * // Revoke all access from a user
     * const result = await item.access.revoke({ org_user: 'orguser123' });
     * console.log(`Revoked ${result.revoked_count} permissions`);
     * 
     * // Revoke all access from a client
     * const result = await item.access.revoke({ client: clientObj });
     * console.log(`Removed ${result.revoked_count} permissions`);
     * ```
     * 
     * @example
     * List all accessors:
     * ```typescript
     * const item = await drive.items.get({}, itemId);
     * 
     * const result = await item.access.list();
     * result.accessors.forEach(accessor => {
     *   console.log(`${accessor.accessor_type} ${accessor.accessor_id} has ${accessor.role} role`);
     * });
     * ```
     */
    get access(): Access {
        if (!this.data.id) {
            throw new Error('Cannot access permissions for unsaved drive item');
        }
        return new Access(`${this.getUri()}/${this.data.id}`);
    }
}

