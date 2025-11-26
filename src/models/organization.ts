import { OrganizationInterface, GetUserPayload } from '../types';
import { BaseModel } from './base';
import {
    Agents,
    Apps,
    Clients,
    AgentGroups,
    Models,
    OrgUsers,
    Tools,
    AccessPolicies,
    OrgPermissions,
    Meters,
    Wallets
} from '../collections';
import { Image } from '../functions/image';

/**
 * Organization class for managing organizational entities
 * 
 * This class represents an organization in the Mosaia platform. Organizations
 * are the top-level containers that group users, resources, and settings.
 * They provide isolation and management capabilities for teams and enterprises.
 * 
 * Features:
 * - Resource management (agents, apps, models)
 * - Team management
 * - Access control
 * - Billing and usage tracking
 * - Configuration management
 * 
 * @remarks
 * Organizations provide:
 * - Multi-tenant isolation
 * - Resource sharing and access control
 * - Team collaboration
 * - Usage monitoring and billing
 * - Custom configurations
 * 
 * Available resources:
 * - AI Agents
 * - Applications
 * - Agent Groups
 * - Models
 * - Tools
 * - OAuth Clients
 * - Team Members
 * 
 * @example
 * Basic organization setup:
 * ```typescript
 * import { Organization } from 'mosaia-node-sdk';
 * 
 * // Create a new organization
 * const org = new Organization({
 *   name: 'Acme Inc',
 *   short_description: 'Technology solutions provider',
 *   metadata: {
 *     industry: 'technology',
 *     size: 'enterprise'
 *   }
 * });
 * 
 * await org.save();
 * ```
 * 
 * @example
 * Resource management:
 * ```typescript
 * // Access organization resources
 * const agents = await org.agents.get();
 * const apps = await org.apps.get();
 * const models = await org.models.get();
 * 
 * // Create new resources
 * const agent = await org.agents.create({
 *   name: 'Support Bot',
 *   model: 'gpt-4'
 * });
 * 
 * const app = await org.apps.create({
 *   name: 'Customer Portal',
 *   short_description: 'AI-powered support'
 * });
 * 
 * // Manage team members
 * const members = await org.orgs.get();
 * console.log(`Team size: ${members.length}`);
 * ```
 * 
 * @extends BaseModel<OrganizationInterface>
 * @category Models
 */
export default class Organization extends BaseModel<OrganizationInterface> {
    /**
     * Creates a new organization instance
     * 
     * Initializes an organization with the provided configuration data.
     * Organizations are the primary containers for managing AI resources,
     * team members, and settings.
     * 
     * @param data - Configuration data including:
     *               - name: Organization name
     *               - short_description: Brief description
     *               - long_description: Detailed description
     *               - metadata: Custom metadata object
     * @param uri - Optional custom URI path for the organization endpoint
     * 
     * @example
     * Basic organization:
     * ```typescript
     * const org = new Organization({
     *   name: 'Tech Solutions',
     *   short_description: 'AI solutions provider'
     * });
     * ```
     * 
     * @example
     * Detailed configuration:
     * ```typescript
     * const org = new Organization({
     *   name: 'Enterprise AI',
     *   short_description: 'Enterprise AI solutions',
     *   long_description: 'Comprehensive AI solutions for enterprises',
     *   metadata: {
     *     industry: 'technology',
     *     size: 'enterprise',
     *     region: 'global',
     *     compliance: ['gdpr', 'hipaa'],
     *     features: ['agents', 'models', 'apps']
     *   }
     * }, '/enterprise/org');
     * ```
     */
    constructor(data: Partial<OrganizationInterface>, uri?: string) {
        super(data, uri || '/org');
    }

    /**
     * Get the organization's AI agents
     * 
     * This getter provides access to the organization's AI agents through
     * the Agents collection. It enables management of all AI agents within
     * the organization.
     * 
     * @returns Agents collection for managing AI agents
     * 
     * @example
     * List agents:
     * ```typescript
     * const agents = await org.agents.get();
     * agents.forEach(agent => {
     *   console.log(`Agent: ${agent.name}`);
     * });
     * ```
     * 
     * @example
     * Create agent:
     * ```typescript
     * const agent = await org.agents.create({
     *   name: 'Customer Support',
     *   model: 'gpt-4',
     *   temperature: 0.7,
     *   system_prompt: 'You are a helpful support agent.'
     * });
     * ```
     */
    get agents(): Agents {
        return new Agents(this.getUri());
    }

