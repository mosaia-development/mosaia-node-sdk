/**
 * Models module exports for the Mosaia SDK
 * 
 * This module exports all the model classes that represent entities in the Mosaia platform.
 * Each model provides data management, validation, and API integration capabilities
 * for their respective entity types.
 * 
 * ## Available Models
 * 
 * - **AppConnector**: Application connector management
 * - **AppWebhook**: Application webhook configuration management
 * - **BaseModel**: Abstract base class providing common functionality for all models
 * - **User**: User account and profile management
 * - **App**: Application container and configuration management
 * - **Self**: Current authenticated entity information
 * - **Agent**: AI agent configuration and operations
 * - **Organization**: Organization structure and settings
 * - **OrgUser**: User-organization relationship management
 * - **AgentGroup**: AI agent collection and coordination
 * - **Tool**: External integration and utility management
 * - **Client**: OAuth client application management
 * - **Model**: AI model configuration and operations
 * 
 * @example
 * ```typescript
 * import { User, Agent, Organization, Tool, AppConnector, AppWebhook } from './models';
 * 
 * // Create model instances
 * const user = new User({
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * 
 * const appConnector = new AppConnector({
 *   app: 'app-123',
 *   response_url: 'https://api.example.com/webhook',
 *   agent: 'agent-456',
 *   api_key: 'connector-api-key',
 *   client: 'client-123',
 *   response_hook: 'response-hook-456'
 * });
 * 
 * const agent = new Agent({
 *   name: 'Support Agent',
 *   model: 'gpt-4'
 * });
 * 
 * const organization = new Organization({
 *   name: 'Acme Corp',
 *   short_description: 'Technology company'
 * });
 * ```
 */

import { BaseModel } from './base';
import Agent from './agent';
import App from './app';
import Session from './session';
import User from './user';
import Organization from './organization';
import OrgUser from './org-user';
import AgentGroup from './agent-group';
import Tool from './tool';
import Client from './client';
import Model from './model';
import AppConnector from './app-connector';
import AppWebhook from './app-webhook';
import Drive from './drive';
import DriveItem from './drive-item';
import UploadJob from './upload-job';
import Log from './log';
import Message from './message';
import Snapshot from './snapshot';
import VectorIndex from './vector-index';
import Task from './task';
import Plan from './plan';
import AccessPolicy from './access-policy';
import OrgPermission from './org-permission';
import UserPermission from './user-permission';
import Meter from './meter';
import Wallet from './wallet';

/**
 * Base model class providing common functionality for all models
 * @see {@link BaseModel}
 */
export { BaseModel };

/**
 * User model for managing user accounts and profiles
 * @see {@link User}
 */
export { User };

/**
 * Application model for managing application containers
 * @see {@link App}
 */
export { App };

/**
 * Session model for managing current authenticated entity information
 * @see {@link Session}
 */
export { Session };

/**
 * Agent model for managing AI agent configurations and operations
 * @see {@link Agent}
 */
export { Agent };

/**
 * Organization model for managing organizational structures
 * @see {@link Organization}
 */
export { Organization };

/**
 * Organization User model for managing user-organization relationships
 * @see {@link OrgUser}
 */
export { OrgUser };

/**
 * App Connector model for managing application-connector integrations
 * @see {@link AppConnector}
 */
export { AppConnector };

/**
 * App Webhook model for managing application webhook configurations
 * @see {@link AppWebhook}
 */
export { AppWebhook };

/**
 * Agent Group model for managing AI agent collections
 * @see {@link AgentGroup}
 */
export { AgentGroup };

/**
 * Tool model for managing external integrations and utilities
 * @see {@link Tool}
 */
export { Tool };

/**
 * Client model for managing OAuth client applications
 * @see {@link Client}
 */
export { Client };

/**
 * Model class for managing AI model configurations and operations
 * @see {@link Model}
 */
export { Model };

/**
 * Drive model for managing file storage drives
 * @see {@link Drive}
 */
export { Drive };

/**
 * DriveItem model for managing files and documents in drives
 * @see {@link DriveItem}
 */
export { DriveItem };

/**
 * UploadJob model for tracking individual file uploads
 * @see {@link UploadJob}
 */
export { UploadJob };

/**
 * Log model for managing agent logs
 * @see {@link Log}
 */
export { Log };

/**
 * Message model for managing log messages
 * @see {@link Message}
 */
export { Message };

/**
 * Snapshot model for managing snapshots
 * @see {@link Snapshot}
 */
export { Snapshot };

/**
 * VectorIndex model for managing vector indexes
 * @see {@link VectorIndex}
 */
export { VectorIndex };

/**
 * Task model for managing tasks
 * @see {@link Task}
 */
export { Task };

/**
 * Plan model for managing task plans
 * @see {@link Plan}
 */
export { Plan };

/**
 * AccessPolicy model for managing IAM access control policies
 * @see {@link AccessPolicy}
 */
export { AccessPolicy };

/**
 * OrgPermission model for managing organization-level permissions
 * @see {@link OrgPermission}
 */
export { OrgPermission };

/**
 * UserPermission model for managing user-level permissions
 * @see {@link UserPermission}
 */
export { UserPermission };

/**
 * Meter model for managing usage meters and billing
 * @see {@link Meter}
 */
export { Meter };

/**
 * Wallet model for managing digital wallets and payment balances
 * @see {@link Wallet}
 */
export { Wallet };