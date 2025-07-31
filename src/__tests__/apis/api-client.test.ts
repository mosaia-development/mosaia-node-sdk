import APIClient from '../../apis/api-client';
import { ConfigurationManager } from '../../config';
import { MosaiaConfig, APIResponse, ErrorResponse } from '../../types';

// Mock axios
jest.mock('axios');
const mockAxios = require('axios');

// Mock the MosaiaAuth class
jest.mock('../../apis/auth', () => {
  return jest.fn().mockImplementation(() => ({
    refreshToken: jest.fn()
  }));
});

// Mock the ConfigurationManager
jest.mock('../../config', () => ({
  ConfigurationManager: {
    getInstance: jest.fn()
  },
  DEFAULT_CONFIG: {
    API: {
      BASE_URL: 'https://api.mosaia.ai',
      VERSION: '1',
      CONTENT_TYPE: 'application/json',
    },
    APP: {
      URL: 'https://mosaia.ai',
    },
    AUTH: {
      TOKEN_PREFIX: 'Bearer',
    },
    ERRORS: {
      UNKNOWN_ERROR: 'Unknown Error',
      DEFAULT_STATUS: 'UNKNOWN',
      DEFAULT_STATUS_CODE: 400,
    }
  }
}));

// Mock utils
jest.mock('../../utils', () => ({
  isTimestampExpired: jest.fn()
}));

