import { AppBot } from '../../models';
import { AppBotInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/bot';
    this.apiClient = {
      POST: jest.fn(),
      PUT: jest.fn(),
      DELETE: jest.fn()
    };
    this.config = {
      apiKey: 'test-api-key',
      apiURL: 'https://api.mosaia.ai',
      version: '1'
    };
    this.update = jest.fn().mockImplementation((updates: any) => {
      this.data = { ...this.data, ...updates };
      Object.assign(this, updates);
    });
    this.getUri = jest.fn().mockReturnValue('/app-bot/123');
    this.save = jest.fn();
    this.delete = jest.fn();
    this.isActive = jest.fn().mockReturnValue(data.active === true);
    this.toJSON = jest.fn().mockReturnValue(data);
    this.toAPIPayload = jest.fn().mockImplementation(() => {
      const payload = { ...this.data };
      delete payload.id;
      return payload;
    });
    
    // Set properties from data
    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
  })
}));

describe('AppBot Model', () => {
  let appBot: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

          const appBotData: Partial<AppBotInterface> = {
        id: '123',
        app: 'app-123',
        response_url: 'https://example.com/webhook',
        active: true
      };

    appBot = new AppBot(appBotData);
    mockApiClient = appBot.apiClient;
  });

  describe('constructor', () => {
    it('should create AppBot instance with default URI', () => {
      const appBotData: Partial<AppBotInterface> = {
        id: '123',
        app: 'app-123',
        response_url: 'https://example.com/webhook'
      };

      const appBot = new AppBot(appBotData);
      expect(appBot).toBeDefined();
      expect((appBot as any).uri).toBe('/bot');
    });

    it('should create AppBot instance with custom URI', () => {
      const appBotData: Partial<AppBotInterface> = {
        id: '123',
        app: 'app-123',
        response_url: 'https://example.com/webhook'
      };

      const appBot = new AppBot(appBotData, '/custom/app-bot');
      expect(appBot).toBeDefined();
      expect((appBot as any).uri).toBe('/custom/app-bot');
    });

    it('should set app bot properties from data', () => {
      const appBotData: Partial<AppBotInterface> = {
        id: '123',
        app: 'app-123',
        response_url: 'https://example.com/webhook'
      };

      const appBot = new AppBot(appBotData);
      expect((appBot as any).app).toBe('app-123');
      expect((appBot as any).response_url).toBe('https://example.com/webhook');
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(appBot.save).toBeDefined();
      expect(typeof appBot.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(appBot.delete).toBeDefined();
      expect(typeof appBot.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(appBot.update).toBeDefined();
      expect(typeof appBot.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(appBot.isActive).toBeDefined();
      expect(typeof appBot.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(appBot.toJSON).toBeDefined();
      expect(typeof appBot.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(appBot.toAPIPayload).toBeDefined();
      expect(typeof appBot.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access app bot data properties', () => {
      expect((appBot as any).app).toBe('app-123');
      expect((appBot as any).response_url).toBe('https://example.com/webhook');
      expect((appBot as any).active).toBe(true);
    });

    it('should return app bot data via toJSON', () => {
      const jsonData = appBot.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        app: 'app-123',
        response_url: 'https://example.com/webhook',
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = appBot.toAPIPayload();
      expect(apiPayload).toEqual({
        app: 'app-123',
        response_url: 'https://example.com/webhook',
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('app bot-specific functionality', () => {
    it('should handle app bot updates', () => {
      const updates = {
        app: 'updated-app-456',
        response_url: 'https://updated.example.com/webhook'
      };

      appBot.update(updates);

      expect((appBot as any).app).toBe('updated-app-456');
      expect((appBot as any).response_url).toBe('https://updated.example.com/webhook');
    });

    it('should check if app bot is active', () => {
      expect(appBot.isActive()).toBe(true);

      const inactiveAppBot = new AppBot({
        id: '456',
        app: 'inactive-app-456',
        response_url: 'https://inactive.example.com/webhook',
        active: false
      });

      expect(inactiveAppBot.isActive()).toBe(false);
    });
  });
});
