// Test setup file for Jest configuration

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Global test utilities
(global as any).testUtils = {
  // Helper to create mock configuration
  createMockConfig: (overrides = {}) => ({
    apiKey: 'test-api-key',
    apiURL: 'https://api.mosaia.ai',
    appURL: 'https://mosaia.ai',
    version: '1',
    clientId: 'test-client-id',
    ...overrides
  }),

  // Helper to create mock API response
  createMockApiResponse: <T>(data: T, status = 200, message = 'Success') => ({
    meta: { status, message },
    data,
    error: null
  }),

  // Helper to create mock error response
  createMockErrorResponse: (message = 'Test error', code = 'TEST_ERROR', status = 400) => ({
    meta: { status, message },
    data: null,
    error: { message, code, status }
  }),

  // Helper to reset ConfigurationManager singleton
  resetConfigurationManager: () => {
    (require('../config').ConfigurationManager as any).instance = undefined;
  }
};

// Mock environment variables
process.env.NODE_ENV = 'test';

// Mock fetch if needed (for tests that might use it)
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn();
}

// Mock crypto for OAuth tests
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      generateKey: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      digest: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      deriveKey: jest.fn(),
      deriveBits: jest.fn(),
      wrapKey: jest.fn(),
      unwrapKey: jest.fn()
    }
  } as any;
} 