import { DriveInterface, DriveItemInterface } from '../types';
import { BaseModel } from './base';
import { DriveItems, UploadJobs, VectorIndexes } from '../collections';
import { Access } from '../functions/access';
import DriveItem from './drive-item';

/**
 * Drive class for managing file storage drives
 * 
 * This class represents a drive in the Mosaia platform, which is a container
 * for organizing and managing files and documents. Drives can be scoped to
 * users or organizations.
 * 
 * Features:
 * - Drive configuration management
 * - File and document organization
 * - Access control
 * - Metadata management
 * 
 * @remarks
 * Drives provide:
 * - File storage organization
 * - User/org-scoped storage
 * - File metadata management
 * - Access control
 * 
 * @example
 * Basic drive setup:
 * ```typescript
 * import { Drive } from 'mosaia-node-sdk';
 * 
 * // Create a new drive
 * const drive = new Drive({
 *   name: 'My Documents',
 *   description: 'Personal document storage'
 * });
 * 
 * await drive.save();
 * ```
 * 
 * @example
 * Managing drive items:
 * ```typescript
 * // Get all items in the drive
 * const items = await drive.items.get();
 * 
 * // Create a new item (metadata-only)
 * const item = await drive.items.create({
 *   name: 'document.pdf',
 *   path: '/documents'
 * });
 * ```
 * 
 * @extends BaseModel<DriveInterface>
 * @category Models
 */
export default class Drive extends BaseModel<DriveInterface> {
    /**
     * Creates a new Drive instance
     * 
     * Initializes a drive with the provided configuration data and optional URI.
     * The drive represents a container for organizing files and documents.
     * 
     * @param data - Drive configuration data
     * @param uri - Optional URI path for the drive endpoint. Defaults to '/drive'
     * 
     * @example
     * ```typescript
     * const drive = new Drive({
     *   name: 'Project Files',
     *   description: 'Storage for project documents'
     * });
     * ```
     */
    constructor(data: Partial<DriveInterface>, uri?: string) {
        super(data, uri || '/drive');
    }

    /**
     * Get the drive's items collection
     * 
     * This getter provides access to the drive's items through
     * the DriveItems collection. It enables management of all files
     * and documents within the drive.
     * 
     * @returns DriveItems collection for managing drive items
     * 
     * @example
     * List items:
     * ```typescript
     * const items = await drive.items.get();
     * items.forEach(item => {
     *   console.log(`Item: ${item.name}`);
     * });
     * ```
     * 
     * @example
     * Create item:
     * ```typescript
     * const item = await drive.items.create({
     *   name: 'document.pdf',
     *   path: '/documents',
     *   size: 1024
     * });
     * ```
     */
    get items(): DriveItems {
        return new DriveItems(this.getUri());
    }

    /**
     * Get the drive's upload jobs collection
     * 
     * This getter provides access to the drive's upload jobs through
     * the UploadJobs collection. It enables management of all upload jobs
     * for the drive.
     */
    get uploads(): UploadJobs {
        return new UploadJobs(this.getUri());
    }

    /**
     * Get the drive's vector indexes collection
     * 
     * This getter provides access to the drive's vector indexes through
     * the VectorIndexes collection. It enables management of all vector indexes
     * associated with this drive.
     * 
     * @returns VectorIndexes collection for managing vector indexes
     * 
     * @example
     * List indexes:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * const indexes = await drive.indexes.get({ active: true });
     * indexes.forEach(index => {
     *   console.log(`Index: ${index.name}`);
     * });
     * ```
     * 
     * @example
     * Create index:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * const index = await drive.indexes.create({
     *   name: 'Document Search Index',
     *   description: 'Index for searching documents'
     * });
     * ```
     */
    get indexes(): VectorIndexes {
        return new VectorIndexes(this.getUri());
    }

    /**
     * Get the access control functionality for this drive
     * 
     * This getter provides access to the drive's access control methods through
     * the Access class. It allows for granting and revoking permissions to users,
     * org users, agents, and clients.
     * 
     * **Available roles for drives**: READ_ONLY, VIEWER, CONTRIBUTOR, EDITOR, MANAGER
     * 
     * @returns An Access instance configured for this drive
     * 
     * @example
     * Grant access with different roles:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * 
     * // Grant viewer role (read-only)
     * await drive.access.grantByRole({ org_user: 'orguser123' }, 'VIEWER');
     * 
     * // Grant editor role (read, create, update)
     * await drive.access.grantByRole({ org_user: 'orguser123' }, 'EDITOR');
     * 
     * // Grant manager role (full access)
     * await drive.access.grantByRole({ org_user: 'orguser123' }, 'MANAGER');
     * ```
     * 
     * @example
     * Grant access with cascade to items:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * 
     * // Grant manager role and cascade to all items
     * await drive.access.grantByRole(
     *   { org_user: 'orguser123' },
     *   'MANAGER',
     *   { cascade_to_items: true }
     * );
     * 
     * // Cascade only to folders
     * await drive.access.grantByRole(
     *   { org_user: 'orguser123' },
     *   'EDITOR',
     *   { cascade_to_folders: true }
     * );
     * ```
     * 
     * @example
     * List all accessors:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * 
     * const result = await drive.access.list();
     * console.log(`Drive has ${result.accessors.length} accessors`);
     * 
     * result.accessors.forEach(accessor => {
     *   console.log(`${accessor.accessor_type}: ${accessor.accessor_id} - ${accessor.role}`);
     * });
     * ```
     * 
     * @example
     * Revoke access:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * 
     * // Revoke all access from a user
     * const result = await drive.access.revoke({ org_user: 'orguser123' });
     * console.log(`Revoked ${result.revoked_count} permissions`);
     * 
     * // Revoke all access from an agent
     * const agent = await client.agents.get({}, agentId);
     * const result = await drive.access.revoke({ agent: agent });
     * console.log(`Removed ${result.revoked_count} permissions`);
     * ```
     */
    get access(): Access {
        return new Access(this.getUri());
    }

    /**
     * Find a drive item or directory by URL path within this drive
     * 
     * Convenience method that wraps DriveItems.findByPath() for this drive instance.
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
     * const drive = await client.drives.get({}, driveId);
     * const item = await drive.findItemByPath('/documents/report.pdf');
     * if (item) {
     *   console.log('Found file:', item.name);
     * }
     * ```
     * 
     * @example
     * Find a directory (returns array):
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * const items = await drive.findItemByPath('/documents');
     * if (Array.isArray(items)) {
     *   console.log(`Directory contains ${items.length} items`);
     *   items.forEach(item => console.log(item.name));
     * }
     * ```
     * 
     * @example
     * Case-insensitive matching:
     * ```typescript
     * const item = await drive.findItemByPath('/Report.PDF', { caseSensitive: false });
     * ```
     * 
     * @throws {Error} When path resolution fails or API error occurs
     */
    async findItemByPath(
        path: string,
        options?: { caseSensitive?: boolean }
    ): Promise<DriveItem | DriveItem[] | null> {
        if (!this.data.id) {
            throw new Error('Cannot find item by path for unsaved drive');
        }
        return await this.items.findByPath(path, options);
    }
}

