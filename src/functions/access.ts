import { MosaiaConfig } from '../types';
import APIClient from '../utils/api-client';
import { ConfigurationManager } from '../config';
import User from '../models/user';
import OrgUser from '../models/org-user';
import Agent from '../models/agent';
import Client from '../models/client';

/**
 * Accessor type definition for access control operations
 */
export type Accessor = {
    user?: string | User;
    org_user?: string | OrgUser;
    agent?: string | Agent;
    client?: string | Client;
};

/**
 * Action type definition for access control (deprecated - use roles instead)
 * @deprecated Use role-based access with grantByRole instead
 */
export type AccessAction = 'create' | 'read' | 'update' | 'delete' | '*';

/**
 * Role type for drive access control
 */
export type DriveRole = 'READ_ONLY' | 'VIEWER' | 'CONTRIBUTOR' | 'EDITOR' | 'MANAGER';

/**
 * Role type for drive directory (folder) access control
 * Directories can have CONTRIBUTOR role which includes create permission
 */
export type DriveDirectoryRole = 'READ_ONLY' | 'VIEWER' | 'EDITOR' | 'CONTRIBUTOR' | 'MANAGER';

/**
 * Role type for drive file access control
 * Files cannot have CONTRIBUTOR role as they don't support create action
 */
export type DriveFileRole = 'READ_ONLY' | 'VIEWER' | 'EDITOR' | 'MANAGER';

/**
 * Role type for drive item access control (union of directory and file roles)
 * @deprecated Use DriveDirectoryRole or DriveFileRole instead based on item type
 */
export type DriveItemRole = DriveDirectoryRole | DriveFileRole;

/**
 * Grant access options for different modes
 */
export interface GrantAccessOptions {
    /** Cascade permissions to existing items (drive only) */
    cascade_to_items?: boolean;
    /** Cascade permissions only to folders (drive only) */
    cascade_to_folders?: boolean;
    /** Access mode: 'path' for path-based access, 'recursive' for recursive access (items only) */
    mode?: 'path' | 'recursive';
    /** Role for parent folders (path mode only) - directories only */
    folder_role?: DriveDirectoryRole;
    /** Role for nested items (recursive mode only) - can be directory or file role depending on item type */
    item_role?: DriveDirectoryRole | DriveFileRole;
}

/**
 * Permission object in response
 */
export interface PermissionObject {
    id: string;
    active: boolean;
    org?: string;
    user?: string;
    policy: string;
    tags: string[];
    record_history?: {
        created_at?: string;
        created_by?: string;
        created_by_type?: string;
        updated_at?: string;
        updated_by?: string;
        updated_by_type?: string;
    };
}

/**
 * Permission result object
 */
export interface PermissionResult {
    action: string;
    success: boolean;
    permission?: PermissionObject;
    error?: string;
}

/**
 * Response type for grant access operation (role-based)
 */
export interface GrantAccessResponse {
    drive_id?: string;
    item_id?: string;
    accessor_id: string;
    role: string;
    permissions?: PermissionResult[];
    drive_permissions?: PermissionResult[];
    folder_permissions?: Array<{
        folder_id: string;
        folder_name: string;
        level: number;
        permissions: PermissionResult[];
    }>;
    target_permissions?: PermissionResult[];
    cascaded_items?: {
        total: number;
        granted: number;
        failed: number;
        items: Array<{
            item_id: string;
            action: string;
            error: string;
        }>;
    };
    nested_items?: {
        total: number;
        granted: number;
        failed: number;
        items: Array<{
            item_id: string;
    action: string;
            error: string;
        }>;
    };
}

/**
 * Response type for revoke access operation
 */
export interface RevokeAccessResponse {
    drive_id?: string;
    item_id?: string;
    accessor_id: string;
    revoked_count: number;
}

/**
 * Accessor information in list response
 */
export interface AccessorInfo {
    accessor_id: string;
    accessor_type: 'user' | 'org_user' | 'agent' | 'client';
    role: string;
    permissions?: PermissionObject[];
}

/**
 * Response type for listing accessors
 */
export interface ListAccessorsResponse {
    drive_id?: string;
    item_id?: string;
    accessors: AccessorInfo[];
}

/**
 * Response type for grant access operation (legacy action-based)
 * @deprecated Use GrantAccessResponse with grantByRole instead
 */
