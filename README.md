# Mosaia Node.js SDK

TypeScript SDK for constructing 3rd party app integrations on the Mosaia platform.

## Features

- **Full TypeScript Support**: Complete type definitions for all API endpoints
- **Authentication**: OAuth 2.0 and API key authentication with PKCE support
- **Comprehensive API Coverage**: Users, Organizations, Agents, Tools, Apps, and more
- **Built-in Documentation**: Comprehensive TSDoc/JSDoc support with automatic TypeDoc generation
- **Error Handling**: Standardized error responses and validation
- **Configuration Management**: Centralized configuration with singleton pattern and environment support
- **GitHub Pages Integration**: Automatic documentation deployment on version releases
- **Development Tools**: Complete development workflow with testing, building, and documentation generation

## Installation

```bash
npm install @mosaia/mosaia-node-sdk
```

## Quick Start

```typescript
import * as Mosaia from '@mosaia/mosaia-node-sdk';

// Initialize the SDK
const mosaia = new Mosaia.MosaiaClient({
  apiKey: 'your-api-key',
  apiURL: 'https://api.mosaia.ai',
  clientId: 'your-client-id'
});

// Get all users
const users = await mosaia.users.get();

// Create an OAuth instance
const oauth = mosaia.oauth({
  redirectUri: 'https://your-app.com/callback',
  scopes: ['read', 'write']
});
```

## Documentation

### Online Documentation

📚 **Live Documentation**: [View the latest API documentation](https://mosaia-development.github.io/mosaia-node-sdk/)

The documentation is automatically generated and deployed on every version release, providing:
- **Complete API Reference**: All classes, methods, and types with detailed descriptions
- **Interactive Examples**: Code examples for every API endpoint
- **Type Definitions**: Full TypeScript interface documentation
- **Search and Navigation**: Easy-to-use search and category-based navigation
- **Version Information**: Documentation specific to each SDK version

### Local Documentation Generation

Generate comprehensive API documentation locally using TypeDoc:

```bash
# Generate documentation
npm run docs

# Build and generate documentation
npm run docs:build

# Watch for changes and regenerate documentation
npm run docs:watch
```

The generated documentation will be available in the `docs/` folder and includes:

- **HTML Documentation**: Complete API reference with search and navigation
- **Type Definitions**: Generated TypeScript declaration files
- **Examples**: Code examples from `@example` tags
- **Categories**: Grouped APIs based on `@category` tags
- **Cross-references**: Links between related classes and methods

### Writing Documentation

The SDK supports comprehensive TSDoc and JSDoc comment formats with full TypeDoc integration. All source files include detailed documentation with examples, parameter descriptions, and return type information.

#### TSDoc Example

```typescript
/**
 * Creates a new user in the system
 * 
 * @param userData - The user data to create
 * @param userData.email - User's email address
 * @param userData.firstName - User's first name
 * @param userData.lastName - User's last name
 * @returns Promise that resolves to the created user
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'john@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * ```
 * 
 * @throws {ValidationError} When user data is invalid
 * @throws {AuthenticationError} When API key is invalid
 */
async function createUser(userData: UserData): Promise<User> {
  // Implementation
}
```

## API Reference

### Configuration Management

The SDK provides a robust configuration management system with singleton pattern:

```typescript
import { ConfigurationManager } from '@mosaia/mosaia-node-sdk';

// Get the singleton configuration manager
const configManager = ConfigurationManager.getInstance();

// Initialize with user configuration
configManager.initialize({
  apiKey: 'your-api-key',
  apiURL: 'https://api.mosaia.ai',
  version: '1',
  clientId: 'your-client-id'
});

// Update configuration at runtime
configManager.updateConfig('apiKey', 'new-api-key');
configManager.updateConfig('version', '2');

// Get read-only configuration
const readOnlyConfig = configManager.getReadOnlyConfig();
```

### Authentication

#### OAuth 2.0 with PKCE Support

```typescript
// Create OAuth instance with PKCE
const oauth = mosaia.oauth({
  redirectUri: 'https://your-app.com/callback',
  scopes: ['read', 'write']
});

// Get authorization URL and code verifier
const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();

// Redirect user to authorization URL
// After user authorizes, exchange code for tokens
const newConfig = await oauth.authenticateWithCodeAndVerifier(code, codeVerifier);

// Create new authenticated instance
const authenticatedMosaia = new Mosaia.MosaiaClient(newConfig);
```

#### API Key Authentication

```typescript
// Initialize with API key
const mosaia = new Mosaia.MosaiaClient({
  apiKey: 'your-api-key'
});

// Update API key at runtime
mosaia.apiKey = 'new-api-key';
```

### Users

```typescript
// Get all users with pagination and filtering
const users = await mosaia.users.get({
  limit: 10,
  offset: 0,
  q: 'john',
  tags: ['admin'],
  active: true
});

// Get user by ID
const user = await mosaia.users.get({}, 'user-id');

// Create user
const newUser = await mosaia.users.create({
  email: 'john@example.com',
  name: 'John Doe',
  username: 'johndoe',
  description: 'Software Engineer'
});
```

### Organizations

```typescript
// Get all organizations
const orgs = await mosaia.organizations.get({
  limit: 20,
  q: 'technology'
});

// Get organization by ID
const org = await mosaia.organizations.get({}, 'org-id');

// Create organization
const newOrg = await mosaia.organizations.create({
  name: 'My Organization',
  shortDescription: 'A great organization',
  longDescription: 'Detailed description of the organization',
  image: 'https://example.com/logo.png'
});
```

### Agents

```typescript
// Get all agents
const agents = await mosaia.agents.get({
  tags: ['support', 'automation'],
  active: true
});

// Get agent by ID
const agent = await mosaia.agents.get({}, 'agent-id');

// Create agent
const newAgent = await mosaia.agents.create({
  name: 'My Agent',
  shortDescription: 'A helpful AI agent',
  longDescription: 'Detailed description of the agent capabilities',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: 'You are a helpful assistant.',
  tags: ['support', 'ai']
});

// Chat completion with agent
const completion = await mosaia.agents.chatCompletion('agent-id', {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello, how can you help me?' }]
});
```

### Agent Groups

```typescript
// Get all agent groups
const groups = await mosaia.agentGroups.get();

// Get agent group by ID
const group = await mosaia.agentGroups.get({}, 'group-id');

// Create agent group
const newGroup = await mosaia.agentGroups.create({
  name: 'Support Team',
  shortDescription: 'Multi-agent support system',
  agents: ['agent-1', 'agent-2', 'agent-3'],
  tags: ['support', 'multi-agent']
});

// Chat completion with agent group
const completion = await mosaia.agentGroups.chatCompletion('group-id', {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'I need help with my account' }]
});
```

### Tools

```typescript
// Get all tools
const tools = await mosaia.tools.get({
  tags: ['api', 'integration'],
  public: true
});

