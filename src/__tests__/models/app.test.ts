import { App } from '../../models';
import { AppInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/app';
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
    this.getUri = jest.fn().mockReturnValue('/app/123');
    this.save = jest.fn();
    this.delete = jest.fn();
    this.isActive = jest.fn().mockReturnValue(data.active === true);
    this.toJSON = jest.fn().mockReturnValue(data);
    this.toAPIPayload = jest.fn().mockImplementation(() => {
      const payload = { ...this.data };
      delete payload.id;
      return payload;
    });
    
    // Set properties from data (skip getters)
    Object.keys(data).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);
      if (!descriptor || (descriptor.get === undefined && descriptor.set === undefined)) {
        this[key] = data[key];
      }
    });
  })
}));

// Mock the collections
jest.mock('../../collections', () => ({
  Agents: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  })),
  Tools: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  })),
  AppConnectors: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  })),
  AppWebhooks: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  }))
}));

// Mock the Image class
jest.mock('../../functions/image', () => ({
  Image: jest.fn().mockImplementation(() => ({
    upload: jest.fn()
  }))
}));

describe('App Model', () => {
  let app: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const appData: Partial<AppInterface> = {
      id: '123',
      name: 'Test App',
      short_description: 'A test application',
      active: true
    };

    app = new App(appData);
    mockApiClient = app.apiClient;
  });

  describe('constructor', () => {
    it('should create App instance with default URI', () => {
      const appData: Partial<AppInterface> = {
        id: '123',
        name: 'Test App',
        short_description: 'A test application'
      };

      const app = new App(appData);
      expect(app).toBeDefined();
      expect((app as any).uri).toBe('/app');
    });

    it('should create App instance with custom URI', () => {
      const appData: Partial<AppInterface> = {
        id: '123',
        name: 'Test App',
        short_description: 'A test application'
      };

      const app = new App(appData, '/custom/app');
      expect(app).toBeDefined();
      expect((app as any).uri).toBe('/custom/app');
    });

    it('should set app properties from data', () => {
      const appData: Partial<AppInterface> = {
        id: '123',
        name: 'Test App',
        short_description: 'A test application',
        active: true
      };

      const app = new App(appData);
      expect((app as any).name).toBe('Test App');
      expect((app as any).short_description).toBe('A test application');
      expect((app as any).active).toBe(true);
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(app.save).toBeDefined();
      expect(typeof app.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(app.delete).toBeDefined();
      expect(typeof app.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(app.update).toBeDefined();
      expect(typeof app.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(app.isActive).toBeDefined();
      expect(typeof app.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(app.toJSON).toBeDefined();
      expect(typeof app.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(app.toAPIPayload).toBeDefined();
      expect(typeof app.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access app data properties', () => {
      expect((app as any).name).toBe('Test App');
      expect((app as any).short_description).toBe('A test application');
      expect((app as any).active).toBe(true);
    });

    it('should return app data via toJSON', () => {
      const jsonData = app.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        name: 'Test App',
        short_description: 'A test application',
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = app.toAPIPayload();
      expect(apiPayload).toEqual({
        name: 'Test App',
        short_description: 'A test application',
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('app-specific functionality', () => {
    it('should handle app updates', () => {
      const updates = {
        name: 'Updated App',
        short_description: 'An updated application'
      };

      app.update(updates);

      expect((app as any).name).toBe('Updated App');
      expect((app as any).short_description).toBe('An updated application');
    });

    it('should check if app is active', () => {
      expect(app.isActive()).toBe(true);

      const inactiveApp = new App({
        id: '456',
        name: 'Inactive App',
        short_description: 'An inactive application',
        active: false
      });

      expect(inactiveApp.isActive()).toBe(false);
    });

    describe('image getter', () => {
      it('should return Image instance', () => {
        const { Image } = require('../../functions/image');
        
        const image = app.image;

        expect(Image).toHaveBeenCalled();
        expect(image).toBeDefined();
      });

      it('should create Image with correct URI', () => {
        const { Image } = require('../../functions/image');
        
        app.image;

        expect(Image).toHaveBeenCalledWith('/app/123', expect.anything());
      });

      it('should pass image URL from data if available', () => {
        const appData: Partial<AppInterface> = {
          id: '123',
          name: 'Test App',
          image: 'https://example.com/image.png'
        };
        const appWithImage = new App(appData);
        // Clear previous calls
        const { Image } = require('../../functions/image');
        (Image as jest.Mock).mockClear();
        
        appWithImage.image;

        expect(Image).toHaveBeenCalledWith('/app/123', 'https://example.com/image.png');
      });

      it('should pass empty string if image URL not available', () => {
        const { Image } = require('../../functions/image');
        
        app.image;

        expect(Image).toHaveBeenCalledWith('/app/123', '');
      });
    });

    describe('connectors getter', () => {
      it('should return AppConnectors instance', () => {
        const { AppConnectors } = require('../../collections');
        
        const connectors = app.connectors;

        expect(AppConnectors).toHaveBeenCalled();
        expect(connectors).toBeDefined();
      });

      it('should create AppConnectors with correct URI', () => {
        const { AppConnectors } = require('../../collections');
        
        app.connectors;

        expect(AppConnectors).toHaveBeenCalledWith('/app/123');
      });
    });

    describe('webhooks getter', () => {
      it('should return AppWebhooks instance', () => {
        const { AppWebhooks } = require('../../collections');
        
        const webhooks = app.webhooks;

        expect(AppWebhooks).toHaveBeenCalled();
        expect(webhooks).toBeDefined();
      });

      it('should create AppWebhooks with correct URI', () => {
        const { AppWebhooks } = require('../../collections');
        
        app.webhooks;

        expect(AppWebhooks).toHaveBeenCalledWith('/app/123');
      });
    });
  });
});
