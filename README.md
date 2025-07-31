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
    const session = await mosaia.session();
    console.log('Authenticated as:', session.user?.email);

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
const session = await mosaia.session();
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
// Initialize OAuth
const oauth = mosaia.oauth({
    redirectUri: 'https://your-app.com/callback',
    scopes: ['read', 'write']
});

// Get authorization URL and code verifier
const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();

// Redirect user to the authorization URL
// After user authorizes, you'll receive a code in your callback

// Exchange code for new authenticated config (requires the code verifier)
const config = await oauth.authenticateWithCodeAndVerifier(code, codeVerifier);

// create new instance with authenticated config
const mosaia = new Mosaia(config);

// Now you can make authenticated API calls
const users = await mosaia.users.get();

// Refresh token when needed
const newConfig = await mosaia.auth.refresh();

// Update the SDK with the new config
mosaia.config = newConfig;
```

**Important Notes:**
- `clientId` must be provided in the SDK configuration
- `appURL` must be provided in the SDK configuration for OAuth authorization URLs
- The `codeVerifier` must be stored securely and used with the same authorization code
- PKCE ensures security even for public clients

### Session Information

Get information about the currently authenticated user:

```typescript
// Get current user and organization information
const session = await mosaia.session();

console.log('User:', session.user);
console.log('Organization:', session.org);
console.log('Org User:', session.orgUser);
console.log('Client:', session.client);
```

## Data Models and APIs
The example below show cases the general functionality of all data models and APIs

### Collections API

Any parameters that are plural like the "Agents" class will have the ability to query and create entities on behalf of the parent class

#### Queries
Retreieve a list of 
```typescript
// Query all public agents with filtering and pagination
const agents = await mosaia.agents.get({
    limit: 10,
    offset: 0,
    q: 'assistant',
    active: true,
    public: true
});

// Query all agents that belong to a user filtering and pagination
const { user } = await mosaia.session();
const results = await user.agents.get({
    limit: 10,
    offset: 0,
    q: 'assistant',
    active: true
});

// Query all agents that belong to a organization filtering and pagination
const { organization } = await mosaia.session();
const results = await user.agents.get({
    limit: 10,
    offset: 0,
    q: 'assistant',
    active: true
});

// Get specific agent by ID
const { user } = await mosaia.session();
const agent = await user.agents.get({}, 'agent-id');;
```
#### Creates

Create a new entity in the collection on behalf of the owner
```typescript
// To create a new agent that belongs to a user
const { user } = await mosaia.session();
// Create new agent
const newAgent = await user.agents.create({
    name: 'Helpful Assistant',
    short_description: 'A helpful AI assistant',
    model: 'model-id',
    system_prompt: 'You are a helpful assistant.'
});
```
### Entities API

All model entities have the ability to update or destroy the entity object

#### Update
Update the entity with new data

```typescript
// Get specific agent by ID
const { user } = await mosaia.session();
const agent = await user.agents.get({}, 'agent-id');;
// Update with the new name
agent.update({
    name: 'Updated Assistant Name'
});
// Save the new state
await agent.save();
```
#### Delete

Delete the entity
```typescript
// Delete agent
await agent.delete();
```

## Perform an LLM/agent inference call
An inference call is performed on an Agent, AgentGroup or Model entity

```typescript
// Chat completion with agent (using agent instance)
const response = await agent.chatCompletion({
    messages: [
        { role: 'user', content: 'Hello, how are you?' }
    ],
    max_tokens: 100,
    temperature: 0.7
});

// Chat completion with model (using model instance)
const response = await model.chatCompletion({
    messages: [
        { role: 'user', content: 'Hello, how are you?' }
    ],
    max_tokens: 100,
    temperature: 0.7
});
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
