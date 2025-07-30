/**
 * Models module exports for the Mosaia SDK
 * 
 * This module exports all the model classes that represent entities in the Mosaia platform.
 * Each model provides data management, validation, and API integration capabilities
 * for their respective entity types.
 * 
 * ## Available Models
 * 
 * - **BaseModel**: Abstract base class providing common functionality for all models
 * - **User**: User account and profile management
 * - **App**: Application container and configuration management
 * - **Self**: Current authenticated entity information
 * - **Agent**: AI agent configuration and operations
 * - **Organization**: Organization structure and settings
 * - **OrgUser**: User-organization relationship management
 * - **AppBot**: Application-bot integration management
 * - **AgentGroup**: AI agent collection and coordination
 * - **Tool**: External integration and utility management
 * - **Client**: OAuth client application management
 * - **Model**: AI model configuration and operations
 * 
 * @example
 * ```typescript
 * import { User, Agent, Organization, Tool } from './models';
 * 
 * // Create model instances
 * const user = new User({
 *   name: 'John Doe',
 *   email: 'john@example.com'
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
import Self from './self';
import User from './user';
import Organization from './organization';
import OrgUser from './org-user';
import AppBot from './app-bot';
import AgentGroup from './agent-group';
import Tool from './tool';
import Client from './client';
import Model from './model';

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
 * Self model for managing current authenticated entity information
 * @see {@link Self}
 */
export { Self };

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
 * App Bot model for managing application-bot integrations
 * @see {@link AppBot}
 */
export { AppBot };

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