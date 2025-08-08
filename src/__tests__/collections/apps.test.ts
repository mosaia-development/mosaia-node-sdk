import Apps from '../../collections/apps';
import { App } from '../../models';
import { GetAppsPayload, GetAppPayload, AppInterface } from '../../types';

// Mock the App model
jest.mock('../../models');
const MockApp = App as jest.MockedClass<typeof App>;

// Mock the BaseAPI class properly
jest.mock('../../collections/base-collection');
const { BaseCollection } = require('../../collections/base-collection');
const MockBaseCollection = BaseCollection as jest.MockedClass<typeof BaseCollection>;

// Mock the ConfigurationManager
jest.mock('../../config', () => ({
  ConfigurationManager: {
    getInstance: jest.fn().mockReturnValue({
      getConfig: jest.fn().mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
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
    DELETE: jest.fn(),
  }));
});

describe('Apps', () => {
  let apps: any;
  let mockGet: jest.MockedFunction<any>;
  let mockCreate: jest.MockedFunction<any>;
  let mockBaseAPI: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock returns
    MockApp.mockImplementation((data: any) => ({ data } as any));

    // Setup BaseAPI mock
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    };
    MockBaseCollection.mockImplementation(() => mockBaseAPI);

    apps = new Apps();
    
    // Get the mocked methods from the instance
    mockGet = apps.get;
    mockCreate = apps.create;
  });

  describe('constructor', () => {
    it('should create Apps instance extending BaseCollection', () => {
      expect(apps).toBeDefined();
      expect(typeof apps.get).toBe('function');
      expect(typeof apps.create).toBe('function');
    });

    it('should initialize with correct URI and App model', () => {
      expect(MockBaseCollection).toHaveBeenCalledWith('/app', App);
    });

    it('should initialize with custom URI when provided', () => {
      const customApps = new Apps('/api/v1');
      expect(MockBaseCollection).toHaveBeenCalledWith('/api/v1/app', App);
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultApps = new Apps();
      expect(MockBaseCollection).toHaveBeenCalledWith('/app', App);
    });
  });

  describe('get method', () => {
    it('should get all apps successfully', async () => {
      const mockApps = [
        { id: '1', name: 'Support App', short_description: 'Customer support application' },
        { id: '2', name: 'Analytics App', short_description: 'Data analytics platform' }
      ];

      const mockResponse = {
        data: mockApps.map(app => new MockApp(app))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await apps.get();

      expect(mockGet).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific app by ID', async () => {
      const mockApp = { id: '1', name: 'Support App', short_description: 'Customer support application' };
      const mockResponse = new MockApp(mockApp);
      mockGet.mockResolvedValue(mockResponse);

      const result = await apps.get({}, '1');

      expect(mockGet).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get apps with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        q: 'support',
        active: true,
        org: 'org-123'
      };

      const mockApps = [
        { id: '1', name: 'Support App', short_description: 'Customer support application' }
      ];

      const mockResponse = {
        data: mockApps.map(app => new MockApp(app))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await apps.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty apps list', async () => {
      const mockResponse = { data: [] };
      mockGet.mockResolvedValue(mockResponse);

      const result = await apps.get();

      expect(result).toEqual({ data: [] });
    });

    it('should handle null response', async () => {
      mockGet.mockResolvedValue(null);

      const result = await apps.get();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch apps');
      mockBaseAPI.get.mockRejectedValue(error);

      await expect(apps.get()).rejects.toThrow('Failed to fetch apps');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockBaseAPI.get.mockRejectedValue(networkError);

      await expect(apps.get()).rejects.toThrow('Network error');
    });
  });

  describe('create method', () => {
    it('should create a new app successfully', async () => {
      const appData = {
        name: 'New App',
        short_description: 'A new application',
        long_description: 'A detailed description of the new application',
        external_app_url: 'https://newapp.example.com',
        external_api_key: 'external-key-123'
      };

      const mockApp = { id: '3', ...appData };
      const mockResponse = new MockApp(mockApp);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await apps.create(appData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(appData);
      expect(result).toEqual(mockResponse);
    });

    it('should create app with minimal data', async () => {
      const appData = {
        name: 'Minimal App',
        short_description: 'A minimal application'
      };

      const mockApp = { id: '4', ...appData };
      const mockResponse = new MockApp(mockApp);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await apps.create(appData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(appData);
      expect(result).toEqual(mockResponse);
    });

    it('should create app with all optional fields', async () => {
      const appData = {
        name: 'Full App',
        short_description: 'A fully configured application',
        long_description: 'A detailed description of the application',
        image: 'https://example.com/app.jpg',
        external_app_url: 'https://fullapp.example.com',
        external_api_key: 'full-external-key-123',
        external_headers: {
          'X-Custom-Header': 'custom-value',
          'Authorization': 'Bearer token'
        },
        active: true,
        tags: ['support', 'ai'],
        keywords: ['customer service', 'automation'],
        external_id: 'ext-app-123'
      };

      const mockApp = { id: '5', ...appData };
      const mockResponse = new MockApp(mockApp);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await apps.create(appData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(appData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const appData = {
        name: 'Invalid App',
        short_description: 'An invalid application'
      };

      const error = new Error('Validation failed');
      mockBaseAPI.create.mockRejectedValue(error);

      await expect(apps.create(appData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const appData = {
        name: 'Network App',
        short_description: 'A network application'
      };

      const networkError = new Error('Network error');
      mockBaseAPI.create.mockRejectedValue(networkError);

      await expect(apps.create(appData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty app data in create', async () => {
      const appData = {
        name: '',
        short_description: '',
        long_description: ''
      };

      const mockApp = { id: '6', ...appData };
      const mockResponse = new MockApp(mockApp);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await apps.create(appData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in app data', async () => {
      const appData = {
        name: 'App with Special Chars: @#$%^&*()',
        short_description: 'App with special characters: éñüñçóðé',
        external_app_url: 'https://example.com/app?param=value&other=123'
      };

      const mockApp = { id: '7', ...appData };
      const mockResponse = new MockApp(mockApp);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await apps.create(appData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(appData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long app data', async () => {
      const longName = 'a'.repeat(1000);
      const longDescription = 'b'.repeat(2000);
      const appData = {
        name: longName,
        short_description: longDescription,
        external_app_url: 'https://example.com/app'
      };

      const mockApp = { id: '8', ...appData };
      const mockResponse = new MockApp(mockApp);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await apps.create(appData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        q: 'app@example.com',
        tags: ['tag1', 'tag2'],
        external_id: 'id-with-special-chars_123'
      };

      const mockApps = [
        { id: '1', name: 'Test App', short_description: 'Test application' }
      ];

      const mockResponse = mockApps.map(app => new MockApp(app));
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      await apps.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        q: 'support portal',
        active: true,
        tags: ['support', 'ai'],
        keywords: ['customer service'],
        external_id: 'ext-123',
        org: 'org-456'
      };

      const mockApps = [
        { id: '1', name: 'Support Portal', short_description: 'Customer support application' }
      ];

      const mockResponse = mockApps.map(app => new MockApp(app));
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      await apps.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete app management flow', async () => {
      // Step 1: Get all apps
      const mockApps = [
        { id: '1', name: 'Support Portal', short_description: 'Customer support application' },
        { id: '2', name: 'Sales Dashboard', short_description: 'Sales management application' }
      ];

      const mockGetResponse = {
        data: mockApps.map(app => new MockApp(app))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockGetResponse);

      const allApps = await apps.get();
      expect(allApps.data).toHaveLength(2);

      // Step 2: Get specific app
      const mockApp = { id: '1', name: 'Support Portal', short_description: 'Customer support application' };
      const mockGetAppResponse = new MockApp(mockApp);
      mockBaseAPI.get.mockResolvedValueOnce(mockGetAppResponse);

      const specificApp = await apps.get({}, '1');
      expect(specificApp).toEqual(mockGetAppResponse);

      // Step 3: Create new app
      const newAppData = {
        name: 'New App',
        short_description: 'A new application',
        external_app_url: 'https://newapp.example.com'
      };

      const mockNewApp = { id: '3', ...newAppData };
      const mockCreateResponse = new MockApp(mockNewApp);
      mockBaseAPI.create.mockResolvedValueOnce(mockCreateResponse);

      const createdApp = await apps.create(newAppData);
      expect(createdApp).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageApps = [
        { id: '1', name: 'App 1', short_description: 'First application' },
        { id: '2', name: 'App 2', short_description: 'Second application' }
      ];

      const mockFirstPage = {
        data: firstPageApps.map(app => new MockApp(app))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockFirstPage);

      const firstPage = await apps.get({ limit: 2, offset: 0 });
      expect(firstPage.data).toHaveLength(2);

      // Second page
      const secondPageApps = [
        { id: '3', name: 'App 3', short_description: 'Third application' },
        { id: '4', name: 'App 4', short_description: 'Fourth application' }
      ];

      const mockSecondPage = {
        data: secondPageApps.map(app => new MockApp(app))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockSecondPage);

      const secondPage = await apps.get({ limit: 2, offset: 2 });
      expect(secondPage.data).toHaveLength(2);
    });

    it('should handle search and filtering scenarios', async () => {
      // Search by name
      const searchResults = [
        { id: '1', name: 'Support Portal', short_description: 'Customer support application' }
      ];

      const mockSearchResults = {
        data: searchResults.map(app => new MockApp(app))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockSearchResults);

      const searchResults1 = await apps.get({ q: 'support' });
      expect(searchResults1.data).toHaveLength(1);

      // Filter by organization
      const orgApps = [
        { id: '1', name: 'Org App', short_description: 'Organization application' }
      ];

      const mockOrgApps = {
        data: orgApps.map(app => new MockApp(app))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockOrgApps);

      const orgResults = await apps.get({ org: 'org-123' });
      expect(orgResults.data).toHaveLength(1);

      // Filter by tags
      const taggedApps = [
        { id: '1', name: 'Tagged App', short_description: 'Application with tags' }
      ];

      const mockTaggedApps = {
        data: taggedApps.map(app => new MockApp(app))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockTaggedApps);

      const taggedResults = await apps.get({ tags: ['support'] });
      expect(taggedResults.data).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle API validation errors', async () => {
      const appData = {
        name: 'Invalid App',
        short_description: 'An app with invalid data'
      };

      const validationError = new Error('App name is required');
      mockBaseAPI.create.mockRejectedValue(validationError);

      await expect(apps.create(appData)).rejects.toThrow('App name is required');
    });

    it('should handle duplicate app creation', async () => {
      const appData = {
        name: 'Duplicate App',
        short_description: 'An app that already exists'
      };

      const duplicateError = new Error('App with this name already exists');
      mockBaseAPI.create.mockRejectedValue(duplicateError);

      await expect(apps.create(appData)).rejects.toThrow('App with this name already exists');
    });

    it('should handle app not found', async () => {
      const notFoundError = new Error('App not found');
      mockBaseAPI.get.mockRejectedValue(notFoundError);

      await expect(apps.get({}, 'nonexistent-id')).rejects.toThrow('App not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockBaseAPI.get.mockRejectedValue(serverError);

      await expect(apps.get()).rejects.toThrow('Internal server error');
    });

    it('should handle external URL validation errors', async () => {
      const appData = {
        name: 'Invalid URL App',
        short_description: 'App with invalid external URL',
        external_app_url: 'invalid-url'
      };

      const urlError = new Error('Invalid external URL format');
      mockBaseAPI.create.mockRejectedValue(urlError);

      await expect(apps.create(appData)).rejects.toThrow('Invalid external URL format');
    });
  });
}); 