export interface LegacyGrantAccessResponse {
    permission: any;
    drive_id?: string;
    item_id?: string;
    accessor_id: string;
    action: string;
}

/**
 * Access control functions class for managing permissions on drives and drive items
 * 
 * This class provides methods for granting and revoking access to drives and drive items
 * using role-based access control (RBAC). It handles both user and entity-based access
 * control, supporting Users, OrgUsers, Agents, and Clients as accessors.
 * 
 * The class supports role-based permissions with different roles for different resource types:
 * - **Drive roles**: READ_ONLY, VIEWER, CONTRIBUTOR, EDITOR, MANAGER
 * - **Directory roles**: READ_ONLY, VIEWER, EDITOR, CONTRIBUTOR (includes create), MANAGER
 * - **File roles**: READ_ONLY, VIEWER, EDITOR (no create), MANAGER
 * 
 * Note: CONTRIBUTOR role is only valid for directories (folders), not files, as files don't
 * support the create action. Use DriveDirectoryRole for directories and DriveFileRole for files.
 * 
 * The class also supports various grant modes including cascade, path-based, and recursive access.
 * 
 * The class is typically accessed through the Drive or DriveItem classes rather than
 * instantiated directly.
 * 
 * @example
 * Access through Drive class (role-based):
 * ```typescript
 * const drive = await client.drives.get({}, driveId);
 * 
 * // Grant editor role to an org user
 * await drive.access.grantByRole({ org_user: 'orguser123' }, 'EDITOR');
 * 
 * // Grant manager role with cascade to items
 * await drive.access.grantByRole(
 *   { org_user: 'orguser123' },
 *   'MANAGER',
 *   { cascade_to_items: true }
 * );
 * 
 * // Revoke all access
 * const result = await drive.access.revoke({ org_user: 'orguser123' });
 * console.log(`Revoked ${result.revoked_count} permissions`);
 * 
 * // List all accessors
 * const accessors = await drive.access.list();
 * console.log(`Drive has ${accessors.accessors.length} accessors`);
 * ```
 * 
 * @example
 * Access through DriveItem class (directory):
 * ```typescript
 * const directory = await drive.items.get({}, directoryId);
 * 
 * // Grant editor role to an org user (directories support all roles)
 * await directory.access.grantByRole({ org_user: orgUserObj }, 'EDITOR');
 * 
 * // Grant CONTRIBUTOR role (valid for directories, includes create)
 * await directory.access.grantByRole({ org_user: 'orguser123' }, 'CONTRIBUTOR');
 * 
 * // Grant path-based access
 * await directory.access.grantByRole(
 *   { org_user: 'orguser123' },
 *   'EDITOR',
 *   { mode: 'path', folder_role: 'READ_ONLY' }
 * );
 * 
 * // Revoke all access
 * const result = await directory.access.revoke({ org_user: 'orguser123' });
 * console.log(`Removed ${result.revoked_count} permissions`);
 * ```
 * 
 * @example
 * Access through DriveItem class (file):
 * ```typescript
 * const file = await drive.items.get({}, fileId);
 * 
 * // Grant editor role to an org user (files don't support CONTRIBUTOR)
 * await file.access.grantByRole({ org_user: orgUserObj }, 'EDITOR');
 * 
 * // Files cannot have CONTRIBUTOR role (no create action for files)
 * // await file.access.grantByRole({ org_user: 'orguser123' }, 'CONTRIBUTOR'); // ❌ Invalid
 * 
 * // Revoke all access
 * const result = await file.access.revoke({ org_user: 'orguser123' });
 * console.log(`Removed ${result.revoked_count} permissions`);
 * ```
 * 
 * @category Functions
 */
export class Access {
    protected apiClient: APIClient;
    protected configManager: ConfigurationManager;
    protected uri: string = '';

    /**
     * Creates a new Access instance
     * 
     * @param uri - Base URI for the access endpoint (typically set by Drive or DriveItem)
     * 
     * @example
     * ```typescript
     * // Usually accessed through Drive or DriveItem classes
     * const drive = await client.drives.get({}, driveId);
     * const access = drive.access; // This calls the constructor internally
     * 
     * // Direct instantiation (less common)
     * const access = new Access('/drive/123');
     * ```
     */
    constructor(uri: string = "") {
        this.configManager = ConfigurationManager.getInstance();
        this.apiClient = new APIClient();
        this.uri = `${uri}/access`;
    }

