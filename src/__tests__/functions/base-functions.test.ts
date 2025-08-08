import { BaseFunctions } from '../../functions/base-functions';
import { ConfigurationManager } from '../../config';
import { MosaiaConfig } from '../../types';

// Mock the ConfigurationManager
jest.mock('../../config', () => ({
  ConfigurationManager: {
    getInstance: jest.fn().mockReturnValue({
      getConfig: jest.fn().mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1'
      })
    })
  }
}));

// Mock the APIClient
jest.mock('../../utils/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn()
  }));
});

// Create a concrete implementation of BaseFunctions for testing
class TestFunctions extends BaseFunctions<{ id?: string; name: string; email: string }, any, any> {
  constructor(uri?: string) {
    super(uri);
  }

  // Expose protected methods for testing
  public testGetConfig(): MosaiaConfig {
    return this.config;
  }

  public testHandleError(error: any): Error {
    return this.handleError(error);
  }
}

describe('BaseFunctions', () => {
  let testFunctions: TestFunctions;
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    testFunctions = new TestFunctions('/test');
    mockApiClient = testFunctions['apiClient'];
  });

  describe('constructor', () => {
    it('should create BaseFunctions instance with default URI', () => {
      const functions = new TestFunctions();
      expect(functions).toBeDefined();
      expect((functions as any).uri).toBe('');
    });

    it('should create BaseFunctions instance with custom URI', () => {
      const functions = new TestFunctions('/custom/uri');
      expect(functions).toBeDefined();
      expect((functions as any).uri).toBe('/custom/uri');
    });

    it('should initialize ConfigurationManager and APIClient', () => {
      expect(ConfigurationManager.getInstance).toHaveBeenCalled();
      expect(testFunctions['configManager']).toBeDefined();
      expect(testFunctions['apiClient']).toBeDefined();
    });
  });

  describe('config getter', () => {
    it('should return configuration from config manager', () => {
      const config = testFunctions.testGetConfig();

      expect(config).toEqual({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1'
      });
    });
  });

  describe('get method', () => {
    it('should call GET with correct URI and parameters', async () => {
      const mockResponse = { data: { id: '123', name: 'Test' } };
      mockApiClient.GET.mockResolvedValue(mockResponse);

      const params = { limit: 10, offset: 0 };
      const result = await testFunctions.get(params);

      expect(mockApiClient.GET).toHaveBeenCalledWith('/test', params);
      expect(result).toEqual(mockResponse);
    });

    it('should call GET with specific ID', async () => {
      const mockResponse = { data: { id: '123', name: 'Test' } };
      mockApiClient.GET.mockResolvedValue(mockResponse);

      const result = await testFunctions.get(undefined, '123');

      expect(mockApiClient.GET).toHaveBeenCalledWith('/test/123', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      mockApiClient.GET.mockRejectedValue(apiError);

      await expect(testFunctions.get()).rejects.toThrow('API Error');
    });
  });

  describe('create method', () => {
    it('should call POST with correct URI and entity data', async () => {
      const mockResponse = { data: { id: '123', name: 'Test' } };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const entity = { name: 'Test Entity', email: 'test@example.com' };
      const result = await testFunctions.create(entity);

      expect(mockApiClient.POST).toHaveBeenCalledWith('/test', entity);
      expect(result).toEqual(mockResponse);
    });

    it('should call POST with query parameters', async () => {
      const mockResponse = { data: { id: '123', name: 'Test' } };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const entity = { name: 'Test Entity', email: 'test@example.com' };
      const params = { validate: 'true' };
      const result = await testFunctions.create(entity, params);

      expect(mockApiClient.POST).toHaveBeenCalledWith('/test?validate=true', entity);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      mockApiClient.POST.mockRejectedValue(apiError);

      const entity = { name: 'Test Entity', email: 'test@example.com' };
      await expect(testFunctions.create(entity)).rejects.toThrow('API Error');
    });
  });

  describe('update method', () => {
    it('should call PUT with correct URI, ID, and entity data', async () => {
      const mockResponse = { data: { id: '123', name: 'Updated Test' } };
      mockApiClient.PUT.mockResolvedValue(mockResponse);

      const entity = { name: 'Updated Test' };
      const result = await testFunctions.update('123', entity);

      expect(mockApiClient.PUT).toHaveBeenCalledWith('/test/123', entity);
      expect(result).toEqual(mockResponse);
    });

    it('should call PUT with query parameters', async () => {
      const mockResponse = { data: { id: '123', name: 'Updated Test' } };
      mockApiClient.PUT.mockResolvedValue(mockResponse);

      const entity = { name: 'Updated Test' };
      const params = { validate: 'true' };
      const result = await testFunctions.update('123', entity, params);

      expect(mockApiClient.PUT).toHaveBeenCalledWith('/test/123?validate=true', entity);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      mockApiClient.PUT.mockRejectedValue(apiError);

      const entity = { name: 'Updated Test' };
      await expect(testFunctions.update('123', entity)).rejects.toThrow('API Error');
    });
  });

  describe('delete method', () => {
    it('should call DELETE with correct URI and ID', async () => {
      mockApiClient.DELETE.mockResolvedValue(undefined);

      await testFunctions.delete('123');

      expect(mockApiClient.DELETE).toHaveBeenCalledWith('/test/123', undefined);
    });

    it('should call DELETE with query parameters', async () => {
      mockApiClient.DELETE.mockResolvedValue(undefined);

      const params = { force: 'true' };
      await testFunctions.delete('123', params);

      expect(mockApiClient.DELETE).toHaveBeenCalledWith('/test/123?force=true', params);
    });

    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      mockApiClient.DELETE.mockRejectedValue(apiError);

      await expect(testFunctions.delete('123')).rejects.toThrow('API Error');
    });
  });

  describe('handleError method', () => {
    it('should return error with message when error has message', () => {
      const error = new Error('Test error');
      const result = testFunctions.testHandleError(error);

      expect(result).toBe(error);
    });

    it('should return original error when error is object with message', () => {
      const error = { message: 'Object error' };
      const result = testFunctions.testHandleError(error);

      expect(result).toBe(error);
      expect(result.message).toBe('Object error');
    });

    it('should return generic error for unknown error types', () => {
      const error = 'String error';
      const result = testFunctions.testHandleError(error);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Unknown error occurred');
    });
  });
});
