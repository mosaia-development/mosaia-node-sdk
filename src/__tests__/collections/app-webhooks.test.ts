import AppWebhooks from '../../collections/app-webhooks';
import { BaseCollection } from '../../collections/base-collection';
import { AppWebhook } from '../../models';
import { GetAppWebhooksPayload, GetAppWebhookPayload, AppWebhookInterface } from '../../types';

// Mock the BaseAPI
jest.mock('../../collections/base-collection', () => ({
      BaseCollection: jest.fn()
}));
const { BaseCollection: MockBaseCollection } = require('../../collections/base-collection');

// Mock the AppWebhook model
jest.mock('../../models');
const MockAppWebhook = AppWebhook as jest.MockedClass<typeof AppWebhook>;

describe('AppWebhooks', () => {
  let appWebhooks: AppWebhooks;
  let mockBaseAPI: jest.Mocked<BaseCollection<AppWebhookInterface, AppWebhook, GetAppWebhooksPayload, GetAppWebhookPayload>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock BaseAPI instance
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    } as any;

    // Setup mock returns
    MockBaseCollection.mockImplementation(() => mockBaseAPI);
    MockAppWebhook.mockImplementation((data: any) => ({ data } as any));

    appWebhooks = new AppWebhooks();
  });

  describe('constructor', () => {
    it('should create AppWebhooks instance extending BaseCollection', () => {
      expect(appWebhooks).toBeDefined();
      expect(typeof appWebhooks.get).toBe('function');
      expect(typeof appWebhooks.create).toBe('function');
    });

    it('should initialize with correct URI and AppWebhook model', () => {
      expect(MockBaseCollection).toHaveBeenCalledWith('/hook', AppWebhook);
    });

    it('should initialize with custom URI when provided', () => {
      const customAppWebhooks = new AppWebhooks('/api/v1');
      expect(MockBaseCollection).toHaveBeenCalledWith('/api/v1/hook', AppWebhook);
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultAppWebhooks = new AppWebhooks();
      expect(MockBaseCollection).toHaveBeenCalledWith('/hook', AppWebhook);
    });
  });

  describe('get method', () => {
    it('should get all app webhooks successfully', async () => {
      const mockWebhooks = [
        { id: '1', app: 'app-1', url: 'https://example.com/webhook', events: ['REQUEST'] },
        { id: '2', app: 'app-2', url: 'https://example.com/webhook2', events: ['REQUEST'] }
      ];

      const mockResponse = {
        data: mockWebhooks.map(webhook => new MockAppWebhook(webhook))
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await appWebhooks.get();

      expect(mockBaseAPI.get).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific app webhook by ID', async () => {
      const mockWebhook = { id: '1', app: 'app-1', url: 'https://example.com/webhook', events: ['REQUEST'] };
      const mockResponse = new MockAppWebhook(mockWebhook);
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await appWebhooks.get({}, '1');

      expect(mockBaseAPI.get).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get app webhooks with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        app: 'app-1',
        active: true
      };

      const mockWebhooks = [
        { id: '1', app: 'app-1', url: 'https://example.com/webhook', events: ['REQUEST'] }
      ];

      const mockResponse = {
        data: mockWebhooks.map(webhook => new MockAppWebhook(webhook))
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await appWebhooks.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty app webhooks list', async () => {
      const mockResponse = {
        data: []
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await appWebhooks.get();

      expect(result).toEqual({ data: [] });
    });

    it('should handle null response', async () => {
      mockBaseAPI.get.mockResolvedValue(null as any);

      const result = await appWebhooks.get();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch app webhooks');
      mockBaseAPI.get.mockRejectedValue(error);

      await expect(appWebhooks.get()).rejects.toThrow('Failed to fetch app webhooks');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockBaseAPI.get.mockRejectedValue(networkError);

      await expect(appWebhooks.get()).rejects.toThrow('Network error');
    });
  });

  describe('create method', () => {
    it('should create a new app webhook successfully', async () => {
      const webhookData = {
        app: 'app-3',
        url: 'https://app3.com/webhook',
        events: ['REQUEST'],
        secret: 'webhook-secret-key'
      };

      const mockWebhook = { id: '3', ...webhookData };
      const mockResponse = new MockAppWebhook(mockWebhook);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appWebhooks.create(webhookData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(webhookData);
      expect(result).toEqual(mockResponse);
    });

    it('should create app webhook with minimal data', async () => {
      const webhookData = {
        app: 'app-4',
        url: 'https://app4.com/webhook',
        events: ['REQUEST']
      };

      const mockWebhook = { id: '4', ...webhookData };
      const mockResponse = new MockAppWebhook(mockWebhook);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appWebhooks.create(webhookData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(webhookData);
      expect(result).toEqual(mockResponse);
    });

    it('should create app webhook with all optional fields', async () => {
      const webhookData = {
        app: 'app-5',
        url: 'https://app5.com/webhook',
        events: ['REQUEST', 'RESPONSE'],
        secret: 'full-webhook-secret-key',
        active: true,
        external_id: 'ext-webhook-123',
        extensors: {
          environment: 'production',
          team: 'engineering'
        }
      };

      const mockWebhook = { id: '5', ...webhookData };
      const mockResponse = new MockAppWebhook(mockWebhook);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appWebhooks.create(webhookData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(webhookData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const webhookData = {
        app: 'invalid-app',
        url: 'invalid-url',
        events: ['REQUEST']
      };

      const error = new Error('Validation failed');
      mockBaseAPI.create.mockRejectedValue(error);

      await expect(appWebhooks.create(webhookData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const webhookData = {
        app: 'app-6',
        url: 'https://app6.com/webhook',
        events: ['REQUEST']
      };

      const networkError = new Error('Network error');
      mockBaseAPI.create.mockRejectedValue(networkError);

      await expect(appWebhooks.create(webhookData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty app webhook data in create', async () => {
      const webhookData = {
        app: '',
        url: '',
        events: []
      };

      const mockWebhook = { id: '6', ...webhookData };
      const mockResponse = new MockAppWebhook(mockWebhook);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appWebhooks.create(webhookData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in app webhook data', async () => {
      const webhookData = {
        app: 'app-with-special-chars_123',
        url: 'https://example.com/webhook?param=value&other=123',
        events: ['REQUEST'],
        secret: 'secret-with-special-chars@#$%^&*()'
      };

      const mockWebhook = { id: '7', ...webhookData };
      const mockResponse = new MockAppWebhook(mockWebhook);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appWebhooks.create(webhookData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(webhookData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long app webhook data', async () => {
      const longAppId = 'a'.repeat(1000);
      const longUrl = 'https://example.com/' + 'b'.repeat(2000);
      const webhookData = {
        app: longAppId,
        url: longUrl,
        events: ['REQUEST']
      };

      const mockWebhook = { id: '8', ...webhookData };
      const mockResponse = new MockAppWebhook(mockWebhook);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appWebhooks.create(webhookData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        app: 'app@example.com',
        external_id: 'id-with-special-chars_123'
      };

      const mockWebhooks = [
        { id: '1', app: 'Test App', url: 'https://test.com/webhook', events: ['REQUEST'] }
      ];

      const mockResponse = mockWebhooks.map(webhook => new MockAppWebhook(webhook));
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      await appWebhooks.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        app: 'app-123',
        active: true,
        external_id: 'ext-123'
      };

      const mockWebhooks = [
        { id: '1', app: 'app-123', url: 'https://app123.com/webhook', events: ['REQUEST'] }
      ];

      const mockResponse = mockWebhooks.map(webhook => new MockAppWebhook(webhook));
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      await appWebhooks.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete app webhook management flow', async () => {
      // Step 1: Get all app webhooks
      const mockWebhooks = [
        { id: '1', app: 'app-1', url: 'https://app1.com/webhook', events: ['REQUEST'] },
        { id: '2', app: 'app-2', url: 'https://app2.com/webhook', events: ['REQUEST'] }
      ];

      const mockGetResponse = mockWebhooks.map(webhook => new MockAppWebhook(webhook));
      mockBaseAPI.get.mockResolvedValueOnce(mockGetResponse as any);

      const allWebhooks = await appWebhooks.get();
      expect(allWebhooks).toHaveLength(2);

      // Step 2: Get specific app webhook
      const mockWebhook = { id: '1', app: 'app-1', url: 'https://app1.com/webhook', events: ['REQUEST'] };
      const mockGetWebhookResponse = new MockAppWebhook(mockWebhook);
      mockBaseAPI.get.mockResolvedValueOnce(mockGetWebhookResponse as any);

      const specificWebhook = await appWebhooks.get({}, '1');
      expect(specificWebhook).toEqual(mockGetWebhookResponse);

      // Step 3: Create new app webhook
      const newWebhookData = {
        app: 'app-3',
        url: 'https://app3.com/webhook',
        events: ['REQUEST']
      };

      const mockNewWebhook = { id: '3', ...newWebhookData };
      const mockCreateResponse = new MockAppWebhook(mockNewWebhook);
      mockBaseAPI.create.mockResolvedValueOnce(mockCreateResponse);

      const createdWebhook = await appWebhooks.create(newWebhookData);
      expect(createdWebhook).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageWebhooks = [
        { id: '1', app: 'app-1', url: 'https://app1.com/webhook', events: ['REQUEST'] },
        { id: '2', app: 'app-2', url: 'https://app2.com/webhook', events: ['REQUEST'] }
      ];

      const mockFirstPage = firstPageWebhooks.map(webhook => new MockAppWebhook(webhook));
      mockBaseAPI.get.mockResolvedValueOnce(mockFirstPage as any);

      const firstPage = await appWebhooks.get({ limit: 2, offset: 0 });
      expect(firstPage).toHaveLength(2);

      // Second page
      const secondPageWebhooks = [
        { id: '3', app: 'app-3', url: 'https://app3.com/webhook', events: ['REQUEST'] },
        { id: '4', app: 'app-4', url: 'https://app4.com/webhook', events: ['REQUEST'] }
      ];

      const mockSecondPage = secondPageWebhooks.map(webhook => new MockAppWebhook(webhook));
      mockBaseAPI.get.mockResolvedValueOnce(mockSecondPage as any);

      const secondPage = await appWebhooks.get({ limit: 2, offset: 2 });
      expect(secondPage).toHaveLength(2);
    });

    it('should handle search and filtering scenarios', async () => {
      // Filter by app
      const appWebhooksData = [
        { id: '1', app: 'app-1', url: 'https://app1.com/webhook', events: ['REQUEST'] }
      ];

      const mockAppWebhooks = appWebhooksData.map(webhook => new MockAppWebhook(webhook));
      mockBaseAPI.get.mockResolvedValueOnce(mockAppWebhooks as any);

      const appResults = await appWebhooks.get({ app: 'app-1' });
      expect(appResults).toHaveLength(1);

      // Filter by active status
      const activeWebhooksData = [
        { id: '1', app: 'app-1', url: 'https://app1.com/webhook', events: ['REQUEST'], active: true }
      ];

      const mockActiveWebhooks = activeWebhooksData.map(webhook => new MockAppWebhook(webhook));
      mockBaseAPI.get.mockResolvedValueOnce(mockActiveWebhooks as any);

      const activeResults = await appWebhooks.get({ active: true });
      expect(activeResults).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle API validation errors', async () => {
      const webhookData = {
        app: 'invalid-app',
        url: 'invalid-url',
        events: ['REQUEST']
      };

      const validationError = new Error('Invalid webhook URL format');
      mockBaseAPI.create.mockRejectedValue(validationError);

      await expect(appWebhooks.create(webhookData)).rejects.toThrow('Invalid webhook URL format');
    });

    it('should handle duplicate app webhook creation', async () => {
      const webhookData = {
        app: 'app-1',
        url: 'https://app1.com/webhook',
        events: ['REQUEST']
      };

      const duplicateError = new Error('App webhook with this configuration already exists');
      mockBaseAPI.create.mockRejectedValue(duplicateError);

      await expect(appWebhooks.create(webhookData)).rejects.toThrow('App webhook with this configuration already exists');
    });

    it('should handle app webhook not found', async () => {
      const notFoundError = new Error('App webhook not found');
      mockBaseAPI.get.mockRejectedValue(notFoundError);

      await expect(appWebhooks.get({}, 'nonexistent-id')).rejects.toThrow('App webhook not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockBaseAPI.get.mockRejectedValue(serverError);

      await expect(appWebhooks.get()).rejects.toThrow('Internal server error');
    });

    it('should handle app validation errors', async () => {
      const webhookData = {
        app: 'nonexistent-app',
        url: 'https://app.com/webhook',
        events: ['REQUEST']
      };

      const appError = new Error('App not found');
      mockBaseAPI.create.mockRejectedValue(appError);

      await expect(appWebhooks.create(webhookData)).rejects.toThrow('App not found');
    });

    it('should handle invalid event types', async () => {
      const webhookData = {
        app: 'app-1',
        url: 'https://app.com/webhook',
        events: ['INVALID_EVENT']
      };

      const eventError = new Error('Invalid event type');
      mockBaseAPI.create.mockRejectedValue(eventError);

      await expect(appWebhooks.create(webhookData)).rejects.toThrow('Invalid event type');
    });
  });
});

