import { Model } from '../../models';
import { ModelInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/model';
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
    this.getUri = jest.fn().mockReturnValue('/model/123');
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

describe('Model Model', () => {
  let model: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const modelData: Partial<ModelInterface> = {
      id: '123',
      name: 'gpt-4',
      provider: 'openai',
      active: true
    };

    model = new Model(modelData);
    mockApiClient = model.apiClient;
  });

  describe('constructor', () => {
    it('should create Model instance with default URI', () => {
      const modelData: Partial<ModelInterface> = {
        id: '123',
        name: 'gpt-4',
        provider: 'openai'
      };

      const model = new Model(modelData);
      expect(model).toBeDefined();
      expect((model as any).uri).toBe('/model');
    });

    it('should create Model instance with custom URI', () => {
      const modelData: Partial<ModelInterface> = {
        id: '123',
        name: 'gpt-4',
        provider: 'openai'
      };

      const model = new Model(modelData, '/custom/model');
      expect(model).toBeDefined();
      expect((model as any).uri).toBe('/custom/model');
    });

    it('should set model properties from data', () => {
      const modelData: Partial<ModelInterface> = {
        id: '123',
        name: 'gpt-4',
        provider: 'openai'
      };

      const model = new Model(modelData);
      expect((model as any).name).toBe('gpt-4');
      expect((model as any).provider).toBe('openai');
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(model.save).toBeDefined();
      expect(typeof model.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(model.delete).toBeDefined();
      expect(typeof model.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(model.update).toBeDefined();
      expect(typeof model.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(model.isActive).toBeDefined();
      expect(typeof model.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(model.toJSON).toBeDefined();
      expect(typeof model.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(model.toAPIPayload).toBeDefined();
      expect(typeof model.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access model data properties', () => {
      expect((model as any).name).toBe('gpt-4');
      expect((model as any).provider).toBe('openai');
      expect((model as any).active).toBe(true);
    });

    it('should return model data via toJSON', () => {
      const jsonData = model.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        name: 'gpt-4',
        provider: 'openai',
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = model.toAPIPayload();
      expect(apiPayload).toEqual({
        name: 'gpt-4',
        provider: 'openai',
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('model-specific functionality', () => {
    it('should handle model updates', () => {
      const updates = {
        name: 'gpt-4-turbo',
        provider: 'openai'
      };

      model.update(updates);

      expect((model as any).name).toBe('gpt-4-turbo');
      expect((model as any).provider).toBe('openai');
    });

    it('should check if model is active', () => {
      expect(model.isActive()).toBe(true);

      const inactiveModel = new Model({
        id: '456',
        name: 'inactive-model',
        provider: 'openai',
        active: false
      });

      expect(inactiveModel.isActive()).toBe(false);
    });

    it('should handle different providers', () => {
      const anthropicModel = new Model({
        id: '789',
        name: 'claude-3',
        provider: 'anthropic'
      });

      expect((anthropicModel as any).provider).toBe('anthropic');
    });
  });
});
