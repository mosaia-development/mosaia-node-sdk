# Mosaia Node.js SDK

TypeScript SDK for constructing 3rd party app integrations on the Mosaia platform.

## Features

- **Full TypeScript Support**: Complete type definitions for all API endpoints
- **Authentication**: OAuth 2.0 and API key authentication with PKCE support
- **Comprehensive API Coverage**: Users, Organizations, Agents, Tools, Apps, App Connectors, App Webhooks, Models, Logs, Tasks, Drives, Search, IAM (Access Policies, Permissions), Billing (Meters, Wallets), and more
- **Full CRUD Operations**: Complete Create, Read, Update, Delete support for all resources
- **Instance Methods**: Model-specific operations like like, fork, chat completions, rerank, embeddings
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

📚 **Latest Release**: [View the latest release documentation](https://mosaia-development.github.io/mosaia-node-sdk/v0.0.25/) | [Browse all versions](https://mosaia-development.github.io/mosaia-node-sdk/) | [Development (Latest)](https://mosaia-development.github.io/mosaia-node-sdk/development/)

> **Note**: Latest version: **v0.0.25**. The link is automatically updated on each release.

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

// Upload user profile image
const file = new File(['image data'], 'profile.jpg', { type: 'image/jpeg' });
const updatedUser = await user.image.upload(file);

// Access user IAM policies
const policies = await user.policies.get();

// Access user permissions
const permissions = await user.permissions.get();
const newPermission = await user.permissions.create({
  client: 'client-id',
  policy: 'policy-id'
});

// Access user usage meters
const meters = await user.meters.get();
const newMeter = await user.meters.create({
  type: 'api_calls',
  value: 500
});

// Access user wallets
const wallet = await user.wallets.get();
const newWallet = await user.wallets.create({
  balance: 100.00,
  currency: 'USD'
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

// Upload organization profile image
const file = new File(['image data'], 'logo.png', { type: 'image/png' });
const updatedOrg = await org.image.upload(file);

// Access organization IAM policies
const policies = await org.policies.get();
const newPolicy = await org.policies.create({
  name: 'Admin Access',
  effect: 'allow',
  actions: ['*'],
  resources: ['*']
});

// Access organization permissions
const permissions = await org.permissions.get();
const newPermission = await org.permissions.create({
  user: 'user-id',
  policy: 'policy-id'
});

// Access organization usage meters
const meters = await org.meters.get();
const newMeter = await org.meters.create({
  type: 'api_calls',
  value: 1000,
  metadata: { service: 'ai-completion' }
});

// Access organization wallets
const wallet = await org.wallets.get();
const newWallet = await org.wallets.create({
  balance: 1000.00,
  currency: 'USD'
});
```

### IAM & Access Control

#### Access Policies

```typescript
// Get all access policies
const policies = await mosaia.accessPolicies.get({
  effect: 'allow',
  active: true
});

// Get access policy by ID
const policy = await mosaia.accessPolicies.get({}, 'policy-id');

// Create access policy
const newPolicy = await mosaia.accessPolicies.create({
  name: 'Admin Access',
  effect: 'allow',
  actions: ['users:read', 'users:write', 'organizations:read'],
  resources: ['users', 'organizations'],
  conditions: {
    time: { between: ['09:00', '17:00'] }
  }
});

// Access via organization
const orgPolicies = await org.policies.get();
```

#### Organization Permissions

```typescript
// Get all organization permissions
const permissions = await mosaia.orgPermissions.get({
  org: 'org-id',
  user: 'user-id'
});

// Get permission by ID
const permission = await mosaia.orgPermissions.get({}, 'permission-id');

// Create organization permission
const newPermission = await mosaia.orgPermissions.create({
  org: 'org-id',
  user: 'user-id',
  policy: 'policy-id'
});

// Or via organization instance
const orgPermissions = await org.permissions.get();
const newOrgPermission = await org.permissions.create({
  user: 'user-id',
  policy: 'policy-id'
});
```

#### User Permissions

```typescript
// Get all user permissions
const permissions = await user.permissions.get();

// Create user permission
const newPermission = await user.permissions.create({
  client: 'client-id',
  policy: 'policy-id'
});
```

### Billing & Usage

#### Usage Meters

```typescript
// Get all usage meters
const meters = await mosaia.meters.get({
  type: 'api_calls',
  org: 'org-id'
});

// Get meter by ID
const meter = await mosaia.meters.get({}, 'meter-id');

// Create usage meter
const newMeter = await mosaia.meters.create({
  org: 'org-id',
  type: 'api_calls',
  value: 1000,
  metadata: {
    service: 'ai-completion',
    model: 'gpt-4'
  }
});

// Access via organization
const orgMeters = await org.meters.get();
const newOrgMeter = await org.meters.create({
  type: 'storage',
  value: 5000
});

// Access via user
const userMeters = await user.meters.get();
const newUserMeter = await user.meters.create({
  type: 'api_calls',
  value: 500
});
```

#### Wallets

```typescript
// Get wallet
const wallet = await mosaia.wallets.get({
  org: 'org-id'
});

// Create wallet
const newWallet = await mosaia.wallets.create({
  org: 'org-id',
  balance: 1000.00,
  currency: 'USD',
  external_id: 'stripe_customer_123'
});

// Access via organization
const orgWallet = await org.wallets.get();
const newOrgWallet = await org.wallets.create({
  balance: 5000.00,
  currency: 'USD'
});

// Access via user
const userWallet = await user.wallets.get();
const newUserWallet = await user.wallets.create({
  balance: 100.00,
  currency: 'USD'
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

// Chat with agent using model instance
const response = await agent.chat.completions.create({
  messages: [{ role: 'user', content: 'Hello, how can you help me?' }]
});

// Like agent
await agent.like();

// Fork agent
const forkedAgent = await agent.fork();

// Upload agent image
const file = new File(['image data'], 'agent-avatar.png', { type: 'image/png' });
const updatedAgent = await agent.image.upload(file);

// Access agent tasks
const tasks = await agent.tasks.get();
const newTask = await agent.tasks.create({ name: 'Task name' });

// Access agent logs
const logs = await agent.logs.get();
const log = await agent.logs.get({}, 'log-id');
const messages = await log.messages.get();
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

// Chat with agent group using model instance
const response = await group.chat.completions.create({
  messages: [{ role: 'user', content: 'I need help with my account' }]
});

// Like agent group
await group.like();

// Upload group image
const file = new File(['image data'], 'group-logo.png', { type: 'image/png' });
const updatedGroup = await group.image.upload(file);
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

// Like tool
await tool.like();

// Upload tool image
const file = new File(['image data'], 'tool-icon.png', { type: 'image/png' });
const updatedTool = await tool.image.upload(file);
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

// Like app
await app.like();

// Upload app image
const file = new File(['image data'], 'app-logo.png', { type: 'image/png' });
const updatedApp = await app.image.upload(file);

// Access app connectors
const connectors = await app.connectors.get();
const newConnector = await app.connectors.create({
  response_url: 'https://myapp.com/webhook',
  agent: 'agent-id'
});

// Access app webhooks
const webhooks = await app.webhooks.get();
const newWebhook = await app.webhooks.create({
  url: 'https://myapp.com/webhook',
  events: ['REQUEST'],
  secret: 'webhook-secret-key'
});
```

### App Connectors

```typescript
// Get all app connectors
const connectors = await mosaia.appConnectors.get({
  app: 'app-id',
  active: true
});

// Get app connector by ID
const connector = await mosaia.appConnectors.get({}, 'connector-id');

// Create app connector
const newConnector = await mosaia.appConnectors.create({
  app: 'app-id',
  response_url: 'https://myapp.com/webhook',
  agent: 'agent-id',
  agent_group: 'group-id',
  client: 'client-id',
  tags: ['integration', 'webhook']
});
```

### App Webhooks

```typescript
// Get all app webhooks
const webhooks = await mosaia.appWebhooks.get({
  app: 'app-id',
  active: true
});

// Get app webhook by ID
const webhook = await mosaia.appWebhooks.get({}, 'webhook-id');

// Create app webhook
const newWebhook = await mosaia.appWebhooks.create({
  app: 'app-id',
  url: 'https://myapp.com/webhook',
  events: ['REQUEST'],
  secret: 'webhook-secret-key',
  active: true,
  external_id: 'ext-webhook-123',
  extensors: {
    environment: 'production',
    team: 'engineering'
  }
});
```

### Search

```typescript
// Universal search across multiple resource types
const results = await mosaia.search.query({
  q: 'search query',
  types: ['agent', 'app', 'tool', 'model'],
  limit: 20
});
```

### Drives and Files

```typescript
// Get all drives
const drives = await mosaia.drives.get();

// Get drive by ID
const drive = await mosaia.drives.get({}, 'drive-id');

// Create drive
const newDrive = await mosaia.drives.create({
  name: 'My Drive',
  description: 'Storage drive for files'
});

// Update drive
await mosaia.drives.update('drive-id', {
  name: 'Updated Drive Name'
});

// Delete drive
await mosaia.drives.delete('drive-id');

// Access drive items
const items = await drive.items.get();

// Get specific drive item
const item = await drive.items.get({}, 'item-id');

// Create metadata-only drive item
const newItem = await drive.items.create({
  name: 'document.pdf',
  path: '/documents',
  size: 1024
});

// Upload single file with presigned URL
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const file = fileInput.files[0];

const uploadResult = await drive.items.uploadFile(file, {
  path: '/documents',
  relativePath: 'folder/file.txt'
});

// Upload to S3 using presigned URL
const fileInfo = uploadResult.files[0];
const uploadResponse = await fetch(fileInfo.presignedUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': fileInfo.mimeType
  }
});

if (!uploadResponse.ok) {
  // Mark upload as failed if S3 upload fails
  await drive.items.markUploadFailed(fileInfo.fileId, {
    error: `Upload failed: ${uploadResponse.statusText}`
  });
}

// Check upload job status
const status = await drive.items.getUploadStatus(uploadResult.uploadJob.id);
console.log('Upload progress:', status.progress.percentage + '%');

// Batch file upload with directory structure preservation
const files = Array.from(fileInput.files);
const batchResult = await drive.items.uploadFiles(files, {
  path: '/uploads',
  relativePaths: ['folder1/file1.txt', 'folder2/file2.txt'],
  preserveStructure: true
});

// Upload all files to S3
for (let i = 0; i < files.length; i++) {
  const fileInfo = batchResult.files[i];
  await fetch(fileInfo.presignedUrl, {
    method: 'PUT',
    body: files[i],
    headers: {
      'Content-Type': fileInfo.mimeType
    }
  });
}

// Update drive item metadata
await drive.items.update('item-id', {
  name: 'updated-name.pdf',
  description: 'Updated description'
});

// Delete drive item
await drive.items.delete('item-id');
```

### Logs and Messages

```typescript
// Get all logs
const logs = await mosaia.logs.get();

// Get log by ID
const log = await mosaia.logs.get({}, 'log-id');

// Access log messages
const messages = await log.messages.get();

// Create log message
const newMessage = await log.messages.create({
  log: 'log-id',
  role: 'user',
  content: 'Message content'
});

// Access log snapshots
const snapshots = await log.snapshots.get();
```

### Tasks and Plans

```typescript
// Get all tasks
const tasks = await mosaia.tasks.get();

// Get task by ID
const task = await mosaia.tasks.get({}, 'task-id');

// Create task
const newTask = await mosaia.tasks.create({
  name: 'Task name',
  description: 'Task description'
});

// Access task plans
const plans = await task.plans.get();

// Create task plan
const newPlan = await task.plans.create({
  task: 'task-id',
  name: 'Plan name',
  description: 'Plan description'
});
```

### Vector Indexes

```typescript
// Get all vector indexes
const indexes = await mosaia.vectorIndexes.get();

// Get vector index by ID
const index = await mosaia.vectorIndexes.get({}, 'index-id');

// Create vector index
const newIndex = await mosaia.vectorIndexes.create({
  name: 'My Index',
  description: 'Vector index for semantic search'
});
```

### Scopes, SSO, and Notifications

```typescript
// Get permission scopes
const scopes = await mosaia.scopes.get();

// SSO authentication
const ssoResult = await mosaia.sso.authenticate({
  provider: 'google',
  token: 'oauth-token'
});

// Send email notification
const notification = await mosaia.notifications.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Welcome to Mosaia!'
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

// Chat completion with model
const response = await model.chat.completions.create({
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Rerank documents
const rerankResult = await model.rerank({
  query: 'search query',
  documents: ['doc1', 'doc2', 'doc3']
});

// Generate embeddings
const embeddings = await model.embeddings({
  input: ['text to embed']
});

// Like model
await model.like();
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