// Get tool by ID
const tool = await mosaia.tools.get({}, 'tool-id');

// Create tool
const newTool = await mosaia.tools.create({
  name: 'My Tool',
  friendlyName: 'My Custom Tool',
  shortDescription: 'A useful tool for API integration',
  toolSchema: JSON.stringify({
    type: 'object',
    properties: {
      input: { type: 'string' },
      options: { type: 'object' }
    },
    required: ['input']
  }),
  requiredEnvironmentVariables: ['API_KEY', 'BASE_URL'],
  sourceUrl: 'https://github.com/example/tool',
  tags: ['api', 'integration']
});
```

### Apps

```typescript
// Get all apps
const apps = await mosaia.apps.get({
  org: 'org-id',
  tags: ['webhook', 'integration']
});

// Get app by ID
const app = await mosaia.apps.get({}, 'app-id');

// Create app
const newApp = await mosaia.apps.create({
  name: 'My App',
  shortDescription: 'A great application',
  longDescription: 'Detailed description of the application',
  externalAppUrl: 'https://my-app.com',
  externalApiKey: 'app-api-key',
  externalHeaders: {
    'X-Custom-Header': 'custom-value'
  },
  tags: ['webhook', 'integration'],
  keywords: ['api', 'automation']
});
```

### Models

```typescript
// Get all models
const models = await mosaia.models.get({
  provider: 'openai',
  active: true
});

// Get model by ID
const model = await mosaia.models.get({}, 'model-id');

// Create model
const newModel = await mosaia.models.create({
  name: 'My Custom Model',
  shortDescription: 'Custom AI model configuration',
  provider: 'openai',
  modelId: 'gpt-4',
  maxTokens: 4000,
  temperature: 0.7,
  tags: ['custom', 'gpt-4']
});
```

## Configuration

The SDK supports comprehensive configuration options with runtime updates:

```typescript
const config: MosaiaConfig = {
  // Authentication
  apiKey: 'your-api-key',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  
  // API Settings
  apiURL: 'https://api.mosaia.ai',
  version: '1',
  
  // Context
  user: 'user-id',
  org: 'org-id',
  
  // Debugging
  verbose: true,
  
  // Session (for OAuth)
  session: {
    accessToken: 'token',
    refreshToken: 'refresh-token',
    authType: 'oauth',
    sub: 'user-123',
    iat: '1640995200',
    exp: '1640998800'
  }
};

// Runtime configuration updates
mosaia.apiKey = 'new-api-key';
mosaia.version = '2';
mosaia.apiURL = 'https://api-staging.mosaia.ai';
mosaia.clientId = 'new-client-id';
mosaia.clientSecret = 'new-client-secret';
```

## Error Handling

The SDK provides comprehensive error handling with standardized error responses:

```typescript
try {
  const users = await mosaia.users.get();
} catch (error) {
  if (error.code === 'AUTHENTICATION_ERROR') {
    // Handle authentication errors
    console.error('Authentication failed:', error.message);
  } else if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
    console.error('Validation failed:', error.message);
  } else if (error.code === 'RATE_LIMIT_ERROR') {
    // Handle rate limiting
    console.error('Rate limit exceeded:', error.message);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error.message);
  }
}
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Generate documentation
npm run docs
```

### Scripts

- `npm run build` - Build the TypeScript project
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:runner` - Run integration tests
- `npm run test:all` - Run all tests with coverage
- `npm run docs` - Generate API documentation
- `npm run docs:build` - Build and generate documentation
- `npm run docs:watch` - Watch for changes and regenerate documentation

### CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow that:

1. **Builds** the TypeScript project
2. **Generates** comprehensive TSDoc documentation
3. **Deploys** documentation to GitHub Pages
4. **Publishes** the package to NPM

The workflow triggers on version tags (e.g., `v1.0.0`) and automatically:
- Updates package.json version
- Generates and deploys documentation
- Publishes to NPM registry

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

### Documentation Standards

When contributing, please follow the established TSDoc standards:

- Use `@param` for parameter documentation
- Use `@returns` for return value documentation
- Use `@throws` for error conditions
- Use `@example` for usage examples
- Use `@template` for generic type parameters
- Include comprehensive examples for all public APIs

## License

Apache-2.0 License - see [LICENSE](./LICENSE) for details.
