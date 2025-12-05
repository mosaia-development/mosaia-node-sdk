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
 * Action type definition for access control
 */
export type AccessAction = 'read' | 'write' | 'delete' | '*';

/**
 * Response type for grant access operation
 */
export interface GrantAccessResponse {
    permission: any;
    drive_id?: string;
    item_id?: string;
    accessor_id: string;
    action: string;
}

/**
 * Response type for revoke access operation
 */
export interface RevokeAccessResponse {
    drive_id?: string;
    item_id?: string;
    accessor_id: string;
    action: string;
    deleted_count: number;
}

/**
 * Access control functions class for managing permissions on drives and drive items
 * 
 * This class provides methods for granting and revoking access to drives and drive items.
 * It handles both user and entity-based access control, supporting Users, OrgUsers, Agents,
 * and Clients as accessors.
 * 
 * The class is typically accessed through the Drive or DriveItem classes rather than
 * instantiated directly.
 * 
 * @example
 * Access through Drive class:
 * ```typescript
 * const drive = await client.drives.get({}, driveId);
 * 
 * // Grant access to a user
 * await drive.access.grant({ user: 'user123' }, 'read');
 * 
 * // Revoke access from an agent
 * await drive.access.revoke({ agent: agentObj }, 'write');
 * ```
 * 
 * @example
 * Access through DriveItem class:
 * ```typescript
 * const item = await drive.items.get({}, itemId);
 * 
 * // Grant full access to an org user
 * await item.access.grant({ org_user: orgUserObj }, '*');
 * 
 * // Revoke specific access from a client
 * const result = await item.access.revoke({ client: 'client456' }, 'delete');
 * console.log(`Removed ${result.deleted_count} permissions`);
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
     * Grant access to a drive or drive item
     * 
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
    ): Promise<GrantAccessResponse> {
        try {
            const normalizedAccessor = this.normalizeAccessor(accessor);
            
            const response = await this.apiClient.POST<GrantAccessResponse>(
                this.uri,
                { accessor: normalizedAccessor, action }
            );

            return response.data || response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Revoke access from a drive or drive item
     * 
     * Removes a permission that was previously granted to the specified accessor
     * for the given action on the resource.
     * 
     * @param accessor - Object specifying which entity to revoke access from
     * @param accessor.user - User ID or User model object
     * @param accessor.org_user - Org user ID or OrgUser model object
     * @param accessor.agent - Agent ID or Agent model object
     * @param accessor.client - Client ID or Client model object
     * @param action - The action to revoke ('read', 'write', 'delete', or '*' for all)
     * @returns Promise resolving to the revocation details including deleted count
     * 
     * @throws {Error} If the API request fails
     * 
     * @example
     * Revoke read access from a user by ID:
     * ```typescript
     * const drive = await client.drives.get({}, driveId);
     * 
     * await drive.access.revoke(
     *   { user: 'user123' },
     *   'read'
     * );
     * ```
     * 
     * @example
     * Revoke all access from an agent using model object:
     * ```typescript
     * const agent = await client.agents.get({}, agentId);
     * const result = await drive.access.revoke(
     *   { agent: agent },
     *   '*'
     * );
     * console.log(`Removed ${result.deleted_count} permissions`);
     * ```
     */
    async revoke(
        accessor: Accessor,
        action: AccessAction
    ): Promise<RevokeAccessResponse> {
        try {
            const normalizedAccessor = this.normalizeAccessor(accessor);
            
            const response = await this.apiClient.DELETE<RevokeAccessResponse>(
                this.uri,
                { accessor: normalizedAccessor, action }
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
