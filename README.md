# @mosaia/mosaia-node-sdk
[![Publish to NPM](https://github.com/mosaia-development/mosaia-node-sdk/actions/workflows/deploy.yml/badge.svg)](https://github.com/mosaia-development/mosaia-node-sdk/actions/workflows/deploy.yml)
![GitHub all releases](https://img.shields.io/github/commit-activity/m/mosaia-development/mosaia-node-sdk)
![GitHub contributors](https://img.shields.io/github/contributors-anon/mosaia-development/mosaia-node-sdk)
![NPM Downloads](https://img.shields.io/npm/dm/%40mosaia%2Fmosaia-node-sdk)

## Mosaia's TypeScript SDK for interfacing with the Mosaia Core platform

A comprehensive Node.js SDK for the Mosaia API platform, providing access to all models and endpoints available in the api-core ExpressJS application.

## Current Features
- **Authentication Management** - Password-based and OAuth2 authentication with PKCE
- **User & Organization Management** - Complete CRUD operations for users and organizations
- **AI Agent Management** - Create, configure, and interact with AI agents
- **Agent Groups** - Multi-agent collaboration and coordination
- **AI Model Management** - Create, update, and manage AI models with OpenAI-compatible chat completion
- **Application Management** - Manage Mosaia applications and their configurations
- **Tool Integration** - Manage external tools and integrations
- **OAuth Client Management** - OAuth client registration and management
- **Configuration Management** - Centralized configuration with runtime updates
- **Comprehensive Testing** - Full test coverage for all API endpoints

> **Note**: Some API endpoints may not be fully implemented on all server instances. The SDK includes comprehensive error handling and will gracefully handle 404 responses for unimplemented endpoints.

## Getting Started
### Installation
Run any of the following commands to install the SDK using choice of package manager
##### NPM
```shell
npm i @mosaia/mosaia-node-sdk
```
##### PNPM
```shell
pnpm add @mosaia/mosaia-node-sdk
```
##### YARN
```shell
yarn add @mosaia/mosaia-node-sdk
```

### Implementation
##### In Node.js or NextJS
To use the TypeScript definition files within a Node.js or NextJS project, simply import @mosaia/mosaia-node-sdk as you normally would.

In a TypeScript file:
```typescript
// import entire SDK
import Mosaia from '@mosaia/mosaia-node-sdk';
// import SDK with type references
import Mosaia, { AgentInterface, UserInterface } from '@mosaia/mosaia-node-sdk';
```

In a JavaScript file:
```javascript
// import entire SDK
const Mosaia = require('@mosaia/mosaia-node-sdk');
```

##### Create a Mosaia instance
```typescript
const {
    API_URL,
    APP_URL,
    CLIENT_ID,
    USER_EMAIL,
    USER_PASSWORD
} = process.env;

const mosaia = new Mosaia({
    apiURL: API_URL,           // Optional (Defaults to https://api.mosaia.ai)
    appURL: APP_URL,           // Optional (Defaults to https://mosaia.ai)
    clientId: CLIENT_ID,       // Required for OAuth flows
    version: '1'               // Optional (Defaults to '1')
});
```

## Quick Start

```typescript
import Mosaia from '@mosaia/mosaia-node-sdk';
import dotenv from 'dotenv';

dotenv.config();

const {
    API_URL,
    APP_URL,
    CLIENT_ID,
    USER_EMAIL,
    USER_PASSWORD
} = process.env;

async function main() {
    // Initialize SDK
    const mosaia = new Mosaia({
        apiURL: API_URL,
        appURL: APP_URL,
        clientId: CLIENT_ID
    });

    // Authenticate with password
    mosaia.config = await mosaia.auth.signInWithPassword(
        USER_EMAIL!,
        USER_PASSWORD!,
        CLIENT_ID!
    );

    // Get current user info
    const self = await mosaia.self();
    console.log('Authenticated as:', self.user?.email);

    // Search for agents
    const agents = await mosaia.agents.get({ q: "cafe" });
    console.log('Found agents:', agents);

    // Chat with an agent
    if (Array.isArray(agents) && agents.length > 0) {
        const firstAgent = agents[0];
        const response = await firstAgent.chatCompletion({
            messages: [
                { role: "user", content: "Hello, who are you?" }
            ]
        });
        console.log('Agent response:', response.choices[0].message);
    }
}

main().catch(console.error);
```

## Configuration

```typescript
interface MosaiaConfig {
    apiKey?: string;           // API key for authentication (optional)
    refreshToken?: string;     // Refresh token for token refresh (optional)
    version?: string;          // API version (defaults to '1')
    apiURL?: string;          // API base URL (defaults to https://api.mosaia.ai)
    appURL?: string;          // App URL for OAuth flows (defaults to https://mosaia.ai)
    clientId?: string;        // Client ID for OAuth flows (required for OAuth)
    clientSecret?: string;    // Client secret for client credentials flow (optional)
    verbose?: boolean;        // Enable verbose logging (defaults to false)
    authType?: 'password' | 'client' | 'refresh' | 'oauth'; // Authentication type
    expiresIn?: number;       // Token expiration time
    sub?: string;             // Subject identifier
    iat?: string;             // Token issued at timestamp
    exp?: string;             // Token expiration timestamp
}
```

**Configuration Management:**
- The SDK uses a centralized `ConfigurationManager` for consistent configuration across all components
- Configuration can be updated at runtime using setter methods
- All configuration changes are immediately reflected across the SDK

## API Reference

### Authentication

The SDK provides multiple authentication methods through the `auth` property:

```typescript
// Sign in with email and password
const authConfig = await mosaia.auth.signInWithPassword(
    'user@example.com', 
    'password', 
    'client-id'
);
mosaia.config = authConfig;

// Sign in with client credentials
const authConfig = await mosaia.auth.signInWithClient('client-id', 'client-secret');
mosaia.config = authConfig;

// Refresh token
const authConfig = await mosaia.auth.refreshToken('refresh-token');
mosaia.config = authConfig;

// Sign out
await mosaia.auth.signOut();

// Get session info
const self = await mosaia.getSelf();
```

### Runtime Configuration Updates

The SDK allows updating configuration at runtime:

```typescript
// Update API key
mosaia.apiKey = 'new-api-key-123';

// Update API version
mosaia.version = '2';

// Update API base URL
mosaia.apiURL = 'https://api-staging.mosaia.ai';

// Update OAuth app URL
mosaia.appURL = 'https://app-staging.mosaia.ai';

// Update OAuth client ID
mosaia.clientId = 'new-client-id-123';

// Update OAuth client secret
mosaia.clientSecret = 'new-client-secret-456';
```

### OAuth

The SDK supports OAuth2 Authorization Code flow with PKCE (Proof Key for Code Exchange) for secure authentication.

```typescript
// Initialize OAuth (requires clientId in config)
const oauth = mosaia.oauth({
    redirectUri: 'https://your-app.com/callback',
    scopes: ['read', 'write']
});

// Get authorization URL and code verifier
const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();

// Redirect user to the authorization URL
// After user authorizes, you'll receive a code in your callback

// Exchange code for token (requires the code verifier)
const token = await oauth.exchangeCodeForToken(code, codeVerifier);

// Assign the access token to the SDK for subsequent API calls
mosaia.apiKey = token.access_token;

// Now you can make authenticated API calls
const users = await mosaia.users.get();

// Refresh token when needed
const newToken = await oauth.refreshToken(token.refresh_token);

// Update the SDK with the new access token
mosaia.apiKey = newToken.access_token;
```

**Important Notes:**
- `clientId` must be provided in the SDK configuration
- `appURL` must be provided in the SDK configuration for OAuth authorization URLs
- The `codeVerifier` must be stored securely and used with the same authorization code
- PKCE ensures security even for public clients

### Self Information

Get information about the currently authenticated user:

```typescript
// Get current user and organization information
const self = await mosaia.self();
console.log('User:', self.user);
console.log('Organization:', self.org);
console.log('Org User:', self.orgUser);
```

### Users

```typescript
// Get all users with filtering and pagination
const users = await mosaia.users.get({
    limit: 10,
    offset: 0,
    q: 'john',
    active: true
});

// Get specific user by ID
const user = await mosaia.users.get({}, 'user-id');

// Create new user
const newUser = await mosaia.users.create({
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe'
});

// Update user
const updatedUser = await mosaia.users.update('user-id', {
    first_name: 'Jane'
});

// Delete user
await mosaia.users.delete('user-id');
```

### Organizations

```typescript
// Get all organizations with filtering and pagination
const orgs = await mosaia.organizations.get({
    limit: 10,
    offset: 0,
    q: 'acme',
    active: true
});

// Get specific organization by ID
const org = await mosaia.organizations.get({}, 'org-id');

// Create new organization
const newOrg = await mosaia.organizations.create({
    name: 'Acme Corp',
    short_description: 'A technology company'
});

// Update organization
const updatedOrg = await mosaia.organizations.update('org-id', {
    name: 'Acme Corporation'
});

// Delete organization
await mosaia.organizations.delete('org-id');
```

### Applications

```typescript
// Get all applications
const apps = await mosaia.apps.get();

// Get specific application by ID
const app = await mosaia.apps.get({ id: 'app-id' });

// Create new application
const newApp = await mosaia.apps.create({
    name: 'My App',
    short_description: 'A great app',
    org: 'org-id'
});

// Update application
const updatedApp = await mosaia.apps.update({
    id: 'app-id',
    name: 'Updated App Name'
});

// Delete application
await mosaia.apps.delete({ id: 'app-id' });
```

### Tools

```typescript
// Get all tools with filtering and pagination
const tools = await mosaia.tools.get({
    limit: 10,
    offset: 0,
    q: 'web_search',
    active: true
});

// Get specific tool by ID
const tool = await mosaia.tools.get({}, 'tool-id');

// Create new tool
const newTool = await mosaia.tools.create({
    name: 'My Tool',
    short_description: 'A useful tool',
    tool_schema: '{"type": "object", "properties": {...}}'
});

// Update tool
const updatedTool = await mosaia.tools.update('tool-id', {
    name: 'Updated Tool Name'
});

// Delete tool
await mosaia.tools.delete('tool-id');
```

### Agents

```typescript
// Get all agents with filtering and pagination
const agents = await mosaia.agents.get({
    limit: 10,
    offset: 0,
    q: 'assistant',
    active: true,
    public: true
});

// Get specific agent by ID
const agent = await mosaia.agents.get({}, 'agent-id');

// Create new agent
const newAgent = await mosaia.agents.create({
    name: 'Helpful Assistant',
    short_description: 'A helpful AI assistant',
    model: 'model-id',
    system_prompt: 'You are a helpful assistant.'
});

// Update agent
const updatedAgent = await mosaia.agents.update('agent-id', {
    name: 'Updated Assistant Name'
});

// Delete agent
await mosaia.agents.delete('agent-id');

// Chat completion with agent (using agent instance)
if (agent instanceof Agent) {
    const response = await agent.chatCompletion({
        messages: [
            { role: 'user', content: 'Hello, how are you?' }
        ],
        max_tokens: 100,
        temperature: 0.7
    });
    console.log('Response:', response.choices[0].message);
}

// Upload agent image
if (agent instanceof Agent) {
    const file = new File(['image data'], 'agent-avatar.png', { type: 'image/png' });
    await agent.uploadImage(file);
}
```

### Agent Groups

```typescript
// Get all agent groups with filtering and pagination
const groups = await mosaia.agentGroups.get({
    limit: 10,
    offset: 0,
    q: 'team',
    active: true,
    public: true
});

// Get specific agent group by ID
const group = await mosaia.agentGroups.get({}, 'group-id');

// Create new agent group
const newGroup = await mosaia.agentGroups.create({
    name: 'Team of Agents',
    short_description: 'A collaborative team of AI agents',
    agents: ['agent-1', 'agent-2', 'agent-3']
});

// Update agent group
const updatedGroup = await mosaia.agentGroups.update('group-id', {
    name: 'Updated Team Name'
});

// Delete agent group
await mosaia.agentGroups.delete('group-id');

// Chat completion with agent group
if (group instanceof AgentGroup) {
    const response = await group.chatCompletion({
        messages: [
            { role: 'user', content: 'Hello team!' }
        ],
        max_tokens: 100,
        temperature: 0.7
    });
    console.log('Team response:', response.choices[0].message);
}
```

### Models

```typescript
// Get all models with filtering and pagination
const models = await mosaia.models.get({
    limit: 10,
    offset: 0,
    q: 'gpt',
    provider: 'openai',
    active: true,
    public: true
});

// Get specific model by ID
const model = await mosaia.models.get({}, 'model-id');

// Create new model
const newModel = await mosaia.models.create({
    name: 'GPT-4',
    short_description: 'Advanced language model',
    provider: 'openai',
    model_id: 'gpt-4',
    max_tokens: 4096
});

// Update model
const updatedModel = await mosaia.models.update('model-id', {
    name: 'Updated Model Name'
});

// Delete model
await mosaia.models.delete('model-id');

// Chat completion with model (OpenAI compatible)
if (model instanceof Model) {
    const response = await model.chatCompletion({
        messages: [
            { role: 'user', content: 'Hello!' }
        ],
        max_tokens: 100,
        temperature: 0.7
    });
    console.log('Model response:', response.choices[0].message);
}
```

### Clients

```typescript
// Get all clients with filtering and pagination
const clients = await mosaia.clients.get({
    limit: 10,
    offset: 0,
    q: 'webapp',
    active: true,
    org: 'org-id',
    user: 'user-id'
});

// Get specific client by ID
const client = await mosaia.clients.get({}, 'client-id');

// Create new client
const newClient = await mosaia.clients.create({
    name: 'Web Application',
    client_id: 'webapp-client',
    org: 'org-id',
    redirect_uris: ['https://app.example.com/callback'],
    scopes: ['read', 'write']
});

// Update client
const updatedClient = await mosaia.clients.update('client-id', {
    name: 'Updated App Name'
});

// Delete client
await mosaia.clients.delete('client-id');
```

### App Bots

```typescript
// Get all app bots
const appBots = await mosaia.appBots.get();

// Get specific app bot by ID
const appBot = await mosaia.appBots.get({}, 'app-bot-id');

// Create new app bot
const newAppBot = await mosaia.appBots.create({
    app: 'app-id',
    response_url: 'https://webhook.example.com/callback',
    agent: 'agent-id'
});

// Update app bot
const updatedAppBot = await mosaia.appBots.update('app-bot-id', {
    response_url: 'https://new-webhook.example.com/callback'
});

// Delete app bot
await mosaia.appBots.delete('app-bot-id');
```

### Organization Users

```typescript
// Get all organization users
const orgUsers = await mosaia.orgUsers.get({
    limit: 10,
    offset: 0,
    org: 'org-id',
    user: 'user-id'
});

// Get specific organization user by ID
const orgUser = await mosaia.orgUsers.get({}, 'org-user-id');

// Create new organization user
const newOrgUser = await mosaia.orgUsers.create({
    org: 'org-id',
    user: 'user-id',
    permission: 'member'
});

// Update organization user
const updatedOrgUser = await mosaia.orgUsers.update('org-user-id', {
    permission: 'admin'
});

// Delete organization user
await mosaia.orgUsers.delete('org-user-id');

// Get organization user session
if (orgUser instanceof OrgUser) {
    const session = await orgUser.session();
    console.log('Org user session:', session);
}
```

## Model Classes

The SDK provides model classes that extend the base functionality with entity-specific methods:

### Agent Model

```typescript
import { Agent } from '@mosaia/mosaia-node-sdk';

// Agent instances have additional methods
const agent = new Agent({
    name: 'Customer Support Agent',
    short_description: 'AI agent for customer inquiries',
    model: 'gpt-4',
    system_prompt: 'You are a helpful customer support agent.'
});

// Upload agent image
const file = new File(['image data'], 'agent-avatar.png', { type: 'image/png' });
await agent.uploadImage(file);

// Chat completion with agent
const response = await agent.chatCompletion({
    messages: [
        { role: 'user', content: 'How can I reset my password?' }
    ],
    max_tokens: 150,
    temperature: 0.7
});
```

### User Model

```typescript
import { User } from '@mosaia/mosaia-node-sdk';

// User instances have organization access
const user = new User({
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe'
});

// Access user's organizations
const orgs = await user.orgs.get();

// Get specific organization
const org = await user.orgs.get({}, 'org-id');
```

### Organization Model

```typescript
import { Organization } from '@mosaia/mosaia-node-sdk';

// Organization instances have user access
const org = new Organization({
    name: 'Acme Corp',
    short_description: 'A technology company'
});

// Access organization's users
const users = await org.users.get();

// Get specific user
const user = await org.users.get({}, 'user-id');
```

## Error Handling

The SDK provides structured error handling with the `isSdkError` utility:

```typescript
import { isSdkError } from '@mosaia/mosaia-node-sdk';

try {
    const users = await mosaia.users.get();
} catch (error) {
    if (isSdkError(error)) {
        console.error('SDK Error:', error.message);
        console.error('Status:', error.status);
        console.error('Code:', error.code);
    } else {
        console.error('Unexpected error:', error);
    }
}
```

## Response Types

All API methods return the raw response data from the API. For example, if you request a user, you will receive an object like `{ id: 'user-id', name: 'John Doe', ... }` rather than a wrapped object. For list endpoints, you will receive an array or a paginated object as returned by the API.

## Pagination

Many endpoints support pagination with the following parameters:

```typescript
interface PagingInterface {
    offset?: number;
    limit?: number;
    total?: number;
    page?: number;
    total_pages?: number;
}
```

## Testing

The SDK includes comprehensive test coverage for all API endpoints. You can run the tests using:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test -- --testPathPattern="models.test.ts"
```

### Test Coverage

- ✅ **Authentication Tests** - OAuth flows, sign in, token refresh
- ✅ **Users API Tests** - CRUD operations, filtering, pagination
- ✅ **Organizations API Tests** - Organization management
- ✅ **Agents API Tests** - Agent management and chat completion
- ✅ **Agent Groups API Tests** - Multi-agent collaboration
- ✅ **Models API Tests** - Model management and OpenAI-compatible chat completion
- ✅ **Clients API Tests** - OAuth client management
- ✅ **Apps API Tests** - Application management
- ✅ **Tools API Tests** - Tool management
- ✅ **App Bots API Tests** - Application-bot integrations
- ✅ **Organization Users API Tests** - User-organization relationships

## What's New

### Version 0.1.0
- 🔧 **Configuration Management**: Centralized configuration manager with runtime updates
- 🔧 **Enhanced Authentication**: Improved password-based and OAuth authentication flows
- 🔧 **Model Classes**: Entity-specific model classes with additional functionality
- 🔧 **Runtime Configuration**: Ability to update SDK configuration at runtime
- 🧪 **Enhanced Test Coverage**: Added comprehensive test suites for all APIs
- 🔧 **Code Quality**: Removed generated JavaScript files to keep codebase clean
- 🔧 **Improved .gitignore**: Better patterns to prevent build artifacts from being committed
- ✅ **Complete API Coverage**: All Mosaia API endpoints implemented
- ✅ **Authentication API**: Sign in, refresh tokens, session management
- ✅ **Users API**: Full user management with filtering and pagination
- ✅ **Organizations API**: Organization CRUD operations
- ✅ **Agents API**: AI agent management with chat completion and image upload
- ✅ **Agent Groups API**: Multi-agent collaboration
- ✅ **Models API**: AI model management with OpenAI-compatible chat completion
- ✅ **Clients API**: OAuth client management
- ✅ **Apps API**: Application management
- ✅ **Tools API**: Tool management
- ✅ **App Bots API**: Application-bot integrations
- ✅ **Organization Users API**: User-organization relationships
- ✅ **TypeScript Support**: Full type definitions and IntelliSense
- ✅ **Comprehensive Test Suite**: 100% test coverage
- ✅ **OAuth Support**: PKCE flow implementation
- ✅ **Error Handling**: Structured error responses

### Version 0.0.10
- 🔧 **Configuration Improvements**: `baseURL` → `apiURL`, `frontendURL` → `appURL`
- 🔧 **OAuth URL Fix**: Authorization URLs now use configured `appURL` instead of hardcoded defaults
- 🔧 **Enhanced OAuth Security**: Proper validation for required configuration parameters
- ✅ **Complete API Coverage**: All Mosaia API endpoints implemented
- ✅ **Authentication API**: Sign in, refresh tokens, session management
- ✅ **Users API**: Full user management with filtering and pagination
- ✅ **Organizations API**: Organization CRUD operations
- ✅ **Agents API**: AI agent management with chat completion
- ✅ **Agent Groups API**: Multi-agent collaboration
- ✅ **Models API**: AI model management with OpenAI-compatible chat completion
- ✅ **Clients API**: OAuth client management
- ✅ **Billing API**: Wallet and meter operations
- ✅ **Permissions API**: Access policies and permission management
- ✅ **TypeScript Support**: Full type definitions and IntelliSense
- ✅ **Comprehensive Test Suite**: 100% test coverage
- ✅ **OAuth Support**: PKCE flow implementation
- ✅ **Error Handling**: Structured error responses

## Development

### Code Quality

The SDK maintains high code quality standards:

- **TypeScript**: Full type safety with comprehensive type definitions
- **Clean Codebase**: No generated JavaScript files in source directories
- **Comprehensive Testing**: 100% test coverage for all API endpoints
- **Linting**: ESLint configuration for code consistency
- **Documentation**: JSDoc comments for all public APIs

### Build Process

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Project Structure

```
src/
├── apis/           # API endpoint implementations
├── models/         # Entity model classes
├── oauth/          # OAuth authentication
├── utils/          # Utility functions
├── __tests__/      # Test files
├── config.ts       # Configuration management
├── index.ts        # Main SDK entry point
└── types.ts        # TypeScript type definitions
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
