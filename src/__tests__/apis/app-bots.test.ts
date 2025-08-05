import AppBots from '../../apis/app-bots';
import { BaseAPI } from '../../apis/base-api';
import { AppBot } from '../../models';
import { GetAppBotsPayload, GetAppBotPayload, AppBotInterface } from '../../types';

// Mock the BaseAPI
jest.mock('../../apis/base-api', () => ({
  BaseAPI: jest.fn()
}));
const { BaseAPI: MockBaseAPI } = require('../../apis/base-api');

// Mock the AppBot model
jest.mock('../../models');
const MockAppBot = AppBot as jest.MockedClass<typeof AppBot>;

describe('AppBots', () => {
  let appBots: AppBots;
  let mockBaseAPI: jest.Mocked<BaseAPI<AppBotInterface, AppBot, GetAppBotsPayload, GetAppBotPayload>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock BaseAPI instance
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    } as any;

    // Setup mock returns
    MockBaseAPI.mockImplementation(() => mockBaseAPI);
    MockAppBot.mockImplementation((data: any) => ({ data } as any));

    appBots = new AppBots();
  });

  describe('constructor', () => {
    it('should create AppBots instance extending BaseAPI', () => {
      expect(appBots).toBeDefined();
      expect(typeof appBots.get).toBe('function');
      expect(typeof appBots.create).toBe('function');
    });

    it('should initialize with correct URI and AppBot model', () => {
      expect(MockBaseAPI).toHaveBeenCalledWith('/bot', AppBot);
    });

    it('should initialize with custom URI when provided', () => {
      const customAppBots = new AppBots('/api/v1');
      expect(MockBaseAPI).toHaveBeenCalledWith('/api/v1/bot', AppBot);
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultAppBots = new AppBots();
      expect(MockBaseAPI).toHaveBeenCalledWith('/bot', AppBot);
    });
  });

  describe('get method', () => {
    it('should get all app bots successfully', async () => {
      const mockBots = [
        { id: '1', app: 'app-1', response_url: 'https://example.com/webhook' },
        { id: '2', app: 'app-2', response_url: 'https://example.com/webhook2' }
      ];

      const mockResponse = {
        data: mockBots.map(bot => new MockAppBot(bot))
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await appBots.get();

      expect(mockBaseAPI.get).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific app bot by ID', async () => {
      const mockBot = { id: '1', app: 'app-1', response_url: 'https://example.com/webhook' };
      const mockResponse = new MockAppBot(mockBot);
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await appBots.get({}, '1');

      expect(mockBaseAPI.get).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get app bots with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        app: 'app-1',
        active: true
      };

      const mockBots = [
        { id: '1', app: 'app-1', response_url: 'https://example.com/webhook' }
      ];

      const mockResponse = {
        data: mockBots.map(bot => new MockAppBot(bot))
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await appBots.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty app bots list', async () => {
      const mockResponse = {
        data: []
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await appBots.get();

      expect(result).toEqual({ data: [] });
    });

    it('should handle null response', async () => {
      mockBaseAPI.get.mockResolvedValue(null as any);

      const result = await appBots.get();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch app bots');
      mockBaseAPI.get.mockRejectedValue(error);

      await expect(appBots.get()).rejects.toThrow('Failed to fetch app bots');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockBaseAPI.get.mockRejectedValue(networkError);

      await expect(appBots.get()).rejects.toThrow('Network error');
    });
  });

  describe('create method', () => {
    it('should create a new app bot successfully', async () => {
      const appBotData = {
        app: 'app-3',
        response_url: 'https://app3.com/webhook',
        agent: 'agent-3',
        api_key: 'bot-api-key-123'
      };

      const mockAppBot = { id: '3', ...appBotData };
      const mockResponse = new MockAppBot(mockAppBot);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appBots.create(appBotData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(appBotData);
      expect(result).toEqual(mockResponse);
    });

    it('should create app bot with minimal data', async () => {
      const appBotData = {
        app: 'app-4',
        response_url: 'https://app4.com/webhook',
        agent: 'agent-4'
      };

      const mockAppBot = { id: '4', ...appBotData };
      const mockResponse = new MockAppBot(mockAppBot);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appBots.create(appBotData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(appBotData);
      expect(result).toEqual(mockResponse);
    });

    it('should create app bot with all optional fields', async () => {
      const appBotData = {
        app: 'app-5',
        response_url: 'https://app5.com/webhook',
        agent: 'agent-5',
        api_key: 'full-bot-api-key-123',
        active: true,
        external_id: 'ext-bot-123'
      };

      const mockAppBot = { id: '5', ...appBotData };
      const mockResponse = new MockAppBot(mockAppBot);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appBots.create(appBotData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(appBotData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const appBotData = {
        app: 'invalid-app',
        response_url: 'invalid-url',
        agent: 'invalid-agent'
      };

      const error = new Error('Validation failed');
      mockBaseAPI.create.mockRejectedValue(error);

      await expect(appBots.create(appBotData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const appBotData = {
        app: 'app-6',
        response_url: 'https://app6.com/webhook',
        agent: 'agent-6'
      };

      const networkError = new Error('Network error');
      mockBaseAPI.create.mockRejectedValue(networkError);

      await expect(appBots.create(appBotData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty app bot data in create', async () => {
      const appBotData = {
        app: '',
        response_url: '',
        agent: '',
        api_key: ''
      };

      const mockAppBot = { id: '6', ...appBotData };
      const mockResponse = new MockAppBot(mockAppBot);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appBots.create(appBotData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in app bot data', async () => {
      const appBotData = {
        app: 'app-with-special-chars_123',
        response_url: 'https://example.com/webhook?param=value&other=123',
        agent: 'agent-with-special-chars_123',
        api_key: 'api-key-with-special-chars@#$%^&*()'
      };

      const mockAppBot = { id: '7', ...appBotData };
      const mockResponse = new MockAppBot(mockAppBot);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appBots.create(appBotData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(appBotData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long app bot data', async () => {
      const longAppId = 'a'.repeat(1000);
      const longResponseUrl = 'https://example.com/' + 'b'.repeat(2000);
      const appBotData = {
        app: longAppId,
        response_url: longResponseUrl,
        agent: 'agent-8'
      };

      const mockAppBot = { id: '8', ...appBotData };
      const mockResponse = new MockAppBot(mockAppBot);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await appBots.create(appBotData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        app: 'app@example.com',
        agent: 'agent-with-special-chars_123',
        external_id: 'id-with-special-chars_123'
      };

      const mockAppBots = [
        { id: '1', app: 'Test App', response_url: 'https://test.com/webhook', agent: 'Test Agent' }
      ];

      const mockResponse = mockAppBots.map(bot => new MockAppBot(bot));
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      await appBots.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        app: 'app-123',
        agent: 'agent-456',
        active: true,
        external_id: 'ext-123'
      };

      const mockAppBots = [
        { id: '1', app: 'app-123', response_url: 'https://app123.com/webhook', agent: 'agent-456' }
      ];

      const mockResponse = mockAppBots.map(bot => new MockAppBot(bot));
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      await appBots.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete app bot management flow', async () => {
      // Step 1: Get all app bots
      const mockAppBots = [
        { id: '1', app: 'app-1', response_url: 'https://app1.com/webhook', agent: 'agent-1' },
        { id: '2', app: 'app-2', response_url: 'https://app2.com/webhook', agent: 'agent-2' }
      ];

      const mockGetResponse = mockAppBots.map(bot => new MockAppBot(bot));
      mockBaseAPI.get.mockResolvedValueOnce(mockGetResponse as any);

      const allBots = await appBots.get();
      expect(allBots).toHaveLength(2);

      // Step 2: Get specific app bot
      const mockAppBot = { id: '1', app: 'app-1', response_url: 'https://app1.com/webhook', agent: 'agent-1' };
      const mockGetBotResponse = new MockAppBot(mockAppBot);
      mockBaseAPI.get.mockResolvedValueOnce(mockGetBotResponse as any);

      const specificBot = await appBots.get({}, '1');
      expect(specificBot).toEqual(mockGetBotResponse);

      // Step 3: Create new app bot
      const newBotData = {
        app: 'app-3',
        response_url: 'https://app3.com/webhook',
        agent: 'agent-3'
      };

      const mockNewBot = { id: '3', ...newBotData };
      const mockCreateResponse = new MockAppBot(mockNewBot);
      mockBaseAPI.create.mockResolvedValueOnce(mockCreateResponse);

      const createdBot = await appBots.create(newBotData);
      expect(createdBot).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageBots = [
        { id: '1', app: 'app-1', response_url: 'https://app1.com/webhook', agent: 'agent-1' },
        { id: '2', app: 'app-2', response_url: 'https://app2.com/webhook', agent: 'agent-2' }
      ];

      const mockFirstPage = firstPageBots.map(bot => new MockAppBot(bot));
      mockBaseAPI.get.mockResolvedValueOnce(mockFirstPage as any);

      const firstPage = await appBots.get({ limit: 2, offset: 0 });
      expect(firstPage).toHaveLength(2);

      // Second page
      const secondPageBots = [
        { id: '3', app: 'app-3', response_url: 'https://app3.com/webhook', agent: 'agent-3' },
        { id: '4', app: 'app-4', response_url: 'https://app4.com/webhook', agent: 'agent-4' }
      ];

      const mockSecondPage = secondPageBots.map(bot => new MockAppBot(bot));
      mockBaseAPI.get.mockResolvedValueOnce(mockSecondPage as any);

      const secondPage = await appBots.get({ limit: 2, offset: 2 });
      expect(secondPage).toHaveLength(2);
    });

    it('should handle search and filtering scenarios', async () => {
      // Filter by app
      const appBotsData = [
        { id: '1', app: 'app-1', response_url: 'https://app1.com/webhook', agent: 'agent-1' }
      ];

      const mockAppBots = appBotsData.map(bot => new MockAppBot(bot));
      mockBaseAPI.get.mockResolvedValueOnce(mockAppBots as any);

      const appResults = await appBots.get({ app: 'app-1' });
      expect(appResults).toHaveLength(1);

      // Filter by agent
      const agentBotsData = [
        { id: '1', app: 'app-1', response_url: 'https://app1.com/webhook', agent: 'agent-1' }
      ];

      const mockAgentBots = agentBotsData.map(bot => new MockAppBot(bot));
      mockBaseAPI.get.mockResolvedValueOnce(mockAgentBots as any);

      const agentResults = await appBots.get({ agent: 'agent-1' });
      expect(agentResults).toHaveLength(1);

      // Filter by active status
      const activeBotsData = [
        { id: '1', app: 'app-1', response_url: 'https://app1.com/webhook', agent: 'agent-1' }
      ];

      const mockActiveBots = activeBotsData.map(bot => new MockAppBot(bot));
      mockBaseAPI.get.mockResolvedValueOnce(mockActiveBots as any);

      const activeResults = await appBots.get({ active: true });
      expect(activeResults).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle API validation errors', async () => {
      const appBotData = {
        app: 'invalid-app',
        response_url: 'invalid-url',
        agent: 'invalid-agent'
      };

      const validationError = new Error('Invalid response URL format');
      mockBaseAPI.create.mockRejectedValue(validationError);

      await expect(appBots.create(appBotData)).rejects.toThrow('Invalid response URL format');
    });

    it('should handle duplicate app bot creation', async () => {
      const appBotData = {
        app: 'app-1',
        response_url: 'https://app1.com/webhook',
        agent: 'agent-1'
      };

      const duplicateError = new Error('App bot with this configuration already exists');
      mockBaseAPI.create.mockRejectedValue(duplicateError);

      await expect(appBots.create(appBotData)).rejects.toThrow('App bot with this configuration already exists');
    });

    it('should handle app bot not found', async () => {
      const notFoundError = new Error('App bot not found');
      mockBaseAPI.get.mockRejectedValue(notFoundError);

      await expect(appBots.get({}, 'nonexistent-id')).rejects.toThrow('App bot not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockBaseAPI.get.mockRejectedValue(serverError);

      await expect(appBots.get()).rejects.toThrow('Internal server error');
    });

    it('should handle app validation errors', async () => {
      const appBotData = {
        app: 'nonexistent-app',
        response_url: 'https://app.com/webhook',
        agent: 'agent-1'
      };

      const appError = new Error('App not found');
      mockBaseAPI.create.mockRejectedValue(appError);

      await expect(appBots.create(appBotData)).rejects.toThrow('App not found');
    });

    it('should handle agent validation errors', async () => {
      const appBotData = {
        app: 'app-1',
        response_url: 'https://app.com/webhook',
        agent: 'nonexistent-agent'
      };

      const agentError = new Error('Agent not found');
      mockBaseAPI.create.mockRejectedValue(agentError);

      await expect(appBots.create(appBotData)).rejects.toThrow('Agent not found');
    });
  });
}); 