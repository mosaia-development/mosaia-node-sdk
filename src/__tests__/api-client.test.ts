// Mock axios module with interceptors
const mockCreate = jest.fn();
jest.mock('axios', () => ({
  create: mockCreate
}));

import APIClient from '../apis/api-client';
import { MosiaConfig } from '../types';
import axios from 'axios';

describe('APIClient', () => {
  let apiClient: APIClient;
  const mockConfig: MosiaConfig = {
    apiKey: 'test-api-key',
    baseURL: 'https://api.test.com/v1',
    version: '1'
  };

  beforeEach(() => {
    mockCreate.mockReset();
  });

  describe('Constructor', () => {
    it('should create an APIClient instance', () => {
      const mockAxiosInstance = {
        interceptors: { response: { use: jest.fn() } },
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };
      mockCreate.mockReturnValue(mockAxiosInstance);
      apiClient = new APIClient(mockConfig);
      expect(apiClient).toBeInstanceOf(APIClient);
    });

    it('should configure axios with correct base URL and headers', () => {
      const mockAxiosInstance = {
        interceptors: { response: { use: jest.fn() } },
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };
      mockCreate.mockReturnValue(mockAxiosInstance);
      apiClient = new APIClient(mockConfig);
      expect(mockCreate).toHaveBeenCalledWith({
        baseURL: 'https://api.test.com/v1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('GET requests', () => {
    it('should make GET request successfully', async () => {
      const mockResponse = {
        id: '1',
        name: 'Test'
      };
      const mockAxiosInstance = {
        interceptors: { response: { use: jest.fn() } },
        get: jest.fn().mockResolvedValue({ data: mockResponse, status: 200 }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };
      mockCreate.mockReturnValue(mockAxiosInstance);
      const client = new APIClient(mockConfig);
      const result = await client.GET('/test');
      expect(result).toEqual(mockResponse);
    });

    it('should handle GET request with parameters', async () => {
      const mockResponse = {
        data: { id: '1', name: 'Test' },
        status: 200
      };
      const mockAxiosInstance = {
        interceptors: { response: { use: jest.fn() } },
        get: jest.fn().mockResolvedValue({ data: mockResponse, status: 200 }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };
      mockCreate.mockReturnValue(mockAxiosInstance);
      const client = new APIClient(mockConfig);
      const params = { limit: 10, offset: 0 };
      await client.GET('/test', params);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', { params });
    });
  });

  describe('POST requests', () => {
    it('should make POST request successfully', async () => {
      const mockResponse = {
        id: '1',
        name: 'Test'
      };
      const mockAxiosInstance = {
        interceptors: { response: { use: jest.fn() } },
        get: jest.fn(),
        post: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 }),
        put: jest.fn(),
        delete: jest.fn(),
      };
      mockCreate.mockReturnValue(mockAxiosInstance);
      const client = new APIClient(mockConfig);
      const data = { name: 'Test' };
      const result = await client.POST('/test', data);
      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', data);
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request successfully', async () => {
      const mockResponse = {
        id: '1',
        name: 'Updated Test'
      };
      const mockAxiosInstance = {
        interceptors: { response: { use: jest.fn() } },
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn().mockResolvedValue({ data: mockResponse, status: 200 }),
        delete: jest.fn(),
      };
      mockCreate.mockReturnValue(mockAxiosInstance);
      const client = new APIClient(mockConfig);
      const data = { name: 'Updated Test' };
      const result = await client.PUT('/test/1', data);
      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', data);
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request successfully', async () => {
      const mockAxiosInstance = {
        interceptors: { response: { use: jest.fn() } },
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn().mockResolvedValue({ data: null, status: 204 }),
      };
      mockCreate.mockReturnValue(mockAxiosInstance);
      const client = new APIClient(mockConfig);
      const result = await client.DELETE('/test/1');
      expect(result).toBeNull();
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', { params: undefined });
    });

    it('should handle DELETE request with parameters', async () => {
      const mockAxiosInstance = {
        interceptors: { response: { use: jest.fn() } },
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn().mockResolvedValue({ data: null, status: 204 }),
      };
      mockCreate.mockReturnValue(mockAxiosInstance);
      const client = new APIClient(mockConfig);
      const params = { force: true };
      await client.DELETE('/test/1', params);
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', { params });
    });
  });

  describe('Error handling', () => {
    it('should handle axios errors', async () => {
      const mockError = {
        message: 'Network Error',
        code: 'NETWORK_ERROR',
        response: { status: 500 }
      };
      const mockAxiosInstance = {
        interceptors: { response: { use: jest.fn() } },
        get: jest.fn().mockRejectedValue(mockError),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };
      mockCreate.mockReturnValue(mockAxiosInstance);
      const client = new APIClient(mockConfig);
      await expect(client.GET('/test')).rejects.toMatchObject({
        message: 'Network Error',
        code: 'NETWORK_ERROR',
      });
    });
  });
}); 