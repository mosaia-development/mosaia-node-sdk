# Mosaia Node SDK Test Suite

This directory contains comprehensive test cases for the Mosaia Node SDK, covering configuration management, type definitions, and the main SDK class.

## Test Files

### 1. `config.test.ts` - Configuration Manager Tests
Tests for the `ConfigurationManager` class and `DEFAULT_CONFIG` object.

**Coverage:**
- ✅ DEFAULT_CONFIG validation
- ✅ ConfigurationManager singleton pattern
- ✅ Configuration initialization with defaults and custom values
- ✅ Configuration getters and setters
- ✅ Configuration updates and validation
- ✅ Error handling for uninitialized configuration
- ✅ Edge cases (empty values, null/undefined, special characters)

**Key Test Scenarios:**
- Singleton instance management
- Configuration initialization with various input types
- Configuration updates and validation
- API URL generation with versioning
- Read-only configuration access
- Configuration reset functionality

### 2. `types.test.ts` - Type Definition Tests
Tests for all TypeScript interfaces and types defined in the SDK.

**Coverage:**
- ✅ MosaiaConfig interface validation
- ✅ MosaiaAuth grant types
- ✅ APIResponse and ErrorResponse structures
- ✅ Pagination and query parameter interfaces
- ✅ Base entity and record history interfaces
- ✅ All entity interfaces (User, Organization, App, Tool, Agent, etc.)
- ✅ Chat completion interfaces
- ✅ OAuth configuration and response interfaces
- ✅ Complex nested interface structures
- ✅ Type compatibility between related interfaces

**Key Test Scenarios:**
- Interface property validation
- Optional vs required property handling
- Complex nested object structures
- Type inheritance and extension
- Union types and enums
- Generic type usage

### 3. `index.test.ts` - Main SDK Class Tests
Tests for the main `Mosaia` class and its methods.

**Coverage:**
- ✅ Constructor initialization
- ✅ Configuration getters and setters
- ✅ API client instantiation
- ✅ OAuth instance creation
- ✅ Error handling and validation
- ✅ Integration with ConfigurationManager
- ✅ Mock API client interactions
- ✅ Edge cases and error scenarios

**Key Test Scenarios:**
- SDK initialization with various configurations
- Configuration updates through setters
- API client method calls and responses
- OAuth configuration validation
- Error handling for missing configuration
- Integration testing with mocked dependencies

## Test Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- TypeScript 4.5+

### Installation
```bash
# Install dependencies
npm install

# Install dev dependencies (if not already installed)
npm install --save-dev jest @types/jest ts-jest
```

### Running Tests

#### Run All Tests
```bash
npm test
```

#### Run Tests with Coverage
```bash
npm run test:coverage
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Specific Test File
```bash
# Run only configuration tests
npm test -- config.test.ts

# Run only type tests
npm test -- types.test.ts

# Run only main SDK tests
npm test -- index.test.ts
```

#### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

## Test Configuration

### Jest Configuration
The tests use Jest with TypeScript support. Configuration is in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 10000,
};
```

### Test Setup
The `setup.ts` file configures the test environment:

- Mocks console methods to reduce noise
- Provides global test utilities
- Sets up crypto mocks for OAuth tests
- Configures environment variables

## Test Utilities

### Global Test Utilities
The setup file provides global utilities:

```typescript
// Create mock configuration
const config = global.testUtils.createMockConfig({
  apiKey: 'custom-key',
  apiURL: 'https://custom-api.mosaia.ai'
});

// Create mock API response
const response = global.testUtils.createMockApiResponse(data, 200, 'Success');

// Create mock error response
const error = global.testUtils.createMockErrorResponse('Error message', 'ERROR_CODE', 400);

// Reset ConfigurationManager singleton
global.testUtils.resetConfigurationManager();
```

## Mocking Strategy

### Dependencies Mocked
- `APIClient` - Mocked for HTTP request testing
- `Self` model - Mocked for model instantiation testing
- `OAuth` class - Mocked for OAuth flow testing
- `ConfigurationManager` - Mocked for configuration testing

### Mock Examples
```typescript
// Mock APIClient
jest.mock('../apis/api-client');
const MockAPIClient = APIClient as jest.MockedClass<typeof APIClient>;

// Mock ConfigurationManager
jest.spyOn(ConfigurationManager, 'getInstance').mockReturnValue(mockConfigManager);
```

## Test Categories

### 1. Unit Tests
- Individual class and method testing
- Configuration management
- Type validation
- Utility functions

### 2. Integration Tests
- API client interactions
- OAuth flow testing
- Model instantiation
- Configuration integration

### 3. Edge Cases
- Error handling
- Invalid inputs
- Missing configuration
- Network failures

### 4. Type Safety
- Interface validation
- Type compatibility
- Generic type usage
- Union type handling

## Coverage Goals

- **Line Coverage**: >90%
- **Branch Coverage**: >85%
- **Function Coverage**: >95%
- **Statement Coverage**: >90%

## Best Practices

### Test Structure
```typescript
describe('ClassName', () => {
  let instance: ClassName;
  
  beforeEach(() => {
    // Setup
    instance = new ClassName();
  });
  
  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });
  
  describe('methodName', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = instance.methodName(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Naming Conventions
- Test files: `*.test.ts`
- Test suites: `describe('ClassName', () => {})`
- Test cases: `it('should do something', () => {})`
- Mock variables: `mockClassName`

### Assertions
- Use descriptive assertion messages
- Test both success and failure cases
- Verify mock calls and parameters
- Test edge cases and error conditions

## Troubleshooting

### Common Issues

#### 1. ConfigurationManager Singleton Issues
```typescript
// Reset singleton before each test
beforeEach(() => {
  (ConfigurationManager as any).instance = undefined;
});
```

#### 2. Mock Not Working
```typescript
// Ensure mocks are cleared between tests
afterEach(() => {
  jest.clearAllMocks();
});
```

#### 3. TypeScript Errors
```typescript
// Use proper type assertions for mocks
const mockInstance = instance as jest.Mocked<ClassName>;
```

#### 4. Async Test Issues
```typescript
// Use proper async/await patterns
it('should handle async operation', async () => {
  const result = await instance.asyncMethod();
  expect(result).toBeDefined();
});
```

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Test both success and failure cases
4. Add appropriate mocks for dependencies
5. Update this README if adding new test categories
6. Ensure tests pass before submitting PR

## Continuous Integration

Tests are automatically run in CI/CD pipelines:

- **Pre-commit**: Basic test suite
- **Pull Request**: Full test suite with coverage
- **Release**: Complete test suite with performance testing

## Performance Testing

For performance-critical code, add performance tests:

```typescript
it('should complete within time limit', () => {
  const start = performance.now();
  instance.performanceMethod();
  const end = performance.now();
  
  expect(end - start).toBeLessThan(100); // 100ms limit
});
``` 