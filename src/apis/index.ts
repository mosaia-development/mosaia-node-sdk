/**
 * API client exports for the Mosaia SDK
 * 
 * This module exports all the API client classes that can be used to interact
 * with different resources on the Mosaia platform. Each client provides
 * methods for CRUD operations and specialized functionality.
 * 
 * @example
 * ```typescript
 * import { Apps, Tools, Agents, Auth } from './apis';
 * 
 * // Create API clients
 * const apps = new Apps(config);
 * const tools = new Tools(config);
 * const agents = new Agents(config);
 * const auth = new Auth(config);
 * 
 * // Use the clients
 * const allApps = await apps.getAll();
 * const allTools = await tools.get();
 * const allAgents = await agents.getAll();
 * ```
 */

import Apps from './apps';
import Tools from './tools';
import AppBots from './app-bots';
import Users from './users';
import Organizations from './organizations';
import Agents from './agents';
import AgentGroups from './agent-groups';
import Models from './models';
import Clients from './clients';
import Auth from './auth';
import Billing from './billing';
import Permissions from './permissions';

/**
 * Applications API client for managing applications
 * @see {@link Apps}
 */
export { Apps };

/**
 * Tools API client for managing tools and integrations
 * @see {@link Tools}
 */
export { Tools };

/**
 * App Bots API client for managing application bots
 * @see {@link AppBots}
 */
export { AppBots };

/**
 * Users API client for managing user accounts
 * @see {@link Users}
 */
export { Users };

/**
 * Organizations API client for managing organizations
 * @see {@link Organizations}
 */
export { Organizations };

/**
 * Agents API client for managing AI agents
 * @see {@link Agents}
 */
export { Agents };

/**
 * Agent Groups API client for managing AI agent groups
 * @see {@link AgentGroups}
 */
export { AgentGroups };

/**
 * Models API client for managing AI models
 * @see {@link Models}
 */
export { Models };

/**
 * Clients API client for managing OAuth clients
 * @see {@link Clients}
 */
export { Clients };

/**
 * Authentication API client for managing user authentication
 * @see {@link Auth}
 */
export { Auth };

/**
 * Billing API client for managing wallets and usage meters
 * @see {@link Billing}
 */
export { Billing };

/**
 * Permissions API client for managing access policies and permissions
 * @see {@link Permissions}
 */
export { Permissions };
