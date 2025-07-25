# @mosaia/mosaia-node-sdk
[![Publish to NPM](https://github.com/mosaia-development/mosaia-node-sdk/actions/workflows/deploy.yml/badge.svg)](https://github.com/mosaia-development/mosaia-node-sdk/actions/workflows/deploy.yml)
![GitHub all releases](https://img.shields.io/github/commit-activity/m/mosaia-development/mosaia-node-sdk)
![GitHub contributors](https://img.shields.io/github/contributors-anon/mosaia-development/mosaia-node-sdk)
![NPM Downloads](https://img.shields.io/npm/dm/%40mosaia%2Fmosaia-node-sdk)

## Mosaia's TypeScript SDK for interfacing with the Mosaia Core platform

A comprehensive Node.js SDK for the Mosaia API platform, providing access to all models and endpoints available in the api-core ExpressJS application.

## Current Features
- Get and manage Mosaia Apps
- Manage agent and group bots
- Agent inference

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
import Mosaia, { AppInterface } from '@mosaia/mosaia-node-sdk';
```
In a JavaScript file:
```javascript
// import entire SDK
const Mosaia = require('@mosaia/mosaia-node-sdk');
```
##### Create a Mosaia instance
In a TypeScript file:
```typescript
const {
    MOSAIA_CORE_URL,
    MOSAIA_CORE_VERSION,
    MOSAIA_API_KEY,
    MOSAIA_FRONTEND_URL,
    MOSAIA_CLIENT_ID,
    MOSAIA_CLIENT_SECRET
} = process.env;
// Apply API configs 
const mosaia = new Mosaia({
    apiKey: MOSAIA_API_KEY as string, // Optional (Only needed if not using client authentication)
    clientId: MOSAIA_CLIENT_ID as string, // Optional (Only needed if not using apiKey)
    clientSecret: MOSAIA_CLIENT_SECRET as string, // Optional (Only needed if not using apiKey)
    version: MOSAIA_CORE_VERSION as string, // Optional (Defaults to 1)
    apiURL: MOSAIA_CORE_URL as string, // Optional (Defaults to https://api.mosaia.ai)
    appURL: MOSAIA_FRONTEND_URL as string // Optional (Defaults to https://mosaia.ai)
});
```

## Quick Start

```typescript
import Mosaia from '@mosaia/mosaia-node-sdk';

const mosaia = new Mosaia({
    apiKey: 'your-api-key', // Optional (Only needed if not using client authentication)
    clientId: 'your-mosaia-client-id', // Optional (Only needed if not using apiKey)
    clientSecret: 'your-mosaia-client-secret' // Optional (Only needed if not using apiKey)
});

// Get all apps
const apps = await mosaia.apps.get();

// Get all tools
const tools = await mosaia.tools.get();

// Get all users
const users = await mosaia.users.getAll();

// Get all organizations
const orgs = await mosaia.organizations.getAll();
```

## Configuration

```typescript
interface MosiaConfig {
    apiKey?: string;        // Optional: for apiKey
    version?: string;       // defaults to 1
    apiURL?: string;        // API base URL (defaults to https://api.mosaia.ai)
    appURL?: string;        // App URL for OAuth flows (defaults to https://mosaia.ai)
    clientId?: string;      // Required for OAuth flows
    clientSecret?: string;  // Optional: for client credentials flow
    user?: string;          // Optional: for user-specific operations
    org?: string;           // Optional: for organization-specific operations
}
```

**Recent Changes:**
- `baseURL` has been renamed to `apiURL` for clarity
- `frontendURL` has been renamed to `appURL` for consistency
- OAuth authorization URLs now use the configured `appURL` instead of hardcoded defaults

## API Reference

### Authentication

```typescript
// Sign in with password
const auth = await mosaia.auth.signInWithPassword(email, password, clientId);

// Sign in with client credentials
const auth = await mosaia.auth.signInWithClient(clientId, clientSecret);

// Refresh token
const auth = await mosaia.auth.refreshToken(refreshToken);

// Sign out
await mosaia.auth.signOut();

// Get session info
const session = await mosaia.auth.getSession();

// Get self info
const self = await mosaia.auth.getSelf();
```

### Users

```typescript
// Get all users
const users = await mosaia.users.getAll({
    limit: 10,
    offset: 0,
    search: 'john',
    active: true
});

// Get user by ID
const user = await mosaia.users.getById('user-id');

// Create user
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

// Get user session
const session = await mosaia.users.getSession('user-id');
```

### Organizations

```typescript
// Get all organizations
const orgs = await mosaia.organizations.getAll({
    limit: 10,
    offset: 0,
    search: 'acme',
    active: true
});

// Get organization by ID
const org = await mosaia.organizations.getById('org-id');

// Create organization
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

### Apps

```typescript
// Get all apps
const apps = await mosaia.apps.get();

// Get app by ID
const app = await mosaia.apps.get({ id: 'app-id' });

// Create app
const newApp = await mosaia.apps.create({
    name: 'My App',
    short_description: 'A great app',
    org: 'org-id'
});

// Update app
const updatedApp = await mosaia.apps.update({
    id: 'app-id',
    name: 'Updated App Name'
});

// Delete app
await mosaia.apps.delete({ id: 'app-id' });
```

### Tools

```typescript
// Get all tools
const tools = await mosaia.tools.getAll({
    limit: 10,
    offset: 0,
    search_type: 'web_search',
    search_types: ['web_search', 'database'],
    q: 'search query'
});

// Get tool by ID
const tool = await mosaia.tools.getById('tool-id');

// Create tool
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
// Get all agents
const agents = await mosaia.agents.getAll({
    limit: 10,
    offset: 0,
    search: 'assistant',
    search_type: 'chat',
    q: 'helpful assistant',
    active: true,
    public: true
});

// Get agent by ID
const agent = await mosaia.agents.getById('agent-id');

// Create agent
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

// Chat completion with agent
const response = await mosaia.agents.chatCompletion({
    model: 'agent-id',
    messages: [
        { role: 'user', content: 'Hello, how are you?' }
    ],
    max_tokens: 100,
    temperature: 0.7
});

// Async chat completion
const response = await mosaia.agents.asyncChatCompletion({
    model: 'agent-id',
    messages: [
        { role: 'user', content: 'Hello, how are you?' }
    ],
    type: 'async',
    max_tokens: 100
});
```

### Agent Groups

```typescript
// Get all agent groups
const groups = await mosaia.agentGroups.getAll({
    limit: 10,
    offset: 0,
    search: 'team',
    q: 'collaborative team',
    active: true,
    public: true
});

// Get agent group by ID
const group = await mosaia.agentGroups.getById('group-id');

// Create agent group
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
const response = await mosaia.agentGroups.chatCompletion({
    model: 'group-id',
    messages: [
        { role: 'user', content: 'Hello team!' }
    ],
    max_tokens: 100,
    temperature: 0.7
});
```

### Models

```typescript
// Get all models
const models = await mosaia.models.getAll({
    limit: 10,
    offset: 0,
    search: 'gpt',
    provider: 'openai',
    active: true,
    public: true
});

// Get model by ID
const model = await mosaia.models.getById('model-id');

// Create model
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
const response = await mosaia.models.chatCompletion({
    model: 'gpt-4',
    messages: [
        { role: 'user', content: 'Hello!' }
    ],
    max_tokens: 100,
    temperature: 0.7
});
```

### Clients

```typescript
// Get all clients
const clients = await mosaia.clients.getAll({
    limit: 10,
    offset: 0,
    search: 'webapp',
    active: true,
    org: 'org-id',
    user: 'user-id'
});

// Get client by ID
const client = await mosaia.clients.getById('client-id');

// Create client
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

### Billing

```typescript
// Wallet operations
const wallets = await mosaia.billing.getWallets({
    limit: 10,
    offset: 0,
    org: 'org-id',
    user: 'user-id'
});

const wallet = await mosaia.billing.getWallet('wallet-id');

const newWallet = await mosaia.billing.createWallet({
    balance: 100.00,
    currency: 'USD',
    org: 'org-id'
});

const updatedWallet = await mosaia.billing.updateWallet('wallet-id', {
    balance: 150.00
});

await mosaia.billing.deleteWallet('wallet-id');

// Meter operations
const meters = await mosaia.billing.getMeters({
    limit: 10,
    offset: 0,
    org: 'org-id',
    user: 'user-id',
    type: 'api_calls'
});

const meter = await mosaia.billing.getMeter('meter-id');

const newMeter = await mosaia.billing.createMeter({
    type: 'api_calls',
    value: 1000,
    org: 'org-id',
    metadata: { endpoint: '/v1/chat/completions' }
});

const updatedMeter = await mosaia.billing.updateMeter('meter-id', {
    value: 1500
});

await mosaia.billing.deleteMeter('meter-id');
```

### Permissions

```typescript
// Access Policy operations
const policies = await mosaia.permissions.getAccessPolicies({
    limit: 10,
    offset: 0,
    search: 'admin',
    active: true
});

const policy = await mosaia.permissions.getAccessPolicy('policy-id');

const newPolicy = await mosaia.permissions.createAccessPolicy({
    name: 'Admin Policy',
    effect: 'allow',
    actions: ['*'],
    resources: ['*']
});

const updatedPolicy = await mosaia.permissions.updateAccessPolicy('policy-id', {
    name: 'Updated Policy Name'
});

await mosaia.permissions.deleteAccessPolicy('policy-id');

// Org Permission operations
const orgPermissions = await mosaia.permissions.getOrgPermissions({
    limit: 10,
    offset: 0,
    org: 'org-id',
    user: 'user-id',
    client: 'client-id'
});

const orgPermission = await mosaia.permissions.getOrgPermission('permission-id');

const newOrgPermission = await mosaia.permissions.createOrgPermission({
    org: 'org-id',
    user: 'user-id',
    policy: 'policy-id'
});

const updatedOrgPermission = await mosaia.permissions.updateOrgPermission('permission-id', {
    policy: 'new-policy-id'
});

await mosaia.permissions.deleteOrgPermission('permission-id');

// User Permission operations
const userPermissions = await mosaia.permissions.getUserPermissions({
    limit: 10,
    offset: 0,
    user: 'user-id',
    client: 'client-id'
});

const userPermission = await mosaia.permissions.getUserPermission('permission-id');

const newUserPermission = await mosaia.permissions.createUserPermission({
    user: 'user-id',
    client: 'client-id',
    policy: 'policy-id'
});

const updatedUserPermission = await mosaia.permissions.updateUserPermission('permission-id', {
    policy: 'new-policy-id'
});

await mosaia.permissions.deleteUserPermission('permission-id');
```

## OAuth

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

// Refresh token when needed
const newToken = await oauth.refreshToken(token.refresh_token);
```

**Important Notes:**
- `clientId` must be provided in the SDK configuration
- `appURL` must be provided in the SDK configuration for OAuth authorization URLs
- The `codeVerifier` must be stored securely and used with the same authorization code
- PKCE ensures security even for public clients

## Error Handling

```typescript
import { isSdkError } from 'mosaia-node-sdk';

try {
    const users = await mosaia.users.getAll();
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

## Models

The SDK includes model classes for working with entities:

```typescript
import { App, Tool, AppBot } from 'mosaia-node-sdk';

// Get an app and work with its bots
const app = await mosaia.apps.get({ id: 'app-id' });
if (app) {
    const bots = await app.bots.get();
}
```

## What's New

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
- ✅ **Models API**: AI model management
- ✅ **Clients API**: OAuth client management
- ✅ **Billing API**: Wallet and meter operations
- ✅ **Permissions API**: Access policies and permission management
- ✅ **TypeScript Support**: Full type definitions and IntelliSense
- ✅ **Comprehensive Test Suite**: 100% test coverage
- ✅ **OAuth Support**: PKCE flow implementation
- ✅ **Error Handling**: Structured error responses

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
