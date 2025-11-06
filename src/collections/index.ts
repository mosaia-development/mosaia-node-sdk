/**
 * Collection client exports for the Mosaia SDK
 * 
 * This module exports all the collection client classes that can be used to interact
 * with different resources on the Mosaia platform. Each client provides
 * methods for CRUD operations and specialized functionality.
 * 
 * ## Available Collection Clients
 * 
 * - **Agents**: Manage AI agents for conversation and task execution
 * - **Apps**: Manage applications and their configurations
 * - **Auth**: Handle user authentication and session management
 * - **Users**: Manage user accounts and profiles
 * - **Organizations**: Manage organizational structures and settings
 * - **OrgUsers**: Handle user-organization relationships and permissions
 * - **Tools**: Manage external integrations and utilities
 * - **Clients**: Manage OAuth client applications
 * - **Models**: Manage AI model configurations
 * - **AppBots**: Handle application-bot integrations
 * - **AgentGroups**: Manage collections of AI agents
 * - **AppConnectors**: Handle application-connector integrations
 * 
 * @example
 * ```typescript
 * import { Apps, Tools, Agents, Auth, AppConnectors } from './collections';
 * 
 * // Create collection clients
 * const apps = new Apps();
 * const tools = new Tools();
 * const agents = new Agents();
 * const appConnectors = new AppConnectors();
 * const auth = new MosaiaAuth();
 * 
 * // Use the clients
 * const allApps = await apps.get();
 * const allTools = await tools.get();
 * const allAgents = await agents.get();
 * const allAppConnectors = await appConnectors.get();
 * ```
 */

import Agents from './agents';
import Apps from './apps';
import MosaiaAuth from '../auth/auth';
import Users from './users';
import Organizations from './organizations';
import OrgUsers from './org-users';
import Tools from './tools';
import Clients from './clients';
import Models from './models';
import AppBots from './app-bots';
import AgentGroups from './agent-groups';
import AppConnectors from './app-connectors';
import Search from './search';
import Drives from './drives';
import DriveItems from './drive-items';
import Logs from './logs';
import Messages from './messages';
import Snapshots from './snapshots';
import Scopes from './scopes';
import SSO from './sso';
import Notifications from './notifications';
import VectorIndexes from './vector-indexes';
import Tasks from './tasks';
import Plans from './plans';

/**
 * Agents collection client for managing AI agents
 * 
 * Provides CRUD operations for AI agents that can perform specific tasks,
 * handle conversations, and execute workflows based on their configuration.
 * 
 * @see {@link Agents}
 */
export { Agents };

/**
 * Applications collection client for managing applications
 * 
 * Provides CRUD operations for applications, which are the primary containers
 * for AI-powered solutions and serve as entry points for user interactions.
 * 
 * @see {@link Apps}
 */
export { Apps };

/**
 * Authentication collection client for managing user authentication
 * 
 * Provides authentication methods including password-based login, client credentials,
 * and token refresh operations for secure access to the Mosaia platform.
 * 
 * @see {@link MosaiaAuth}
 */
export { MosaiaAuth };

/**
 * Users collection client for managing user accounts
 * 
 * Provides CRUD operations for user accounts, including profile management,
 * settings, and user-specific configurations within the platform.
 * 
 * @see {@link Users}
 */
export { Users };

/**
 * Organizations collection client for managing organizations
 * 
 * Provides CRUD operations for organizations, which are containers for grouping
 * users, applications, and resources to enable team collaboration.
 * 
 * @see {@link Organizations}
 */
export { Organizations };

/**
 * Organization Users collection client for managing org-user relationships
 * 
 * Provides CRUD operations for managing the relationships between users and
 * organizations, including permissions and access control.
 * 
 * @see {@link OrgUsers}
 */
export { OrgUsers };

/**
 * Tools collection client for managing external integrations
 * 
 * Provides CRUD operations for tools, which are external integrations and
 * utilities that agents can use to perform specific tasks.
 * 
 * @see {@link Tools}
 */
