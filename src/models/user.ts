import { GetUserPayload, UserInterface } from '../types';
import { BaseModel } from './base';
import {
    Agents,
    Apps,
    Clients,
    Models,
    OrgUsers,
    Tools,
    Meters,
    Wallets,
    AccessPolicies,
    UserPermissions
} from '../collections';
import { Image } from '../functions/image';

/**
 * User class for managing platform users
 * 
 * This class represents a user account in the Mosaia platform. Users are
 * the primary actors who can create and manage AI resources, interact with
 * agents, and collaborate within organizations.
 * 
 * Features:
 * - Profile management
 * - Resource ownership
 * - Organization membership
 * - Access control
 * - Resource management
 * 
 * @remarks
 * Users can manage:
 * - AI agents and groups
 * - Applications
 * - Models and tools
 * - Organization memberships
 * - OAuth clients
 * 
 * Available resources:
 * - Personal agents
 * - Custom applications
 * - Model configurations
 * - Integration tools
 * - Organization access
 * 
 * @example
 * Basic user setup:
 * ```typescript
 * import { User } from 'mosaia-node-sdk';
 * 
 * // Create user profile
 * const user = new User({
 *   username: 'jsmith',
 *   name: 'John Smith',
 *   email: 'john@example.com',
 *   metadata: {
 *     title: 'Senior Developer',
 *     department: 'Engineering',
 *     location: 'San Francisco'
 *   }
 * });
 * 
 * await user.save();
 * 
 * // Add profile image
 * const image = new File(['...'], 'avatar.jpg', { type: 'image/jpeg' });
 * await user.uploadProfileImage(image);
 * ```
 * 
 * @example
 * Resource management:
 * ```typescript
 * // Access user's resources
 * const [agents, apps, models] = await Promise.all([
 *   user.agents.get(),
 *   user.apps.get(),
 *   user.models.get()
 * ]);
 * 
 * console.log('User Resources:');
 * console.log(`- ${agents.length} AI agents`);
 * console.log(`- ${apps.length} applications`);
 * console.log(`- ${models.length} models`);
 * 
 * // Create new agent
 * const agent = await user.agents.create({
 *   name: 'Personal Assistant',
 *   model: 'gpt-4',
 *   temperature: 0.7,
 *   system_prompt: 'You are a helpful assistant.'
 * });
 * 
 * // Create application
 * const app = await user.apps.create({
 *   name: 'Task Manager',
 *   short_description: 'AI-powered task management'
 * });
 * 
 * // Check organization memberships
 * const orgs = await user.orgs.get();
 * orgs.forEach(org => {
 *   console.log(`${org.org.name}: ${org.permission}`);
 * });
 * ```
 * 
 * @extends BaseModel<UserInterface>
 * @category Models
 */
export default class User extends BaseModel<UserInterface> {
    /**
     * Creates a new user profile
     * 
     * Initializes a user account with the provided profile information.
     * Users are the primary actors in the platform who can create and
     * manage AI resources.
     * 
     * @param data - Profile data including:
     *               - username: Unique identifier
     *               - name: Display name
     *               - email: Contact email
     *               - description: Bio or description
     *               - metadata: Additional profile data
     * @param uri - Optional custom URI path for the user endpoint
     * 
     * @example
     * Basic profile:
     * ```typescript
     * const user = new User({
     *   username: 'jdoe',
     *   name: 'Jane Doe',
     *   email: 'jane@example.com',
     *   description: 'AI Developer'
     * });
     * ```
     * 
     * @example
     * Detailed profile:
     * ```typescript
     * const user = new User({
     *   username: 'jsmith',
     *   name: 'John Smith',
     *   email: 'john@example.com',
     *   description: 'Senior AI Engineer',
     *   metadata: {
     *     title: 'Engineering Lead',
     *     department: 'AI Research',
     *     location: 'New York',
     *     skills: ['machine-learning', 'nlp', 'python'],
     *     joined_date: new Date().toISOString(),
     *     preferences: {
     *       theme: 'dark',
     *       notifications: true,
     *       language: 'en-US'
     *     }
     *   }
     * }, '/enterprise/user');
     * ```
     */
    constructor(data: Partial<UserInterface>, uri?: string) {
        super(data, uri || '/user');
    }

