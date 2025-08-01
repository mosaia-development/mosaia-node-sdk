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
- **Comprehensive Testing** - Full test coverage for all API endpoints (499 tests)
- **Zero Dependencies** - Lightweight SDK with no production dependencies
- **Native Fetch API** - Modern HTTP client using native fetch instead of axios

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
    CLIENT_ID,
    USER_EMAIL,
    USER_PASSWORD
} = process.env;

const mosaia = new Mosaia({
    apiURL: API_URL,           // Optional (Defaults to https://api.mosaia.ai)
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
    CLIENT_ID,
    USER_EMAIL,
    USER_PASSWORD
} = process.env;

async function main() {
    // Initialize SDK
    const mosaia = new Mosaia({
        apiURL: API_URL,
        clientId: CLIENT_ID
    });

    // Authenticate with password
    mosaia.config = await mosaia.auth.signInWithPassword(
        USER_EMAIL!,
        USER_PASSWORD!
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
interface SessionCredentials {
    accessToken: string;       // Access token for authentication
    refreshToken: string;      // Refresh token for token refresh operations
    authType?: 'password' | 'client' | 'refresh' | 'oauth'; // Authentication type
    sub?: string;             // Subject identifier (user ID)
    iat?: string;             // Token issued at timestamp
    exp?: string;             // Token expiration timestamp
}
```

interface MosaiaConfig {
    apiKey?: string;           // API key for authentication (optional)
    version?: string;          // API version (defaults to '1')
    apiURL?: string;          // API base URL (defaults to https://api.mosaia.ai)
    clientId?: string;        // Client ID for OAuth flows (required for OAuth)
    clientSecret?: string;    // Client secret for client credentials flow (optional)
    verbose?: boolean;        // Enable verbose logging (defaults to false)
    session?: SessionCredentials; // Session credentials for OAuth and token-based auth
}
```

### OAuth Configuration

The OAuth configuration interface allows you to specify OAuth-specific parameters:

```typescript
interface OAuthConfig {
    redirectUri: string;       // Redirect URI for the OAuth flow (required)
    scopes: string[];         // Array of scopes to request (required)
    appURL?: string;          // App URL for authorization endpoints (optional, defaults to https://mosaia.ai)
    clientId?: string;        // OAuth client ID (optional, merged from SDK config if not provided)
    apiURL?: string;          // API URL for token endpoints (optional, merged from SDK config if not provided)
    apiVersion?: string;      // API version (optional, merged from SDK config if not provided)
    state?: string;           // State parameter for CSRF protection (optional)
}
```

**Configuration Merging:**
- The OAuth constructor automatically merges missing configuration values from the SDK's default configuration
- If `clientId`, `apiURL`, or `apiVersion` are not provided in the OAuth config, they will be taken from the SDK configuration
- If `appURL` is not provided in the OAuth config, it defaults to `https://mosaia.ai`
- **Required after merging**: `clientId`, `apiURL`, `apiVersion`, `appURL`, and `scopes` must be available after merging (either from OAuth config or SDK config)
- This allows for flexible configuration where you can provide only the OAuth-specific parameters

**Configuration Management:**
- The SDK uses a centralized `ConfigurationManager` for consistent configuration across all components
- Configuration can be updated at runtime using setter methods
- All configuration changes are immediately reflected across the SDK

### PKCE Implementation

The SDK implements PKCE (Proof Key for Code Exchange) according to RFC 7636:

**Code Verifier Generation:**
- Generates cryptographically secure random code verifiers using `crypto.randomBytes(96)`
- Uses base64url encoding (RFC 4648) for URL-safe representation
- Produces 128-character code verifiers (RFC 7636 compliant)
- Ensures sufficient entropy for security

**Code Challenge Generation:**
- Creates SHA256 hash of the code verifier
- Uses base64url encoding for the challenge
- Implements the `S256` challenge method as specified in RFC 7636
- No padding characters, no special characters that need URL encoding

**Security Features:**
- RFC 7636 compliant implementation
- Cryptographically secure random generation
- Proper base64url encoding throughout
- Automatic validation of required parameters

## API Reference

### Authentication

The SDK provides multiple authentication methods through the `auth` property:

```typescript
// Sign in with email and password (clientId from config)
const authConfig = await mosaia.auth.signInWithPassword(
    'user@example.com', 
    'password'
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

// Update OAuth client ID
mosaia.clientId = 'new-client-id-123';

// Update OAuth client secret
mosaia.clientSecret = 'new-client-secret-456';

// Update session credentials
mosaia.session = {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
    authType: 'oauth',
    sub: 'user-123',
    iat: '1640995200',
    exp: '1640998800'
};
```

### OAuth

The SDK supports OAuth2 Authorization Code flow with PKCE (Proof Key for Code Exchange) for secure authentication. The OAuth implementation is fully RFC 7636 compliant.

```typescript
// Initialize OAuth
const oauth = mosaia.oauth({
    redirectUri: 'https://your-app.com/callback',
    scopes: ['read', 'write'],  // Required: specify the scopes you need
    appURL: 'https://mosaia.ai' // Required: specify the app URL for authorization
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
- `redirectUri`, `scopes`, and `appURL` are required parameters in the OAuth config
- `clientId`, `apiURL`, and `apiVersion` can be provided in either the OAuth config or the SDK configuration
- `appURL` can be provided in the OAuth config or defaults to `https://mosaia.ai`
- The OAuth constructor validates that all required values are available after merging configurations
- The `codeVerifier` must be stored securely and used with the same authorization code
- PKCE ensures security even for public clients
- Code verifiers are now RFC 7636 compliant (128 characters, base64url encoded)

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
Retrieve a list of 
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

// Query all agents that belong to an organization filtering and pagination
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

### Version 0.0.14
- 🚀 **Zero Dependencies**: Removed all production dependencies (axios, openai) for a lightweight SDK
- 🔧 **Native Fetch API**: Replaced axios with native fetch API for better performance and smaller bundle size
- 🔧 **Dependency Audit**: Comprehensive audit and removal of unused dependencies
- 🔧 **Enhanced Error Handling**: Improved error handling with native fetch API
- 🔧 **Verbose Logging**: Enhanced logging capabilities for debugging HTTP requests
- 🔧 **Test Updates**: Updated all tests to work with fetch API instead of axios
- 🧪 **Test Reliability**: Improved test coverage and reliability
- ✅ **All Tests Passing**: 499 tests now pass consistently
- ✅ **Smaller Bundle Size**: Significantly reduced package size due to dependency removal
- ✅ **Better Performance**: Native fetch API provides better performance than axios
- ✅ **Security Improvements**: Fewer dependencies mean fewer potential security vulnerabilities
- 🔧 **Session Credentials Interface**: Created SessionCredentials interface for better token management
- 🔧 **MosaiaConfig Restructuring**: Moved accessToken and refreshToken to SessionCredentials interface
- 🔧 **OAuth PKCE Implementation**: Fixed PKCE code verifier generation to be RFC 7636 compliant
- 🔧 **OAuth Constructor Simplification**: Simplified OAuth constructor to handle configuration merging internally
- 🔧 **OAuth Configuration**: Made scopes required in OAuthConfig interface
- 🔧 **MosaiaConfig Cleanup**: Removed appURL from MosaiaConfig interface (now only in OAuthConfig)
- 🔧 **Configuration Management**: OAuth now properly merges SDK configuration with provided OAuth config
- 🔧 **Code Verifier Length**: Fixed code verifier to generate 128 characters (was 42, now RFC 7636 compliant)
- 🔧 **Base64URL Encoding**: Updated to use proper base64url encoding instead of base64 with character filtering
- 🔧 **Cryptographic Security**: Improved entropy by using 96 bytes for code verifier generation
- 🧪 **Test Updates**: Updated OAuth tests to reflect simplified constructor approach
- ✅ **RFC 7636 Compliance**: PKCE implementation now fully compliant with OAuth 2.0 PKCE specification
- ✅ **All Tests Passing**: 503 tests now pass consistently with improved OAuth implementation

### Version 0.0.13
- 🔧 **Class Name Consistency**: Fixed all references to use correct `MosaiaAuth` class name instead of `Auth`
- 🔧 **Test Suite Fixes**: Resolved failing authentication tests by fixing configuration timing issues
- 🔧 **Documentation Updates**: Updated all JSDoc examples and code comments to use correct class names
- 🔧 **Import Statement Fixes**: Corrected import statements in api-client.ts and test files
- 🧪 **Test Reliability**: Improved test setup to ensure proper configuration synchronization
- ✅ **All Tests Passing**: 503 tests now pass consistently
- ✅ **Code Quality**: Eliminated linter errors and improved type safety
- ✅ **Documentation Accuracy**: README now accurately reflects test count and current implementation

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
- ✅ **Comprehensive Test Suite**: 503 tests with full coverage
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
- ✅ **Comprehensive Test Suite**: 503 tests with full coverage
- ✅ **OAuth Support**: PKCE flow implementation
- ✅ **Error Handling**: Structured error responses

## Development

### Code Quality

The SDK maintains high code quality standards:

- **TypeScript**: Full type safety with comprehensive type definitions
- **Clean Codebase**: No generated JavaScript files in source directories
- **Comprehensive Testing**: 499 tests with full coverage for all API endpoints
- **Linting**: ESLint configuration for code consistency
- **Documentation**: JSDoc comments for all public APIs
- **Zero Dependencies**: Lightweight SDK with no production dependencies
- **Modern HTTP Client**: Uses native fetch API for better performance

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