    /**
     * Get the organization's applications
     * 
     * This getter provides access to the organization's applications through
     * the Apps collection. It enables management of all applications within
     * the organization.
     * 
     * @returns Apps collection for managing applications
     * 
     * @example
     * List applications:
     * ```typescript
     * const apps = await org.apps.get();
     * apps.forEach(app => {
     *   console.log(`App: ${app.name}`);
     *   console.log(`URL: ${app.external_app_url}`);
     * });
     * ```
     * 
     * @example
     * Create application:
     * ```typescript
     * const app = await org.apps.create({
     *   name: 'Support Portal',
     *   short_description: 'AI-powered support portal',
     *   external_app_url: 'https://support.example.com',
     *   metadata: {
     *     type: 'customer-support',
     *     features: ['chat', 'knowledge-base']
     *   }
     * });
     * ```
     */
    get apps(): Apps {
        return new Apps(this.getUri());
    }

    /**
     * Commented out for later implementation
     */
    // get billing(): Billing {
    //     return new Billing(this.getUri());
    // }

    /**
     * Get the organization's OAuth clients
     * 
     * This getter provides access to the organization's OAuth clients through
     * the Clients collection. It enables management of authentication and
     * authorization for external applications.
     * 
     * @returns Clients collection for managing OAuth clients
     * 
     * @example
     * List clients:
     * ```typescript
     * const clients = await org.clients.get();
     * clients.forEach(client => {
     *   console.log(`Client: ${client.name}`);
     *   console.log(`ID: ${client.client_id}`);
     * });
     * ```
     * 
     * @example
     * Create OAuth client:
     * ```typescript
     * const client = await org.clients.create({
     *   name: 'Web Dashboard',
     *   redirect_uris: ['https://app.example.com/oauth/callback'],
     *   scopes: ['read:agents', 'write:apps'],
     *   metadata: {
     *     type: 'web-application',
     *     environment: 'production'
     *   }
     * });
     * 
     * console.log('Client credentials:');
     * console.log(`ID: ${client.client_id}`);
     * console.log(`Secret: ${client.client_secret}`);
     * ```
     */
    get clients(): Clients {
        return new Clients(this.getUri());
    }

    /**
     * Get the organization's agent groups
     * 
     * This getter provides access to the organization's agent groups through
     * the AgentGroups collection. It enables management of collaborative
     * agent teams and specialized agent configurations.
     * 
     * @returns AgentGroups collection for managing agent groups
     * 
     * @example
     * List agent groups:
     * ```typescript
     * const groups = await org.groups.get();
     * groups.forEach(group => {
     *   console.log(`Group: ${group.name}`);
     *   console.log(`Agents: ${group.agents.length}`);
     * });
     * ```
     * 
     * @example
     * Create specialized team:
     * ```typescript
     * const supportTeam = await org.groups.create({
     *   name: 'Support Team',
     *   short_description: 'Customer support specialists',
     *   agents: ['billing-expert', 'tech-support', 'general-help'],
     *   metadata: {
     *     type: 'customer-support',
     *     specialties: ['billing', 'technical', 'general'],
     *     availability: '24/7'
     *   }
     * });
     * ```
     */
    get groups(): AgentGroups {
        return new AgentGroups(this.getUri());
    }

    /**
     * Placeholder to be implemented later in the future
     */
    // get iam() {
    //     return new Iam(this.getUri());
    // }

    /**
     * Get the organization's AI models
     * 
     * This getter provides access to the organization's AI models through
     * the Models collection. It enables management of model configurations
     * and customizations for the organization's AI capabilities.
     * 
     * @returns Models collection for managing AI models
     * 
     * @example
     * List models:
     * ```typescript
     * const models = await org.models.get();
     * models.forEach(model => {
     *   console.log(`Model: ${model.name}`);
     *   console.log(`Provider: ${model.provider}`);
     *   console.log(`ID: ${model.model_id}`);
     * });
     * ```
     * 
     * @example
     * Create custom model:
     * ```typescript
     * const model = await org.models.create({
     *   name: 'Enhanced GPT-4',
     *   provider: 'openai',
     *   model_id: 'gpt-4',
     *   temperature: 0.7,
     *   max_tokens: 2000,
     *   metadata: {
     *     purpose: 'customer-support',
     *     training: 'fine-tuned',
     *     version: '1.0'
     *   }
     * });
     * ```
     */
    get models(): Models {
        return new Models(this.getUri());
    }

