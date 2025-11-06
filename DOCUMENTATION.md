# Documentation Guide

This guide explains how to write and generate documentation for the Mosaia Node.js SDK using TSDoc and JSDoc.

## Overview

The SDK uses [TypeDoc](https://typedoc.org/) to generate comprehensive API documentation from TSDoc comments in the TypeScript source code. TypeDoc supports both TSDoc and JSDoc comment formats.

## Writing Documentation

### TSDoc Comments

TSDoc is the preferred format for TypeScript projects. Use `/** */` for multi-line comments:

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

### JSDoc Comments

JSDoc comments are also supported for compatibility:

```typescript
/**
 * @description Creates a new user in the system
 * @param {UserData} userData - The user data to create
 * @param {string} userData.email - User's email address
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @returns {Promise<User>} Promise that resolves to the created user
 * @example
 * const user = await createUser({
 *   email: 'john@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * @throws {ValidationError} When user data is invalid
 * @throws {AuthenticationError} When API key is invalid
 */
```

## Common TSDoc Tags

### @param
Document function parameters:
```typescript
/**
 * @param name - The name of the user
 * @param age - The age of the user (must be positive)
 * @param options - Optional configuration
 * @param options.includeProfile - Whether to include profile data
 */
```

### @returns
Document return values:
```typescript
/**
 * @returns Promise that resolves to the user data
 * @returns {Promise<User>} Promise that resolves to the user data
 */
```

### @throws
Document exceptions:
```typescript
/**
 * @throws {ValidationError} When input data is invalid
 * @throws {NetworkError} When API request fails
 */
```

### @example
Provide usage examples:
```typescript
/**
 * @example
 * ```typescript
 * const user = await getUser('123');
 * console.log(user.name);
 * ```
 * 
 * @example
 * ```typescript
 * // With options
 * const user = await getUser('123', { includeProfile: true });
 * ```
 */
```

### @deprecated
Mark deprecated APIs:
```typescript
/**
 * @deprecated Use `getUserById` instead
 * @param id - User ID
 */
function getUser(id: string): Promise<User> {
  // Implementation
}
```

### @since
Document when a feature was added:
```typescript
/**
 * @since 1.2.0
 * @param data - The data to process
 */
function processData(data: any): void {
  // Implementation
}
```

### @category
Group related APIs:
```typescript
/**
 * @category Authentication
 * @param credentials - Login credentials
 */
function login(credentials: Credentials): Promise<Session> {
  // Implementation
}
```

## Class Documentation

Document classes with comprehensive descriptions:

```typescript
/**
 * Represents a user in the Mosaia system
 * 
 * This class provides methods for managing user data and performing
 * user-related operations like authentication and profile updates.
 * 
 * @example
 * ```typescript
 * const user = new User({
 *   id: '123',
 *   email: 'john@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * 
 * await user.updateProfile({ firstName: 'Jane' });
 * ```
 */
class User {
  /**
   * Creates a new User instance
   * 
   * @param data - User data object
   * @param data.id - Unique user identifier
   * @param data.email - User's email address
   * @param data.firstName - User's first name
   * @param data.lastName - User's last name
   */
  constructor(data: UserData) {
    // Implementation
  }

  /**
   * Updates the user's profile information
   * 
   * @param updates - Profile updates to apply
   * @returns Promise that resolves when update is complete
   * 
   * @example
   * ```typescript
   * await user.updateProfile({
   *   firstName: 'Jane',
   *   lastName: 'Smith'
   * });
   * ```
   */
  async updateProfile(updates: Partial<UserData>): Promise<void> {
    // Implementation
  }
}
```

## Interface Documentation

Document interfaces and types:

```typescript
/**
 * Configuration options for the Mosaia SDK
 * 
 * This interface defines all available configuration options
 * for initializing and customizing the SDK behavior.
 * 
 * @example
 * ```typescript
 * const config: MosaiaConfig = {
 *   apiKey: 'your-api-key',
 *   apiURL: 'https://api.mosaia.ai',
 *   version: '1',
 *   verbose: true
 * };
 * ```
 */
interface MosaiaConfig {
  /**
   * API key for authentication
   * 
   * Required for most API operations. Can be obtained from
   * the Mosaia dashboard.
   */
  apiKey?: string;

  /**
   * Base URL for API requests
   * 
   * @default "https://api.mosaia.ai"
   */
  apiURL?: string;

  /**
   * API version to use
   * 
   * @default "1"
   */
  version?: string;

  /**
   * Enable verbose logging
   * 
   * When enabled, the SDK will log detailed information
   * about API requests and responses.
   * 
   * @default false
   */
  verbose?: boolean;
}
```

## Generating Documentation

### Build Documentation

```bash
# Generate documentation
npm run docs

# Build and generate documentation
npm run docs:build

# Serve documentation with live reload
npm run docs:serve
```

### Documentation Output

The generated documentation will be available in the `docs/` folder and includes:

- **HTML Documentation**: Complete API reference with search and navigation
- **Type Definitions**: Generated TypeScript declaration files
- **Examples**: Code examples from `@example` tags
- **Categories**: Grouped APIs based on `@category` tags

### Documentation Structure

The documentation is organized into categories:

1. **Authentication** - OAuth and authentication classes
2. **Models** - Data model classes
3. **Collections** - API collection classes
4. **Functions** - Utility functions
5. **Configuration** - Configuration management
6. **Utilities** - Helper functions and utilities

## Best Practices

### 1. Be Descriptive
Provide clear, concise descriptions of what each API does.

### 2. Include Examples
Always include practical examples showing how to use the API.

### 3. Document Parameters
Clearly document all parameters, their types, and any constraints.

### 4. Document Return Values
Explain what the function returns and in what format.

### 5. Document Exceptions
List all possible exceptions and when they occur.

### 6. Use Categories
Group related APIs using the `@category` tag.

### 7. Keep Examples Current
Ensure examples work with the current API version.

### 8. Document Breaking Changes
Use `@deprecated` tags for APIs that will be removed.

## Integration with IDEs

Most modern IDEs support TSDoc/JSDoc:

- **VS Code**: Shows documentation on hover
- **WebStorm**: Provides autocomplete and documentation
- **TypeScript Language Server**: Enables IntelliSense features

## Continuous Integration

Consider adding documentation generation to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Generate Documentation
  run: npm run docs:build

- name: Deploy Documentation
  run: |
    # Deploy to GitHub Pages or other hosting service
```

## Resources

- [TypeDoc Documentation](https://typedoc.org/)
- [TSDoc Specification](https://tsdoc.org/)
- [JSDoc Documentation](https://jsdoc.app/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