    /**
     * Get the current configuration from the ConfigurationManager
     * 
     * @returns The current MosaiaConfig object
     * @protected
     */
    protected get config(): MosaiaConfig {
        return this.configManager.getConfig();
    }

    /**
     * Normalize accessor to extract IDs from model objects
     * 
     * This internal method converts accessor objects containing either string IDs
     * or model instances into a normalized format with only string IDs.
     * 
     * @param accessor - Accessor object with user, org_user, agent, or client
     * @returns Normalized accessor object with only string IDs
     * @protected
     */
    protected normalizeAccessor(accessor: Accessor): { 
        user?: string; 
        org_user?: string; 
        agent?: string; 
        client?: string 
    } {
        const normalized: { user?: string; org_user?: string; agent?: string; client?: string } = {};
        
        if (accessor.user) {
            normalized.user = typeof accessor.user === 'string' 
                ? accessor.user 
                : (accessor.user as any).id;
        }
        if (accessor.org_user) {
            normalized.org_user = typeof accessor.org_user === 'string' 
                ? accessor.org_user 
                : (accessor.org_user as any).id;
        }
        if (accessor.agent) {
            normalized.agent = typeof accessor.agent === 'string' 
                ? accessor.agent 
                : (accessor.agent as any).id;
        }
        if (accessor.client) {
            normalized.client = typeof accessor.client === 'string' 
                ? accessor.client 
                : (accessor.client as any).id;
        }

        return normalized;
    }

