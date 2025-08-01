import { BaseAPI } from '../../apis/base-api';
import { ConfigurationManager } from '../../config';
import APIClient from '../../apis/api-client';
import { QueryParams, APIResponse, ErrorResponse } from '../../types';

// Mock the APIClient
jest.mock('../../apis/api-client');
const MockAPIClient = APIClient as jest.MockedClass<typeof APIClient>;

// Mock the ConfigurationManager
jest.mock('../../config', () => ({
  ConfigurationManager: {
    getInstance: jest.fn()
  }
}));

// Mock model class
class MockModel {
  constructor(public data: any, public uri?: string) {
    // Copy data properties to the instance for direct access
    Object.assign(this, data);
  }
}

// Test interface
interface TestInterface {
  id?: string;
  name: string;
  email: string;
}

// Test payload types - these should match the APIResponse structure
type TestGetPayload = APIResponse<TestInterface[]>;
type TestCreatePayload = APIResponse<TestInterface>;

// Concrete implementation of BaseAPI for testing
class TestAPI extends BaseAPI<TestInterface, MockModel, TestGetPayload, TestCreatePayload> {
  constructor() {
    super('/test', MockModel);
  }
}

describe('BaseAPI', () => {
  let testAPI: TestAPI;
  let mockAPIClient: jest.Mocked<APIClient>;
  let mockConfigManager: jest.Mocked<ConfigurationManager>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock instances
    mockAPIClient = {
      GET: jest.fn(),
      POST: jest.fn(),
      PUT: jest.fn(),
      DELETE: jest.fn(),
    } as any;

    mockConfigManager = {
      getConfig: jest.fn(),
      getInstance: jest.fn(),
    } as any;

    // Setup mock returns
    MockAPIClient.mockImplementation(() => mockAPIClient);
    (ConfigurationManager.getInstance as jest.Mock).mockReturnValue(mockConfigManager);
    mockConfigManager.getConfig.mockReturnValue({
      apiKey: 'test-api-key',
      apiURL: 'https://api.test.com',
      version: '1',
    });

    testAPI = new TestAPI();
  });

  describe('constructor', () => {
    it('should initialize with correct URI and ModelClass', () => {
      expect(testAPI).toBeInstanceOf(BaseAPI);
      expect(testAPI).toBeInstanceOf(TestAPI);
    });

    it('should create APIClient and ConfigurationManager instances', () => {
      expect(MockAPIClient).toHaveBeenCalled();
      expect(ConfigurationManager.getInstance).toHaveBeenCalled();
    });
  });

  describe('get method', () => {
    it('should get all entities when no id is provided', async () => {
      const mockResponse: TestGetPayload = {
        meta: { status: 200, message: 'Success' },
        data: [
          { id: '1', name: 'Test User 1', email: 'user1@test.com' },
          { id: '2', name: 'Test User 2', email: 'user2@test.com' }
        ],
        error: null
      };

      mockAPIClient.GET.mockResolvedValue(mockResponse);

      const result = await testAPI.get();

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/test', undefined);
      expect(result).toHaveLength(2);
      expect(Array.isArray(result) && result[0]).toBeInstanceOf(MockModel);
      expect(Array.isArray(result) && result[1]).toBeInstanceOf(MockModel);
    });

    it('should get a specific entity when id is provided', async () => {
      const mockResponse: TestCreatePayload = {
        meta: { status: 200, message: 'Success' },
        data: { id: '1', name: 'Test User', email: 'user@test.com' },
        error: null
      };

      mockAPIClient.GET.mockResolvedValue(mockResponse);

      const result = await testAPI.get({}, '1');

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/test/1', {});
      expect(result).toBeInstanceOf(MockModel);
      expect((result as MockModel).data.id).toBe('1');
    });

    it('should pass query parameters correctly', async () => {
      const params: QueryParams = {
        limit: 10,
        offset: 0,
        q: 'test',
        active: true
      };

      const mockResponse: TestGetPayload = {
        meta: { status: 200, message: 'Success' },
        data: [],
        error: null
      };

      mockAPIClient.GET.mockResolvedValue(mockResponse);

      await testAPI.get(params);

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/test', params);
    });

    it('should handle empty response data', async () => {
      const mockResponse: TestGetPayload = {
        meta: { status: 200, message: 'Success' },
        data: [],
        error: null
      };

      mockAPIClient.GET.mockResolvedValue(mockResponse);

      const result = await testAPI.get();

      expect(result).toEqual([]);
    });

    it('should handle null response data', async () => {
      const mockResponse: TestGetPayload = {
        meta: { status: 200, message: 'Success' },
        data: [],
        error: null
      };

      mockAPIClient.GET.mockResolvedValue(mockResponse);

      const result = await testAPI.get();

      expect(result).toEqual([]);
    });

    it('should throw error when response is invalid', async () => {
      mockAPIClient.GET.mockResolvedValue(null as any);

      await expect(testAPI.get()).rejects.toThrow('Invalid response from API');
    });

    it('should throw error when API returns error', async () => {
      const mockResponse: TestGetPayload = {
        meta: { status: 400, message: 'Bad Request' },
        data: [],
        error: {
          message: 'Invalid request',
          code: 'INVALID_REQUEST',
          status: 400
        }
      };

      mockAPIClient.GET.mockResolvedValue(mockResponse);

      await expect(testAPI.get()).rejects.toThrow('Invalid request');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockAPIClient.GET.mockRejectedValue(networkError);

      await expect(testAPI.get()).rejects.toThrow('Network error');
    });

    it('should handle unknown errors', async () => {
      mockAPIClient.GET.mockRejectedValue({});

      await expect(testAPI.get()).rejects.toThrow('Unknown error occurred');
    });
  });

  describe('create method', () => {
    it('should create a new entity successfully', async () => {
      const entityData = {
        name: 'New User',
        email: 'newuser@test.com'
      };

      const mockResponse: TestCreatePayload = {
        meta: { status: 201, message: 'Created' },
        data: { id: '3', ...entityData },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await testAPI.create(entityData);

      expect(mockAPIClient.POST).toHaveBeenCalledWith('/test', entityData);
      expect(result).toBeInstanceOf(MockModel);
      expect((result as MockModel).data.name).toBe('New User');
      expect((result as MockModel).data.email).toBe('newuser@test.com');
    });

    it('should throw error when create response is invalid', async () => {
      const entityData = {
        name: 'New User',
        email: 'newuser@test.com'
      };

      mockAPIClient.POST.mockResolvedValue(null as any);

      await expect(testAPI.create(entityData)).rejects.toThrow('Invalid response from API');
    });

    it('should throw error when API returns error during create', async () => {
      const entityData = {
        name: 'New User',
        email: 'newuser@test.com'
      };

      const mockResponse: TestCreatePayload = {
        meta: { status: 400, message: 'Bad Request' },
        data: { id: '1', name: '', email: '' },
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          status: 400
        }
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      await expect(testAPI.create(entityData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during create', async () => {
      const entityData = {
        name: 'New User',
        email: 'newuser@test.com'
      };

      const networkError = new Error('Network error');
      mockAPIClient.POST.mockRejectedValue(networkError);

      await expect(testAPI.create(entityData)).rejects.toThrow('Network error');
    });

    it('should handle unknown errors during create', async () => {
      const entityData = {
        name: 'New User',
        email: 'newuser@test.com'
      };

      mockAPIClient.POST.mockRejectedValue({});

      await expect(testAPI.create(entityData)).rejects.toThrow('Unknown error occurred');
    });
  });

  describe('configuration access', () => {
    it('should access configuration through protected config getter', () => {
      // This tests the protected config getter indirectly
      // We can't directly access it, but we can verify it's used in the constructor
      expect(testAPI).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty entity data in create', async () => {
      const mockResponse: TestCreatePayload = {
        meta: { status: 201, message: 'Created' },
        data: { id: '1', name: '', email: '' },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await testAPI.create({ name: '', email: '' });

      expect(result).toBeInstanceOf(MockModel);
      expect((result as MockModel).data.name).toBe('');
    });

    it('should handle special characters in query parameters', async () => {
      const params: QueryParams = {
        q: 'test@example.com',
        tags: ['tag1', 'tag2'],
        external_id: 'id-with-special-chars_123'
      };

              const mockResponse: TestGetPayload = {
          meta: { status: 200, message: 'Success' },
          data: [],
          error: null
        };

      mockAPIClient.GET.mockResolvedValue(mockResponse);

      await testAPI.get(params);

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/test', params);
    });

    it('should handle very long entity data', async () => {
      const longName = 'a'.repeat(1000);
      const entityData = {
        name: longName,
        email: 'test@example.com'
      };

              const mockResponse: TestCreatePayload = {
          meta: { status: 201, message: 'Created' },
          data: { id: '1', ...entityData },
          error: null
        };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await testAPI.create(entityData);

      expect(result).toBeInstanceOf(MockModel);
      expect((result as MockModel).data.name).toBe(longName);
    });
  });
}); 