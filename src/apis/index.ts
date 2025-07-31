/**
 * API client exports for the Mosaia SDK
 * 
 * This module exports all the API client classes that can be used to interact
 * with different resources on the Mosaia platform. Each client provides
 * methods for CRUD operations and specialized functionality.
 * 
 * ## Available API Clients
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
 * 
 * @example
 * ```typescript
 * import { Apps, Tools, Agents, Auth } from './apis';
 * 
 * // Create API clients
 * const apps = new Apps();
 * const tools = new Tools();
 * const agents = new Agents();
 * const auth = new MosaiaAuth();
 * 
 * // Use the clients
 * const allApps = await apps.get();
 * const allTools = await tools.get();
 * const allAgents = await agents.get();
 * ```
 */

import Agents from './agents';
import Apps from './apps';
import MosaiaAuth from './auth';
import Users from './users';
import Organizations from './organizations';
import OrgUsers from './org-users';
import Tools from './tools';
import Clients from './clients';
import Models from './models';
import AppBots from './app-bots';
import AgentGroups from './agent-groups';

/**
 * Agents API client for managing AI agents
 * 
 * Provides CRUD operations for AI agents that can perform specific tasks,
 * handle conversations, and execute workflows based on their configuration.
 * 
 * @see {@link Agents}
 */
export { Agents };

/**
 * Applications API client for managing applications
 * 
 * Provides CRUD operations for applications, which are the primary containers
 * for AI-powered solutions and serve as entry points for user interactions.
 * 
 * @see {@link Apps}
 */
export { Apps };

/**
 * Authentication API client for managing user authentication
 * 
 * Provides authentication methods including password-based login, client credentials,
 * and token refresh operations for secure access to the Mosaia platform.
 * 
 * @see {@link MosaiaAuth}
 */
export { MosaiaAuth };

/**
 * Users API client for managing user accounts
 * 
 * Provides CRUD operations for user accounts, including profile management,
 * settings, and user-specific configurations within the platform.
 * 
 * @see {@link Users}
 */
export { Users };

/**
 * Organizations API client for managing organizations
 * 
 * Provides CRUD operations for organizations, which are containers for grouping
 * users, applications, and resources to enable team collaboration.
 * 
 * @see {@link Organizations}
 */
export { Organizations };

/**
 * Organization Users API client for managing org-user relationships
 * 
 * Provides CRUD operations for managing the relationships between users and
 * organizations, including permissions and access control.
 * 
 * @see {@link OrgUsers}
 */
export { OrgUsers };

/**
 * Tools API client for managing external integrations
 * 
 * Provides CRUD operations for tools, which are external integrations and
 * utilities that agents can use to perform specific tasks.
 * 
 * @see {@link Tools}
 */
export { Tools };

/**
 * Clients API client for managing OAuth applications
 * 
 * Provides CRUD operations for OAuth clients that can authenticate with
 * the Mosaia API through various authentication flows.
 * 
 * @see {@link Clients}
 */
export { Clients };

/**
 * Models API client for managing AI model configurations
 * 
 * Provides CRUD operations for AI models that can be used by agents for
 * various tasks such as text generation and analysis.
 * 
 * @see {@link Models}
 */
export { Models };

/**
 * App Bots API client for managing application-bot integrations
 * 
 * Provides CRUD operations for app bots, which are specialized integrations
 * that connect applications with AI agents through webhook-style interactions.
 * 
 * @see {@link AppBots}
 */
export { AppBots };

/**
 * Agent Groups API client for managing agent collections
 * 
 * Provides CRUD operations for agent groups, which allow organizing and
 * managing multiple AI agents together for coordinated workflows.
 * 
 * @see {@link AgentGroups}
 */
export { AgentGroups };