    /**
     * Get the user's AI agents
     * 
     * This getter provides access to the user's AI agents through the
     * Agents collection. It enables management of personal agents and
     * their configurations.
     * 
     * @returns Agents collection for managing AI agents
     * 
     * @example
     * List agents:
     * ```typescript
     * const agents = await user.agents.get();
     * agents.forEach(agent => {
     *   console.log(`Agent: ${agent.name}`);
     *   console.log(`Model: ${agent.model}`);
     * });
     * ```
     * 
     * @example
     * Create agent:
     * ```typescript
     * const agent = await user.agents.create({
     *   name: 'Code Assistant',
     *   model: 'gpt-4',
     *   temperature: 0.7,
     *   system_prompt: 'You are an expert programmer.',
     *   metadata: {
     *     purpose: 'code-review',
     *     languages: ['typescript', 'python', 'go']
     *   }
     * });
     * ```
     */
    get agents(): Agents {
        return new Agents(this.getUri());
    }

    /**
     * Get the user's applications
     * 
     * This getter provides access to the user's applications through the
     * Apps collection. It enables management of personal applications and
     * their configurations.
     * 
     * @returns Apps collection for managing applications
     * 
     * @example
     * List applications:
     * ```typescript
     * const apps = await user.apps.get();
     * apps.forEach(app => {
     *   console.log(`App: ${app.name}`);
     *   console.log(`URL: ${app.external_app_url}`);
     * });
     * ```
     * 
     * @example
     * Create application:
     * ```typescript
     * const app = await user.apps.create({
     *   name: 'AI Dashboard',
     *   short_description: 'Personal AI management',
     *   external_app_url: 'https://dashboard.example.com',
     *   metadata: {
     *     type: 'web-application',
     *     features: ['agent-management', 'analytics'],
     *     version: '1.0'
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
     * Get the user's OAuth clients
     * 
     * This getter provides access to the user's OAuth clients through the
     * Clients collection. It enables management of authentication and
     * authorization for external applications.
     * 
     * @returns Clients collection for managing OAuth clients
     * 
     * @example
     * List clients:
     * ```typescript
     * const clients = await user.clients.get();
     * clients.forEach(client => {
     *   console.log(`Client: ${client.name}`);
     *   console.log(`ID: ${client.client_id}`);
     * });
     * ```
     * 
     * @example
     * Create OAuth client:
     * ```typescript
     * const client = await user.clients.create({
     *   name: 'Mobile App',
     *   redirect_uris: ['com.example.app://oauth/callback'],
     *   scopes: ['read:agents', 'write:apps'],
     *   metadata: {
     *     platform: 'ios',
     *     version: '2.0',
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
     * Get the user's AI models
     * 
     * This getter provides access to the user's AI models through the
     * Models collection. It enables management of model configurations
     * and customizations.
     * 
     * @returns Models collection for managing AI models
     * 
     * @example
     * List models:
     * ```typescript
     * const models = await user.models.get();
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
     * const model = await user.models.create({
     *   name: 'Enhanced GPT-4',
     *   provider: 'openai',
     *   model_id: 'gpt-4',
     *   temperature: 0.7,
     *   max_tokens: 2000,
     *   metadata: {
     *     purpose: 'code-generation',
     *     training: 'fine-tuned',
     *     version: '1.0',
     *     specialties: ['typescript', 'python'],
     *     performance: {
     *       avg_latency: 500,
     *       max_concurrent: 10
     *     }
     *   }
     * });
     * ```
     */
    get models(): Models {
        return new Models(this.getUri());
    }

    /**
     * Get the user's organization memberships
     * 
     * This getter provides access to the user's organization memberships
     * through the OrgUsers collection. It enables management of team
     * memberships and organization access.
     * 
     * @returns OrgUsers collection for managing organization memberships
     * 
     * @example
     * List memberships:
     * ```typescript
     * const memberships = await user.orgs.get();
     * memberships.forEach(membership => {
     *   console.log(`Organization: ${membership.org.name}`);
     *   console.log(`Role: ${membership.permission}`);
     *   console.log(`Active: ${membership.isActive()}`);
     * });
     * ```
     * 
     * @example
     * Manage memberships:
     * ```typescript
     * // Join organization
     * const membership = await user.orgs.create({
     *   org: 'org-123',
     *   permission: 'member',
     *   metadata: {
     *     department: 'engineering',
     *     title: 'Senior Developer',
     *     start_date: new Date().toISOString()
     *   }
     * });
     * 
     * // Get authenticated session
     * const config = await membership.session();
     * const mosaia = new Mosaia(config);
     * 
     * // Access organization resources
     * const orgAgents = await mosaia.agents.get();
     * console.log(`Organization has ${orgAgents.length} agents`);
     * ```
     */
    get orgs(): OrgUsers {
        return new OrgUsers(this.getUri(), '/org');
    }