    /**
     * Grant access to a drive or drive item using role-based permissions
     * 
     * Creates permissions that allow the specified accessor to perform
     * actions defined by the role on the resource.
     * 
     * @param accessor - Object specifying which entity to grant access to
     * @param accessor.user - User ID or User model object
     * @param accessor.org_user - Org user ID or OrgUser model object
     * @param accessor.agent - Agent ID or Agent model object
     * @param accessor.client - Client ID or Client model object
     * @param role - The role to grant:
     *   - For drives: READ_ONLY, VIEWER, CONTRIBUTOR, EDITOR, MANAGER
     *   - For directories: READ_ONLY, VIEWER, EDITOR, CONTRIBUTOR (with create), MANAGER
     *   - For files: READ_ONLY, VIEWER, EDITOR (no create), MANAGER
     * @param options - Optional grant options for cascade, path, or recursive modes
     * @returns Promise resolving to the granted permission details
     * 
     * @throws {Error} If the API request fails
     * 
     * @example
     * Grant editor role to an org user:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * 
     * await drive.access.grantByRole(
     *   { org_user: 'orguser123' },
     *   'EDITOR'
     * );
     * ```
     * 
     * @example
     * Grant manager role with cascade to items:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * 
     * await drive.access.grantByRole(
     *   { org_user: 'orguser123' },
     *   'MANAGER',
     *   { cascade_to_items: true }
     * );
     * ```
     * 
     * @example
     * Grant path-based access to a directory:
     * ```typescript
     * const item = await drive.items.get({}, itemId);
     * 
     * await item.access.grantByRole(
     *   { org_user: 'orguser123' },
     *   'EDITOR',
     *   { mode: 'path', folder_role: 'READ_ONLY' }
     * );
     * ```
     * 
     * @example
     * Grant access to a file (cannot use CONTRIBUTOR):
     * ```typescript
     * const file = await drive.items.get({}, fileId);
     * 
     * // Files can only have VIEWER, EDITOR, or MANAGER
     * await file.access.grantByRole(
     *   { org_user: 'orguser123' },
     *   'EDITOR' // CONTRIBUTOR is not valid for files
     * );
     * ```
     * 
     * @example
     * Grant access to a directory (can use CONTRIBUTOR):
     * ```typescript
     * const directory = await drive.items.get({}, directoryId);
     * 
     * // Directories can have CONTRIBUTOR which includes create permission
     * await directory.access.grantByRole(
     *   { org_user: 'orguser123' },
     *   'CONTRIBUTOR' // Valid for directories
     * );
     * ```
     */
    async grantByRole(
        accessor: Accessor,
        role: DriveRole | DriveDirectoryRole | DriveFileRole,
        options?: GrantAccessOptions
    ): Promise<GrantAccessResponse> {
        try {
            const normalizedAccessor = this.normalizeAccessor(accessor);
            
            const response = await this.apiClient.POST<GrantAccessResponse>(
                this.uri,
                { 
                    accessor: normalizedAccessor, 
                    role: role.toUpperCase(),
                    ...(options && { options })
                }
            );

            return response.data || response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Grant access to a drive or drive item (legacy action-based)
     * 
     * @deprecated Use grantByRole instead for role-based access control
     * Creates a permission that allows the specified accessor to perform
     * the given action on the resource.
     * 
     * @param accessor - Object specifying which entity to grant access to
     * @param accessor.user - User ID or User model object
     * @param accessor.org_user - Org user ID or OrgUser model object
     * @param accessor.agent - Agent ID or Agent model object
     * @param accessor.client - Client ID or Client model object
     * @param action - The action to grant ('read', 'write', 'delete', or '*' for all)
     * @returns Promise resolving to the granted permission details
     * 
     * @throws {Error} If the API request fails
     * 
     * @example
     * Grant read access to a user by ID:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * 
     * await drive.access.grant(
     *   { user: 'user123' },
     *   'read'
     * );
     * ```
     * 
     * @example
     * Grant full access to an agent using model object:
     * ```typescript
     * const agent = await client.agents.get({}, agentId);
     * const item = await drive.items.get({}, itemId);
     * 
     * await item.access.grant(
     *   { agent: agent },
     *   '*'
     * );
     * ```
     */
    async grant(
        accessor: Accessor,
        action: AccessAction
    ): Promise<LegacyGrantAccessResponse> {
        try {
            const normalizedAccessor = this.normalizeAccessor(accessor);
            
            const response = await this.apiClient.POST<LegacyGrantAccessResponse>(
                this.uri,
                { accessor: normalizedAccessor, action }
            );

            return response.data || response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Revoke all access from a drive or drive item
     * 
     * Removes all permissions that were previously granted to the specified accessor
     * on the resource. All permissions for the accessor are deactivated.
     * 
     * @param accessor - Object specifying which entity to revoke access from
     * @param accessor.user - User ID or User model object
     * @param accessor.org_user - Org user ID or OrgUser model object
     * @param accessor.agent - Agent ID or Agent model object
     * @param accessor.client - Client ID or Client model object
     * @returns Promise resolving to the revocation details including revoked count
     * 
     * @throws {Error} If the API request fails
     * 
     * @example
     * Revoke all access from a user by ID:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * 
     * const result = await drive.access.revoke(
     *   { org_user: 'orguser123' }
     * );
     * console.log(`Revoked ${result.revoked_count} permissions`);
     * ```
     * 
     * @example
     * Revoke all access from an agent using model object:
     * ```typescript
     * const agent = await client.agents.get({}, agentId);
     * const result = await drive.access.revoke(
     *   { agent: agent }
     * );
     * console.log(`Removed ${result.revoked_count} permissions`);
     * ```
     */
    async revoke(
        accessor: Accessor
    ): Promise<RevokeAccessResponse> {
        try {
            const normalizedAccessor = this.normalizeAccessor(accessor);
            
            const response = await this.apiClient.DELETE<RevokeAccessResponse>(
                this.uri,
                { accessor: normalizedAccessor }
            );

            return response.data || response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * List all accessors and their roles for a drive or drive item
     * 
     * Retrieves all entities that have been granted access to the resource,
     * along with their assigned roles and permission details.
     * 
     * @returns Promise resolving to the list of accessors with their roles
     * 
     * @throws {Error} If the API request fails
     * 
     * @example
     * List all accessors for a drive:
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
     * List all accessors for a drive item:
     * ```typescript
     * const item = await drive.items.get({}, itemId);
     * 
     * const result = await item.access.list();
     * result.accessors.forEach(accessor => {
     *   console.log(`${accessor.accessor_type} ${accessor.accessor_id} has ${accessor.role} role`);
     * });
     * ```
     */
    async list(): Promise<ListAccessorsResponse> {
        try {
            const response = await this.apiClient.GET<ListAccessorsResponse>(
                this.uri
            );

            return response.data || response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors consistently
     * 
     * @param error - The error to handle
     * @returns Standardized Error object
     * @protected
     */
    protected handleError(error: any): Error {
        if ((error as any).message) {
            return error;
        }
        
        if (typeof error === 'object' && error.message) {
            return new Error(error.message);
        }
        
        return new Error('Unknown error occurred');
    }
}
