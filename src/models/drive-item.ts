import { DriveItemInterface } from '../types';
import { BaseModel } from './base';

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
}