    /**
     * Get the user's integration tools
     * 
     * This getter provides access to the user's integration tools through
     * the Tools collection. It enables management of external service
     * integrations and custom tools.
     * 
     * @returns Tools collection for managing integrations
     * 
     * @example
     * List tools:
     * ```typescript
     * const tools = await user.tools.get();
     * tools.forEach(tool => {
     *   console.log(`Tool: ${tool.name}`);
     *   console.log(`Type: ${tool.type}`);
     *   console.log(`Schema: ${tool.tool_schema}`);
     * });
     * ```
     * 
     * @example
     * Create integration:
     * ```typescript
     * const tool = await user.tools.create({
     *   name: 'jira-integration',
     *   friendly_name: 'Jira Service',
     *   short_description: 'Create and manage Jira issues',
     *   tool_schema: JSON.stringify({
     *     type: 'object',
     *     properties: {
     *       project: {
     *         type: 'string',
     *         description: 'Jira project key'
     *       },
     *       type: {
     *         type: 'string',
     *         enum: ['bug', 'task', 'story'],
     *         default: 'task'
     *       },
     *       title: {
     *         type: 'string',
     *         minLength: 1
     *       },
     *       description: {
     *         type: 'string'
     *       },
     *       priority: {
     *         type: 'string',
     *         enum: ['high', 'medium', 'low'],
     *         default: 'medium'
     *       }
     *     },
     *     required: ['project', 'title']
     *   }),
     *   required_environment_variables: [
     *     'JIRA_HOST',
     *     'JIRA_EMAIL',
     *     'JIRA_API_TOKEN'
     *   ],
     *   source_url: 'https://your-domain.atlassian.net',
     *   metadata: {
     *     type: 'issue-tracker',
     *     provider: 'atlassian',
     *     version: '1.0',
     *     capabilities: ['create', 'read', 'update']
     *   }
     * });
     * ```
     */
    get tools(): Tools {
        return new Tools(this.getUri());
    }

    /**
     * Get the image functionality for this user's profile
     * 
     * This getter provides access to the user's profile image operations
     * through the Image class. It allows for profile image uploads and other
     * image-related operations specific to this user.
     * 
     * @returns A new Image instance configured for this user's profile
     * 
     * @example
     * ```typescript
     * const updatedUser = await user.image.upload<User, GetUserPayload>(file);
     * ```
     */
    get image(): Image {
        return new Image(`${this.getUri()}/profile`, (this.data as any).image || '');
    }

    /**
     * Get the user's access policies
     * 
     * This getter provides access to the user's access control policies
     * through the AccessPolicies collection. It enables management of IAM policies
     * that define fine-grained permissions for resources and actions.
     * 
     * @returns AccessPolicies collection for managing access control policies
     * 
     * @example
     * ```typescript
     * const policies = await user.policies.get();
     * const policy = await user.policies.create({
     *   name: 'Personal Access',
     *   effect: 'allow',
     *   actions: ['agents:read', 'apps:read'],
     *   resources: ['agents', 'apps']
     * });
     * ```
     */
    get policies(): AccessPolicies {
        return new AccessPolicies(this.getUri());
    }

    /**
     * Get the user's permissions
     * 
     * This getter provides access to the user's permissions through
     * the UserPermissions collection. It enables management of permissions that
     * associate clients with access policies for this user.
     * 
     * @returns UserPermissions collection for managing user permissions
     * 
     * @example
     * ```typescript
     * const permissions = await user.permissions.get();
     * const permission = await user.permissions.create({
     *   client: 'client-id',
     *   policy: 'policy-id'
     * });
     * ```
     */
    get permissions(): UserPermissions {
        return new UserPermissions(this.getUri());
    }

    /**
     * Get the user's usage meters
     * 
     * This getter provides access to the user's usage meters through
     * the Meters collection. It enables tracking of service consumption and
     * associated costs for billing purposes.
     * 
     * @returns Meters collection for managing usage meters
     * 
     * @example
     * ```typescript
     * const meters = await user.meters.get();
     * ```
     */
    get meters(): Meters {
        return new Meters(this.getUri());
    }

    /**
     * Get the user's wallet
     * 
     * This getter provides access to the user's wallet through
     * the Wallets collection. It enables management of balances, payment
     * methods, and financial transactions.
     * 
     * @returns Wallets collection for managing the user wallet
     * 
     * @example
     * ```typescript
     * const wallet = await user.wallets.get();
     * ```
     */
    get wallets(): Wallets {
        return new Wallets(this.getUri());
    }
}