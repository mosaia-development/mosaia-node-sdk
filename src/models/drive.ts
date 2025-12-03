import { DriveInterface, DriveItemInterface } from '../types';
import { BaseModel } from './base';
import { DriveItems, UploadJobs } from '../collections';

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
}

