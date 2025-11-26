import { Tool } from '../../models';
import { ToolInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/tool';
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
    this.getUri = jest.fn().mockReturnValue('/tool/123');
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

// Mock the Image class
jest.mock('../../functions/image', () => ({
  Image: jest.fn().mockImplementation(() => ({
    upload: jest.fn()
  }))
}));

describe('Tool Model', () => {
  let tool: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

          const toolData: Partial<ToolInterface> = {
        id: '123',
        name: 'Test Tool',
        short_description: 'A test tool',
        tool_schema: '{"type": "function"}',
        active: true
      };

    tool = new Tool(toolData);
    mockApiClient = tool.apiClient;
  });

  describe('constructor', () => {
    it('should create Tool instance with default URI', () => {
      const toolData: Partial<ToolInterface> = {
        id: '123',
        name: 'Test Tool',
        short_description: 'A test tool',
        tool_schema: '{"type": "function"}'
      };

      const tool = new Tool(toolData);
      expect(tool).toBeDefined();
      expect((tool as any).uri).toBe('/tool');
    });

    it('should create Tool instance with custom URI', () => {
      const toolData: Partial<ToolInterface> = {
        id: '123',
        name: 'Test Tool',
        short_description: 'A test tool',
        tool_schema: '{"type": "function"}'
      };

      const tool = new Tool(toolData, '/custom/tool');
      expect(tool).toBeDefined();
      expect((tool as any).uri).toBe('/custom/tool');
    });

    it('should set tool properties from data', () => {
      const toolData: Partial<ToolInterface> = {
        id: '123',
        name: 'Test Tool',
        short_description: 'A test tool',
        tool_schema: '{"type": "function"}'
      };

      const tool = new Tool(toolData);
      expect((tool as any).name).toBe('Test Tool');
      expect((tool as any).short_description).toBe('A test tool');
      expect((tool as any).tool_schema).toBe('{"type": "function"}');
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(tool.save).toBeDefined();
      expect(typeof tool.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(tool.delete).toBeDefined();
      expect(typeof tool.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(tool.update).toBeDefined();
      expect(typeof tool.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(tool.isActive).toBeDefined();
      expect(typeof tool.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(tool.toJSON).toBeDefined();
      expect(typeof tool.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(tool.toAPIPayload).toBeDefined();
      expect(typeof tool.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access tool data properties', () => {
      expect((tool as any).name).toBe('Test Tool');
      expect((tool as any).short_description).toBe('A test tool');
      expect((tool as any).tool_schema).toBe('{"type": "function"}');
      expect((tool as any).active).toBe(true);
    });

    it('should return tool data via toJSON', () => {
      const jsonData = tool.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        name: 'Test Tool',
        short_description: 'A test tool',
        tool_schema: '{"type": "function"}',
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = tool.toAPIPayload();
      expect(apiPayload).toEqual({
        name: 'Test Tool',
        short_description: 'A test tool',
        tool_schema: '{"type": "function"}',
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('tool-specific functionality', () => {
    it('should handle tool updates', () => {
      const updates = {
        name: 'Updated Tool',
        short_description: 'An updated tool',
        tool_schema: '{"type": "api"}'
      };

      tool.update(updates);

      expect((tool as any).name).toBe('Updated Tool');
      expect((tool as any).short_description).toBe('An updated tool');
      expect((tool as any).tool_schema).toBe('{"type": "api"}');
    });

    it('should check if tool is active', () => {
      expect(tool.isActive()).toBe(true);

      const inactiveTool = new Tool({
        id: '456',
        name: 'Inactive Tool',
        short_description: 'An inactive tool',
        tool_schema: '{"type": "function"}',
        active: false
      });

      expect(inactiveTool.isActive()).toBe(false);
    });

    it('should handle different tool schemas', () => {
      const apiTool = new Tool({
        id: '789',
        name: 'API Tool',
        short_description: 'An API tool',
        tool_schema: '{"type": "api"}'
      });

      expect((apiTool as any).tool_schema).toBe('{"type": "api"}');
    });

    describe('image getter', () => {
      it('should return Image instance', () => {
        const { Image } = require('../../functions/image');
        
        const image = tool.image;

        expect(Image).toHaveBeenCalled();
        expect(image).toBeDefined();
      });

      it('should create Image with correct URI', () => {
        const { Image } = require('../../functions/image');
        
        tool.image;

        expect(Image).toHaveBeenCalledWith('/tool/123', expect.anything());
      });

      it('should pass image URL from data if available', () => {
        const toolData: any = {
          id: '123',
          name: 'Test Tool',
          image: 'https://example.com/image.png'
        };
        const toolWithImage = new Tool(toolData);
        // Clear previous calls
        const { Image } = require('../../functions/image');
        (Image as jest.Mock).mockClear();
        
        toolWithImage.image;

        expect(Image).toHaveBeenCalledWith('/tool/123', 'https://example.com/image.png');
      });

      it('should pass empty string if image URL not available', () => {
        const { Image } = require('../../functions/image');
        
        tool.image;

        expect(Image).toHaveBeenCalledWith('/tool/123', '');
      });
    });
  });
});
