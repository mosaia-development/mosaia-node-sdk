import { AppWebhook } from '../../models';
import { AppWebhookInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/hook';
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
    this.getUri = jest.fn().mockReturnValue('/app/hook/123');
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

describe('AppWebhook Model', () => {
  let appWebhook: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const appWebhookData: Partial<AppWebhookInterface> = {
      id: '123',
      app: 'app-123',
      url: 'https://example.com/webhook',
      events: ['REQUEST'],
      active: true
    };

    appWebhook = new AppWebhook(appWebhookData);
    mockApiClient = appWebhook.apiClient;
  });

  describe('constructor', () => {
    it('should create AppWebhook instance with default URI', () => {
      const appWebhookData: Partial<AppWebhookInterface> = {
        id: '123',
        app: 'app-123',
        url: 'https://example.com/webhook',
        events: ['REQUEST']
      };

      const appWebhook = new AppWebhook(appWebhookData);
      expect(appWebhook).toBeDefined();
      expect((appWebhook as any).uri).toBe('/hook');
    });

    it('should create AppWebhook instance with custom URI', () => {
      const appWebhookData: Partial<AppWebhookInterface> = {
        id: '123',
        app: 'app-123',
        url: 'https://example.com/webhook',
        events: ['REQUEST']
      };

      const appWebhook = new AppWebhook(appWebhookData, '/custom/hook');
      expect(appWebhook).toBeDefined();
      expect((appWebhook as any).uri).toBe('/custom/hook');
    });

    it('should set app webhook properties from data', () => {
      const appWebhookData: Partial<AppWebhookInterface> = {
        id: '123',
        app: 'app-123',
        url: 'https://example.com/webhook',
        events: ['REQUEST']
      };

      const appWebhook = new AppWebhook(appWebhookData);
      expect((appWebhook as any).app).toBe('app-123');
      expect((appWebhook as any).url).toBe('https://example.com/webhook');
      expect((appWebhook as any).events).toEqual(['REQUEST']);
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(appWebhook.save).toBeDefined();
      expect(typeof appWebhook.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(appWebhook.delete).toBeDefined();
      expect(typeof appWebhook.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(appWebhook.update).toBeDefined();
      expect(typeof appWebhook.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(appWebhook.isActive).toBeDefined();
      expect(typeof appWebhook.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(appWebhook.toJSON).toBeDefined();
      expect(typeof appWebhook.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(appWebhook.toAPIPayload).toBeDefined();
      expect(typeof appWebhook.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access app webhook data properties', () => {
      expect((appWebhook as any).app).toBe('app-123');
      expect((appWebhook as any).url).toBe('https://example.com/webhook');
      expect((appWebhook as any).events).toEqual(['REQUEST']);
      expect((appWebhook as any).active).toBe(true);
    });

    it('should return app webhook data via toJSON', () => {
      const jsonData = appWebhook.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        app: 'app-123',
        url: 'https://example.com/webhook',
        events: ['REQUEST'],
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = appWebhook.toAPIPayload();
      expect(apiPayload).toEqual({
        app: 'app-123',
        url: 'https://example.com/webhook',
        events: ['REQUEST'],
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('app webhook-specific functionality', () => {
    it('should handle app webhook updates', () => {
      const updates = {
        app: 'updated-app-456',
        url: 'https://updated.example.com/webhook',
        events: ['REQUEST', 'RESPONSE']
      };

      appWebhook.update(updates);

      expect((appWebhook as any).app).toBe('updated-app-456');
      expect((appWebhook as any).url).toBe('https://updated.example.com/webhook');
      expect((appWebhook as any).events).toEqual(['REQUEST', 'RESPONSE']);
    });

    it('should check if app webhook is active', () => {
      expect(appWebhook.isActive()).toBe(true);

      const inactiveWebhook = new AppWebhook({
        id: '456',
        app: 'inactive-app-456',
        url: 'https://inactive.example.com/webhook',
        events: ['REQUEST'],
        active: false
      });

      expect(inactiveWebhook.isActive()).toBe(false);
    });

    it('should handle webhook with secret', () => {
      const webhookWithSecret = new AppWebhook({
        id: '789',
        app: 'app-789',
        url: 'https://secure.example.com/webhook',
        events: ['REQUEST'],
        secret: 'webhook-secret-key'
      });

      expect((webhookWithSecret as any).secret).toBe('webhook-secret-key');
    });

    it('should handle webhook with external_id', () => {
      const webhookWithExternalId = new AppWebhook({
        id: '101',
        app: 'app-101',
        url: 'https://external.example.com/webhook',
        events: ['REQUEST'],
        external_id: 'ext-webhook-123'
      });

      expect((webhookWithExternalId as any).external_id).toBe('ext-webhook-123');
    });

    it('should handle webhook with extensors', () => {
      const webhookWithExtensors = new AppWebhook({
        id: '202',
        app: 'app-202',
        url: 'https://extensors.example.com/webhook',
        events: ['REQUEST'],
        extensors: {
          environment: 'production',
          team: 'engineering'
        }
      });

      expect((webhookWithExtensors as any).extensors).toEqual({
        environment: 'production',
        team: 'engineering'
      });
    });

    it('should handle multiple event types', () => {
      const multiEventWebhook = new AppWebhook({
        id: '303',
        app: 'app-303',
        url: 'https://multievent.example.com/webhook',
        events: ['REQUEST', 'RESPONSE', 'ERROR']
      });

      expect((multiEventWebhook as any).events).toEqual(['REQUEST', 'RESPONSE', 'ERROR']);
    });
  });
});

