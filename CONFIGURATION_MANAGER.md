# ConfigurationManager Pattern

## Overview

The ConfigurationManager provides a **single source of truth** for configuration across the entire Mosaia SDK. This eliminates the need for dependency injection and prevents configuration copies, ensuring consistency and reducing complexity.

## Problem Solved

### Before ConfigurationManager
- Configuration was passed around through dependency injection
- Multiple copies of configuration existed in different classes
- Configuration could be mutated accidentally
- Complex constructor signatures with config parameters
- No centralized configuration management

### After ConfigurationManager
- Single source of truth for all configuration
- No more dependency injection of configuration
- Immutable configuration access
- Clean constructor signatures
- Centralized configuration management

## Architecture

### Singleton Pattern
The ConfigurationManager uses a singleton pattern to ensure only one instance exists across the entire application:

```typescript
const configManager = ConfigurationManager.getInstance();
```

### Key Features

1. **Single Source of Truth**: Only one configuration instance exists
2. **Immutable Access**: Read-only configuration access prevents mutations
3. **Type Safety**: Full TypeScript support with proper typing
4. **Thread Safe**: Consistent state across all components
5. **Backward Compatible**: Existing API remains unchanged

## Usage Examples

### Basic Initialization

```typescript
import { ConfigurationManager } from './config';

// Initialize the configuration manager
const configManager = ConfigurationManager.getInstance();
configManager.initialize({
  apiKey: 'your-api-key',
  apiURL: 'https://api.mosaia.ai',
  appURL: 'https://mosaia.ai',
  version: '1'
});
```

### Accessing Configuration

```typescript
// Get current configuration
const config = configManager.getConfig();

// Get read-only configuration (frozen)
const readOnlyConfig = configManager.getReadOnlyConfig();

// Convenient getters
const apiUrl = configManager.getApiUrl(); // https://api.mosaia.ai/v1
const appUrl = configManager.getAppUrl(); // https://mosaia.ai
const apiKey = configManager.getApiKey(); // your-api-key
```

### Updating Configuration

```typescript
// Update specific values
configManager.updateConfig('apiKey', 'new-api-key');
configManager.updateConfig('version', '2');

// Configuration changes are immediately reflected everywhere
const newConfig = configManager.getConfig();
console.log(newConfig.apiKey); // 'new-api-key'
console.log(newConfig.version); // '2'
```

### Integration with Mosaia SDK

```typescript
import { Mosaia } from './index';

// Initialize SDK (automatically uses ConfigurationManager)
const mosaia = new Mosaia({
  apiKey: 'sdk-api-key',
  apiURL: 'https://sdk-api.com'
});

// Update configuration through SDK setters
mosaia.apiKey = 'updated-key';
mosaia.apiURL = 'https://updated-api.com';

// All components see the same configuration
const configManager = ConfigurationManager.getInstance();
console.log(configManager.getConfig().apiKey); // 'updated-key'
```

## Test Cases

### 1. Singleton Pattern Tests
- ✅ Returns same instance on multiple calls
- ✅ Maintains state across getInstance calls

### 2. Initialization Tests
- ✅ Initializes with default values
- ✅ Initializes with custom values
- ✅ Merges custom values with defaults
- ✅ Handles partial configuration updates

### 3. Configuration Access Tests
- ✅ Returns current configuration
- ✅ Returns read-only frozen configuration
- ✅ Provides convenient getter methods
- ✅ Checks initialization status

### 4. Configuration Updates Tests
- ✅ Updates specific configuration values
- ✅ Preserves other values when updating
- ✅ Handles multiple sequential updates

### 5. Error Handling Tests
- ✅ Throws error when accessing uninitialized config
- ✅ Throws error when updating uninitialized config
- ✅ Handles invalid updates gracefully

### 6. Reset Functionality Tests
- ✅ Resets to uninitialized state
- ✅ Allows re-initialization after reset

### 7. URL Generation Tests
- ✅ Generates correct API URL with version
- ✅ Handles different API versions
- ✅ Uses default version when not specified

### 8. Integration Tests
- ✅ Works with Mosaia SDK initialization
- ✅ Maintains configuration across SDK operations
- ✅ No configuration copying occurs
- ✅ Thread safety and state management

## Benefits

### ✅ **No More Dependency Injection**
```typescript
// Before
class User extends BaseModel {
  constructor(data, config) {
    super(data, config, '/user');
  }
}

// After
class User extends BaseModel {
  constructor(data) {
    super(data, '/user'); // No config parameter needed
  }
}
```

### ✅ **No Configuration Copies**
```typescript
// All components reference the same configuration
const user1 = new User(data1);
const user2 = new User(data2);
const agents = new Agents();

// All use the same ConfigurationManager instance
const config1 = ConfigurationManager.getInstance().getConfig();
const config2 = ConfigurationManager.getInstance().getConfig();
expect(config1).toBe(config2); // Same reference
```

### ✅ **Immutable Configuration Access**
```typescript
const readOnlyConfig = configManager.getReadOnlyConfig();
expect(Object.isFrozen(readOnlyConfig)).toBe(true);

// Cannot modify frozen config
expect(() => {
  readOnlyConfig.apiKey = 'modified-key';
}).toThrow();
```

### ✅ **Centralized Configuration Management**
```typescript
// Update once, reflected everywhere
configManager.updateConfig('apiKey', 'new-key');

// All components see the change immediately
const mosaia = new Mosaia({});
const user = new User({});
const agents = new Agents();

// All use the updated configuration
```

## Performance Benefits

### Memory Efficiency
- No configuration copies created
- Minimal memory footprint
- No memory leaks from multiple instances

### Thread Safety
- Single instance ensures consistency
- No race conditions from multiple config instances
- Atomic configuration updates

## Migration Guide

### For Existing Code

1. **Remove config parameters** from constructors
2. **Use ConfigurationManager** instead of passed config
3. **Update tests** to use the new pattern
4. **Remove config copying** logic

### Example Migration

```typescript
// Before
class MyClass {
  constructor(config) {
    this.config = { ...config }; // Copying config
    this.client = new APIClient(config);
  }
}

// After
class MyClass {
  constructor() {
    const configManager = ConfigurationManager.getInstance();
    this.client = new APIClient(configManager.getConfig());
  }
}
```

## Testing

Run the ConfigurationManager tests:

```bash
# Run all ConfigurationManager tests
npm test -- --testPathPattern="config-manager"

# Run specific test file
npm test -- --testPathPattern="config-manager-simple.test.ts"
```

## Conclusion

The ConfigurationManager pattern successfully addresses the original problem of configuration copying and dependency injection. It provides:

- **Single source of truth** for configuration
- **Eliminated dependency injection** of configuration
- **Improved performance** with no configuration copies
- **Better maintainability** with centralized configuration management
- **Type safety** and **thread safety**
- **Backward compatibility** with existing APIs

This pattern can be applied to other parts of the SDK and serves as a best practice for configuration management in TypeScript applications. 