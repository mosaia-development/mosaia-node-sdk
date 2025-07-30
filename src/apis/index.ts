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

import Agents from './agents';
import Apps from './apps';
import Auth from './auth';
import Users from './users';
import Organizations from './organizations';
import OrgUsers from './org-users';
import Tools from './tools';
import Billing from './billing';
import Permissions from './permissions';
import Clients from './clients';
import Models from './models';
import AppBots from './app-bots';
import AgentGroups from './agent-groups';

/**
 * Agents API client for managing AI agents
 * @see {@link Agents}
 */
export { Agents };

/**
 * Applications API client for managing applications
 * @see {@link Apps}
 */
export { Apps };

/**
 * Authentication API client for managing user authentication
 * @see {@link Auth}
 */
export { Auth };

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
 * Org user API client for managing org users
 * @see {@link OrgUsers}
 */
export { OrgUsers };

/**
 * Tools API client for managing tools
 * @see {@link Tools}
 */
export { Tools };

/**
 * Billing API client for managing billing
 * @see {@link Billing}
 */
export { Billing };

/**
 * Permissions API client for managing permissions
 * @see {@link Permissions}
 */
export { Permissions };

/**
 * Clients API client for managing clients
 * @see {@link Clients}
 */
export { Clients };

/**
 * Models API client for managing models
 * @see {@link Models}
 */
export { Models };

/**
 * AppBots API client for managing app bots
 * @see {@link AppBots}
 */
export { AppBots };

/**
 * AgentGroups API client for managing agent groups
 * @see {@link AgentGroups}
 */
export { AgentGroups };