export { Tools };

/**
 * Clients collection client for managing OAuth applications
 * 
 * Provides CRUD operations for OAuth clients that can authenticate with
 * the Mosaia API through various authentication flows.
 * 
 * @see {@link Clients}
 */
export { Clients };

/**
 * Models collection client for managing AI model configurations
 * 
 * Provides CRUD operations for AI models that can be used by agents for
 * various tasks such as text generation and analysis.
 * 
 * @see {@link Models}
 */
export { Models };

/**
 * App Bots collection client for managing application-bot integrations
 * 
 * Provides CRUD operations for app bots, which are specialized integrations
 * that connect applications with AI agents through webhook-style interactions.
 * 
 * @see {@link AppBots}
 */
export { AppBots };

/**
 * App Connectors collection client for managing application-connector integrations
 * 
 * Provides CRUD operations for application connectors, which allow connecting
 * external applications with AI agents or agent groups through webhook-style interactions.
 * 
 * @see {@link AppConnectors}
 */
export { AppConnectors };

/**
 * Agent Groups collection client for managing agent collections
 * 
 * Provides CRUD operations for agent groups, which allow organizing and
 * managing multiple AI agents together for coordinated workflows.
 * 
 * @see {@link AgentGroups}
 */
export { AgentGroups };

/**
 * Search collection client for universal search across resources
 * 
 * Provides search functionality across multiple resource types (agents, apps,
 * tools, models) simultaneously with a single query.
 * 
 * @see {@link Search}
 */
export { Search };

/**
 * Drives collection client for managing file storage drives
 * 
 * Provides CRUD operations for drives, which are containers for organizing
 * and managing files and documents, scoped to users or organizations.
 * 
 * @see {@link Drives}
 */
export { Drives };

/**
 * Drive Items collection client for managing files and documents in drives
 * 
 * Provides CRUD operations for drive items (files and documents) within drives,
 * including file uploads and metadata management.
 * 
 * @see {@link DriveItems}
 */
export { DriveItems };

/**
 * Logs collection client for managing agent logs
 * 
 * Provides CRUD operations for agent logs, which track conversations
 * and interactions with agents.
 * 
 * @see {@link Logs}
 */
export { Logs };

/**
 * Messages collection client for managing log messages
 * 
 * Provides CRUD operations for log messages, which are associated
 * with specific logs.
 * 
 * @see {@link Messages}
 */
export { Messages };

/**
 * Snapshots collection client for managing log snapshots
 * 
 * Provides CRUD operations for log snapshots, which are point-in-time
 * exports of log data.
 * 
 * @see {@link Snapshots}
 */
export { Snapshots };

/**
 * Scopes collection client for managing permission scopes
 * 
 * Provides access to permission scopes available in the platform.
 * 
 * @see {@link Scopes}
 */
export { Scopes };

/**
 * SSO collection client for single sign-on authentication
 * 
 * Provides SSO authentication functionality for OAuth providers.
 * 
 * @see {@link SSO}
 */
export { SSO };

/**
 * Notifications collection client for sending email notifications
 * 
 * Provides email notification functionality for sending emails
 * through the platform.
 * 
 * @see {@link Notifications}
 */
export { Notifications };


/**
 * Vector Indexes collection client for managing vector indexes
 * 
 * Provides CRUD operations for vector indexes, which enable
 * semantic search and similarity matching.
 * 
 * @see {@link VectorIndexes}
 */
export { VectorIndexes };

/**
 * Tasks collection client for managing tasks
 * 
 * Provides CRUD operations for tasks in the platform.
 * 
 * @see {@link Tasks}
 */
export { Tasks };

/**
 * Plans collection client for managing task plans
 * 
 * Provides CRUD operations for task plans, which are associated
 * with specific tasks.
 * 
 * @see {@link Plans}
 */
export { Plans };