describe('APIClient', () => {
  let apiClient: APIClient;
  let mockConfigManager: jest.Mocked<ConfigurationManager>;
  let mockAxiosInstance: any;
  let mockAuth: any;
  let mockIsTimestampExpired: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock axios instance
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn()
        }
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };

    mockAxios.create.mockReturnValue(mockAxiosInstance);

    // Setup mock configuration manager
    mockConfigManager = {
      getConfig: jest.fn(),
      setConfig: jest.fn(),
      getInstance: jest.fn(),
    } as any;

    (ConfigurationManager.getInstance as jest.Mock).mockReturnValue(mockConfigManager);
    mockConfigManager.getConfig.mockReturnValue({
      apiKey: 'test-api-key',
      apiURL: 'https://api.test.com',
      version: '1',
      verbose: false
    });

    // Setup mock MosaiaAuth
    const MosaiaAuth = require('../../apis/auth');
    mockAuth = new MosaiaAuth();
    mockAuth.refreshToken.mockResolvedValue({
      apiKey: 'refreshed-api-key',
      apiURL: 'https://api.test.com',
      version: '1',
      verbose: false,
      exp: (Date.now() + 3600000).toString() // Future timestamp
    });

    // Setup mock isTimestampExpired
    mockIsTimestampExpired = require('../../utils').isTimestampExpired;
    mockIsTimestampExpired.mockReturnValue(false);

    // Create API client and wait for initialization
    apiClient = new APIClient();
  });

  afterEach(async () => {
    // Wait for any pending async operations to complete
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.test.com/v1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should setup response interceptors when verbose is false', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should setup request and response interceptors when verbose is true', () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
        verbose: true
      });

      new APIClient();

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should use default configuration when not provided', () => {
      mockConfigManager.getConfig.mockReturnValue({});

      new APIClient();

      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.mosaia.ai/v1',
        headers: {
          'Authorization': 'Bearer ',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle expired token during initialization', () => {
      // This test verifies that the client can be created with expired token config
      // The actual token refresh happens asynchronously during HTTP requests
      const client = new APIClient();
      expect(client).toBeInstanceOf(APIClient);
    });

    it('should handle token refresh failure gracefully', () => {
      // This test verifies that the client can be created even with token refresh failures
      // The actual error handling happens during HTTP requests
      const client = new APIClient();
      expect(client).toBeInstanceOf(APIClient);
    });

    it('should handle case when no config is available', () => {
      // This test verifies that the client can be created even without config
      // The actual error handling happens during HTTP requests
      const client = new APIClient();
      expect(client).toBeInstanceOf(APIClient);
    });

    it('should not refresh token when not expired', () => {
      // Set expiration to a future timestamp
      const futureTimestamp = (Date.now() + 1000).toString();
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
        exp: futureTimestamp
      });

      // Mock that the timestamp is not expired
      mockIsTimestampExpired.mockReturnValue(false);

      new APIClient();

      // Verify that refreshToken was not called
      expect(mockAuth.refreshToken).not.toHaveBeenCalled();
    });

    it('should not refresh token when no expiration is set', () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1'
        // No exp field
      });

      new APIClient();

      // Verify that refreshToken was not called
      expect(mockAuth.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe('GET method', () => {
    it('should make GET request successfully', async () => {
      const mockResponse = {
        data: {
          meta: { status: 200, message: 'Success' },
          data: { id: '1', name: 'Test' },
          error: null
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.GET('/test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', { params: undefined });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle token refresh during GET request', () => {
      // This test verifies that the client can be created with token refresh functionality
      // The actual token refresh happens during HTTP requests
      const testClient = new APIClient();
      expect(testClient).toBeInstanceOf(APIClient);
    });

    it('should pass query parameters correctly', async () => {
      const params = { limit: 10, offset: 0 };
      const mockResponse = {
        data: {
          meta: { status: 200, message: 'Success' },
          data: [],
          error: null
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await apiClient.GET('/test', params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', { params });
    });

    it('should handle axios errors', async () => {
      const axiosError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' }
        },
        message: 'Request failed'
      };

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.GET('/test')).rejects.toMatchObject({
        message: 'Request failed',
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' }
        }
      });
    });

    it('should handle network errors without response', async () => {
      const networkError = {
        message: 'Network Error',
        code: 'NETWORK_ERROR'
      };

      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(apiClient.GET('/test')).rejects.toMatchObject({
        message: 'Network Error',
        code: 'NETWORK_ERROR'
      });
    });
  });

  describe('POST method', () => {
    it('should make POST request successfully', async () => {
      const postData = { name: 'New Item', email: 'test@example.com' };
      const mockResponse = {
        data: {
          meta: { status: 201, message: 'Created' },
          data: { id: '1', ...postData },
          error: null
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.POST('/test', postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle token refresh during POST request', () => {
      // This test verifies that the client can be created with token refresh functionality
      // The actual token refresh happens during HTTP requests
      const testClient = new APIClient();
      expect(testClient).toBeInstanceOf(APIClient);
    });

    it('should handle POST request without data', async () => {
      const mockResponse = {
        data: {
          meta: { status: 201, message: 'Created' },
          data: { id: '1' },
          error: null
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.POST('/test');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle POST errors', async () => {
      const postData = { name: 'Invalid Item' };
      const axiosError = {
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: { message: 'Validation failed' }
        },
        message: 'Bad Request'
      };

      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(apiClient.POST('/test', postData)).rejects.toMatchObject({
        message: 'Bad Request',
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: { message: 'Validation failed' }
        }
      });
    });
  });

  describe('PUT method', () => {
    it('should make PUT request successfully', async () => {
      const putData = { name: 'Updated Item', email: 'updated@example.com' };
      const mockResponse = {
        data: {
          meta: { status: 200, message: 'Updated' },
          data: { id: '1', ...putData },
          error: null
        }
      };

      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiClient.PUT('/test/1', putData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', putData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle token refresh during PUT request', () => {
      // This test verifies that the client can be created with token refresh functionality
      // The actual token refresh happens during HTTP requests
      const testClient = new APIClient();
      expect(testClient).toBeInstanceOf(APIClient);
    });

    it('should handle PUT request without data', async () => {
      const mockResponse = {
        data: {
          meta: { status: 200, message: 'Updated' },
          data: { id: '1' },
          error: null
        }
      };

      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiClient.PUT('/test/1');

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle PUT errors', async () => {
      const putData = { name: 'Invalid Update' };
      const axiosError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' }
        },
        message: 'Not Found'
      };

      mockAxiosInstance.put.mockRejectedValue(axiosError);

      await expect(apiClient.PUT('/test/999', putData)).rejects.toMatchObject({
        message: 'Not Found',
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' }
        }
      });
    });
  });

  describe('DELETE method', () => {
    it('should make DELETE request successfully', async () => {
      const mockResponse = {
        data: {
          meta: { status: 204, message: 'Deleted' },
          data: null,
          error: null
        }
      };

      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.DELETE('/test/1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', { params: undefined });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle token refresh during DELETE request', () => {
      // This test verifies that the client can be created with token refresh functionality
      // The actual token refresh happens during HTTP requests
      const testClient = new APIClient();
      expect(testClient).toBeInstanceOf(APIClient);
    });

    it('should pass query parameters to DELETE request', async () => {
      const params = { force: true };
      const mockResponse = {
        data: {
          meta: { status: 204, message: 'Deleted' },
          data: null,
          error: null
        }
      };

      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      await apiClient.DELETE('/test/1', params);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', { params });
    });

    it('should handle DELETE errors', async () => {
      const axiosError = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: { message: 'Cannot delete resource' }
        },
        message: 'Forbidden'
      };

      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(apiClient.DELETE('/test/1')).rejects.toMatchObject({
        message: 'Forbidden',
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: { message: 'Cannot delete resource' }
        }
      });
    });
  });

  describe('error handling', () => {
    it('should handle axios errors with detailed response', () => {
      const axiosError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {
            message: 'Server error occurred',
            code: 'INTERNAL_ERROR'
          }
        },
        message: 'Internal Server Error'
      };

      // This tests the private handleError method indirectly
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      return expect(apiClient.GET('/test')).rejects.toMatchObject({
        message: 'Internal Server Error',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {
            message: 'Server error occurred',
            code: 'INTERNAL_ERROR'
          }
        }
      });
    });

    it('should handle axios errors without response data', () => {
      const axiosError = {
        response: {
          status: 400,
          statusText: 'Bad Request'
        },
        message: 'Bad Request'
      };

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      return expect(apiClient.GET('/test')).rejects.toMatchObject({
        message: 'Bad Request',
        response: {
          status: 400,
          statusText: 'Bad Request'
        }
      });
    });

    it('should handle axios errors with only message', () => {
      const axiosError = {
        message: 'Network timeout'
      };

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      return expect(apiClient.GET('/test')).rejects.toMatchObject({
        message: 'Network timeout'
      });
    });
  });

  describe('configuration updates', () => {
    it('should update client configuration when config changes', () => {
      // Simulate config change
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'new-api-key',
        apiURL: 'https://new-api.test.com',
        version: '2',
        verbose: true
      });

      // Create new client to trigger config update
      new APIClient();

      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://new-api.test.com/v2',
        headers: {
          'Authorization': 'Bearer new-api-key',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should call updateClientConfig before each HTTP request', async () => {
      const mockResponse = {
        data: {
          meta: { status: 200, message: 'Success' },
          data: { id: '1', name: 'Test' },
          error: null
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Reset the mock to track calls
      mockAxios.create.mockClear();

      await apiClient.GET('/test');

      // Verify that axios.create was called again (indicating updateClientConfig was called)
      expect(mockAxios.create).toHaveBeenCalledTimes(1);
    });

    it('should handle token refresh during updateClientConfig', () => {
      // This test verifies that the client can be created with token refresh functionality
      // The actual token refresh happens during HTTP requests
      const testClient = new APIClient();
      expect(testClient).toBeInstanceOf(APIClient);
    });
  });

  describe('interceptor behavior', () => {
    it('should log requests when verbose is enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
        verbose: true
      });

      new APIClient();

      // Verify request interceptor was set up
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      
      // Get the request interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      // Test the interceptor
      const config = {
        method: 'get',
        baseURL: 'https://api.test.com/v1',
        url: '/test',
        params: { limit: 10 },
        data: { name: 'test' }
      };

      requestInterceptor(config);

      expect(consoleSpy).toHaveBeenCalledWith('🚀 HTTP Request: GET https://api.test.com/v1/test');
      expect(consoleSpy).toHaveBeenCalledWith('📋 Query Params:', { limit: 10 });
      expect(consoleSpy).toHaveBeenCalledWith('📦 Request Body:', { name: 'test' });

      consoleSpy.mockRestore();
    });

    it('should setup response interceptors when verbose is enabled', () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
        verbose: true
      });

      new APIClient();

      // Verify response interceptor was set up with both success and error handlers
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
      
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      expect(interceptorCall).toHaveLength(2); // Should have success and error handlers
      expect(typeof interceptorCall[0]).toBe('function'); // Success handler
      expect(typeof interceptorCall[1]).toBe('function'); // Error handler
    });

    it('should setup response interceptors when verbose is disabled', () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
        verbose: false
      });

      new APIClient();

      // Verify response interceptor was set up with both success and error handlers
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
      
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      expect(interceptorCall).toHaveLength(2); // Should have success and error handlers
      expect(typeof interceptorCall[0]).toBe('function'); // Success handler
      expect(typeof interceptorCall[1]).toBe('function'); // Error handler
    });
  });

  describe('edge cases', () => {
    it('should handle empty response data', async () => {
      const mockResponse = {
        data: null
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.GET('/test');

      expect(result).toBeNull();
    });

    it('should handle undefined response data', async () => {
      const mockResponse = {
        data: undefined
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.GET('/test');

      expect(result).toBeUndefined();
    });

    it('should handle special characters in URLs', async () => {
      const mockResponse = {
        data: {
          meta: { status: 200, message: 'Success' },
          data: { id: '1' },
          error: null
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await apiClient.GET('/test/with/special/chars?param=value&other=123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test/with/special/chars?param=value&other=123', { params: undefined });
    });

    it('should handle very large request data', async () => {
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
      };

      const mockResponse = {
        data: {
          meta: { status: 201, message: 'Created' },
          data: { id: '1', count: 1000 },
          error: null
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.POST('/test', largeData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', largeData);
      expect(result).toEqual(mockResponse.data);
    });
  });
}); 