    /**
     * Get the organization's team members
     * 
     * This getter provides access to the organization's user relationships
     * through the OrgUsers collection. It enables management of team members,
     * their roles, and permissions within the organization.
     * 
     * @returns OrgUsers collection for managing team members
     * 
     * @example
     * List team members:
     * ```typescript
     * const members = await org.orgs.get();
     * members.forEach(member => {
     *   console.log(`Member: ${member.user.name}`);
     *   console.log(`Role: ${member.permission}`);
     * });
     * ```
     * 
     * @example
     * Add team member:
     * ```typescript
     * const member = await org.orgs.create({
     *   user: 'user-123',
     *   permission: 'member',
     *   metadata: {
     *     department: 'engineering',
     *     title: 'Senior Developer',
     *     start_date: new Date().toISOString()
     *   }
     * });
     * 
     * // Create session for member
     * const session = await member.session();
     * ```
     */
    get orgs(): OrgUsers {
        return new OrgUsers(this.getUri());
    }

    /**
     * Get the organization's tools
     * 
     * This getter provides access to the organization's tools through the
     * Tools collection. It enables management of custom tools and integrations
     * that extend agent capabilities.
     * 
     * @returns Tools collection for managing custom tools
     * 
     * @example
     * List tools:
     * ```typescript
     * const tools = await org.tools.get();
     * tools.forEach(tool => {
     *   console.log(`Tool: ${tool.name}`);
     *   console.log(`Type: ${tool.type}`);
     * });
     * ```
     * 
     * @example
     * Create custom tool:
     * ```typescript
     * const tool = await org.tools.create({
     *   name: 'Weather API',
     *   type: 'api',
     *   description: 'Get weather forecasts',
     *   api_url: 'https://api.weather.com',
     *   api_key: process.env.WEATHER_API_KEY,
     *   metadata: {
     *     provider: 'weather-service',
     *     capabilities: ['current', 'forecast'],
     *     rate_limit: 1000
     *   }
     * });
     * ```
     */
    get tools(): Tools {
        return new Tools(this.getUri());
    }

    /**
     * Get the image functionality for this organization's profile
     * 
     * This getter provides access to the organization's profile image operations
     * through the Image class. It allows for profile image uploads and other
     * image-related operations specific to this organization.
     * 
     * @returns A new Image instance configured for this organization's profile
     * 
     * @example
     * ```typescript
     * const updatedOrg = await org.image.upload<Organization, GetUserPayload>(file);
     * ```
     */
    get image(): Image {
        return new Image(`${this.getUri()}/profile`, (this.data as any).image || '');
    }

    /**
     * Get the organization's access policies
     * 
     * This getter provides access to the organization's access control policies
     * through the AccessPolicies collection. It enables management of IAM policies
     * that define fine-grained permissions for resources and actions.
     * 
     * @returns AccessPolicies collection for managing access control policies
     * 
     * @example
     * ```typescript
     * const policies = await org.policies.get();
     * const policy = await org.policies.create({
     *   name: 'Admin Access',
     *   effect: 'allow',
     *   actions: ['users:read', 'users:write'],
     *   resources: ['users', 'organizations']
     * });
     * ```
     */
    get policies(): AccessPolicies {
        return new AccessPolicies(this.getUri());
    }

    /**
     * Get the organization's permissions
     * 
     * This getter provides access to the organization's permissions through
     * the OrgPermissions collection. It enables management of permissions that
     * associate users, agents, or clients with access policies.
     * 
     * @returns OrgPermissions collection for managing organization permissions
     * 
     * @example
     * ```typescript
     * const permissions = await org.permissions.get();
     * const permission = await org.permissions.create({
     *   user: 'user-id',
     *   policy: 'policy-id'
     * });
     * ```
     */
    get permissions(): OrgPermissions {
        return new OrgPermissions(this.getUri());
    }

    /**
     * Get the organization's usage meters
     * 
     * This getter provides access to the organization's usage meters through
     * the Meters collection. It enables tracking of service consumption and
     * associated costs for billing purposes.
     * 
     * @returns Meters collection for managing usage meters
     * 
     * @example
     * ```typescript
     * const meters = await org.meters.get();
     * ```
     */
    get meters(): Meters {
        return new Meters(this.getUri());
    }

    /**
     * Get the organization's wallet
     * 
     * This getter provides access to the organization's wallet through
     * the Wallets collection. It enables management of balances, payment
     * methods, and financial transactions.
     * 
     * @returns Wallets collection for managing the organization wallet
     * 
     * @example
     * ```typescript
     * const wallet = await org.wallets.get();
     * ```
     */
    get wallets(): Wallets {
        return new Wallets(this.getUri());
    }
}