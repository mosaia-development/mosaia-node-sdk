import { AgentGroup } from '../../models';
import { AgentGroupInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/group';
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
    this.getUri = jest.fn().mockReturnValue('/group/123');
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
  }))
}));

// Mock the Image class
jest.mock('../../functions/image', () => ({
  Image: jest.fn().mockImplementation(() => ({
    upload: jest.fn()
  }))
}));

describe('AgentGroup Model', () => {
  let agentGroup: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const agentGroupData: Partial<AgentGroupInterface> = {
      id: '123',
      name: 'Test Agent Group',
      short_description: 'A test agent group',
      active: true
    };

    agentGroup = new AgentGroup(agentGroupData);
    mockApiClient = agentGroup.apiClient;
  });

  describe('constructor', () => {
    it('should create AgentGroup instance with default URI', () => {
      const agentGroupData: Partial<AgentGroupInterface> = {
        id: '123',
        name: 'Test Agent Group',
        short_description: 'A test agent group'
      };

      const agentGroup = new AgentGroup(agentGroupData);
      expect(agentGroup).toBeDefined();
      expect((agentGroup as any).uri).toBe('/group');
    });

    it('should create AgentGroup instance with custom URI', () => {
      const agentGroupData: Partial<AgentGroupInterface> = {
        id: '123',
        name: 'Test Agent Group',
        short_description: 'A test agent group'
      };

      const agentGroup = new AgentGroup(agentGroupData, '/custom/group');
      expect(agentGroup).toBeDefined();
      expect((agentGroup as any).uri).toBe('/custom/group');
    });

    it('should set agent group properties from data', () => {
      const agentGroupData: Partial<AgentGroupInterface> = {
        id: '123',
        name: 'Test Agent Group',
        short_description: 'A test agent group',
        active: true
      };

      const agentGroup = new AgentGroup(agentGroupData);
      expect((agentGroup as any).name).toBe('Test Agent Group');
      expect((agentGroup as any).short_description).toBe('A test agent group');
      expect((agentGroup as any).active).toBe(true);
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(agentGroup.save).toBeDefined();
      expect(typeof agentGroup.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(agentGroup.delete).toBeDefined();
      expect(typeof agentGroup.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(agentGroup.update).toBeDefined();
      expect(typeof agentGroup.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(agentGroup.isActive).toBeDefined();
      expect(typeof agentGroup.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(agentGroup.toJSON).toBeDefined();
      expect(typeof agentGroup.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(agentGroup.toAPIPayload).toBeDefined();
      expect(typeof agentGroup.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access agent group data properties', () => {
      expect((agentGroup as any).name).toBe('Test Agent Group');
      expect((agentGroup as any).short_description).toBe('A test agent group');
      expect((agentGroup as any).active).toBe(true);
    });

    it('should return agent group data via toJSON', () => {
      const jsonData = agentGroup.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        name: 'Test Agent Group',
        short_description: 'A test agent group',
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = agentGroup.toAPIPayload();
      expect(apiPayload).toEqual({
        name: 'Test Agent Group',
        short_description: 'A test agent group',
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('agent group-specific functionality', () => {
    it('should handle agent group updates', () => {
      const updates = {
        name: 'Updated Agent Group',
        short_description: 'An updated agent group'
      };

      agentGroup.update(updates);

      expect((agentGroup as any).name).toBe('Updated Agent Group');
      expect((agentGroup as any).short_description).toBe('An updated agent group');
    });

    it('should check if agent group is active', () => {
      expect(agentGroup.isActive()).toBe(true);

      const inactiveAgentGroup = new AgentGroup({
        id: '456',
        name: 'Inactive Agent Group',
        short_description: 'An inactive agent group',
        active: false
      });

      expect(inactiveAgentGroup.isActive()).toBe(false);
    });

    describe('image getter', () => {
      it('should return Image instance', () => {
        const { Image } = require('../../functions/image');
        
        const image = agentGroup.image;

        expect(Image).toHaveBeenCalled();
        expect(image).toBeDefined();
      });

      it('should create Image with correct URI', () => {
        const { Image } = require('../../functions/image');
        
        agentGroup.image;

        expect(Image).toHaveBeenCalledWith('/group/123', expect.anything());
      });

      it('should pass image URL from data if available', () => {
        const groupData: Partial<AgentGroupInterface> = {
          id: '123',
          name: 'Test Group',
          image: 'https://example.com/image.png'
        };
        const groupWithImage = new AgentGroup(groupData);
        // Clear previous calls
        const { Image } = require('../../functions/image');
        (Image as jest.Mock).mockClear();
        
        groupWithImage.image;

        expect(Image).toHaveBeenCalledWith('/group/123', 'https://example.com/image.png');
      });

      it('should pass empty string if image URL not available', () => {
        const { Image } = require('../../functions/image');
        
        agentGroup.image;

        expect(Image).toHaveBeenCalledWith('/group/123', '');
      });
    });
  });
});
