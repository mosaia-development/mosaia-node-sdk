import { User } from '../../models';
import { UserInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/user';
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
    this.getUri = jest.fn().mockReturnValue('/user/123');
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
  Apps: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  })),
  Clients: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  })),
  Models: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  })),
  OrgUsers: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  })),
  AgentGroups: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  })),
  Tools: jest.fn().mockImplementation((uri: string) => ({
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

describe('User Model', () => {
  let user: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const userData: Partial<UserInterface> = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      active: true
    };

    user = new User(userData);
    mockApiClient = user.apiClient;
  });

  describe('constructor', () => {
    it('should create User instance with default URI', () => {
      const userData: Partial<UserInterface> = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      const user = new User(userData);
      expect(user).toBeDefined();
      expect((user as any).uri).toBe('/user');
    });

    it('should create User instance with custom URI', () => {
      const userData: Partial<UserInterface> = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      const user = new User(userData, '/custom/user');
      expect(user).toBeDefined();
      expect((user as any).uri).toBe('/custom/user');
    });

    it('should set user properties from data', () => {
      const userData: Partial<UserInterface> = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe'
      };

      const user = new User(userData);
      expect((user as any).name).toBe('John Doe');
      expect((user as any).email).toBe('john@example.com');
      expect((user as any).username).toBe('johndoe');
    });
  });

  describe('agents getter', () => {
    it('should return Agents instance with correct URI', () => {
      const { Agents } = require('../../collections');
      
      // Clear previous calls
      (Agents as jest.Mock).mockClear();
      
      const agents = user.agents;

      expect(Agents).toHaveBeenCalledWith('/user/123');
      expect(agents).toBeDefined();
      expect(agents.uri).toBe('/user/123');
    });
  });

  describe('apps getter', () => {
    it('should return Apps instance with correct URI', () => {
      const { Apps } = require('../../collections');
      
      const apps = user.apps;

      expect(Apps).toHaveBeenCalledWith('/user/123');
      expect(apps).toBeDefined();
      expect(apps.uri).toBe('/user/123');
    });
  });

  describe('clients getter', () => {
    it('should return Clients instance with correct URI', () => {
      const { Clients } = require('../../collections');
      
      const clients = user.clients;

      expect(Clients).toHaveBeenCalledWith('/user/123');
      expect(clients).toBeDefined();
      expect(clients.uri).toBe('/user/123');
    });
  });

  describe('groups getter', () => {
    it('should return AgentGroups instance with correct URI', () => {
      const { AgentGroups } = require('../../collections');
      
      const groups = user.groups;

      expect(AgentGroups).toHaveBeenCalledWith('/user/123');
      expect(groups).toBeDefined();
      expect(groups.uri).toBe('/user/123');
    });
  });

  describe('models getter', () => {
    it('should return Models instance with correct URI', () => {
      const { Models } = require('../../collections');
      
      const models = user.models;

      expect(Models).toHaveBeenCalledWith('/user/123');
      expect(models).toBeDefined();
      expect(models.uri).toBe('/user/123');
    });
  });

  describe('orgs getter', () => {
    it('should return OrgUsers instance with correct URI', () => {
      const { OrgUsers } = require('../../collections');
      
      const orgs = user.orgs;

      expect(OrgUsers).toHaveBeenCalledWith('/user/123', '/org');
      expect(orgs).toBeDefined();
      expect(orgs.uri).toBe('/user/123');
    });
  });

  describe('tools getter', () => {
    it('should return Tools instance with correct URI', () => {
      const { Tools } = require('../../collections');
      
      const tools = user.tools;

      expect(Tools).toHaveBeenCalledWith('/user/123');
      expect(tools).toBeDefined();
      expect(tools.uri).toBe('/user/123');
    });
  });

  describe('image getter', () => {
    it('should return Image instance', () => {
      const { Image } = require('../../functions/image');
      
      const image = user.image;

      expect(Image).toHaveBeenCalled();
      expect(image).toBeDefined();
    });

    it('should create Image with correct URI for profile', () => {
      const { Image } = require('../../functions/image');
      
      user.image;

      expect(Image).toHaveBeenCalledWith('/user/123/profile', expect.anything());
    });

      it('should pass image URL from data if available', () => {
        const userData: Partial<UserInterface> = {
          id: '123',
          name: 'John Doe',
          image: 'https://example.com/profile.jpg'
        };
        const userWithImage = new User(userData);
        // Clear previous calls
        const { Image } = require('../../functions/image');
        (Image as jest.Mock).mockClear();
        
        userWithImage.image;

        expect(Image).toHaveBeenCalledWith('/user/123/profile', 'https://example.com/profile.jpg');
      });

    it('should pass empty string if image URL not available', () => {
      const { Image } = require('../../functions/image');
      
      user.image;

      expect(Image).toHaveBeenCalledWith('/user/123/profile', '');
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(user.save).toBeDefined();
      expect(typeof user.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(user.delete).toBeDefined();
      expect(typeof user.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(user.update).toBeDefined();
      expect(typeof user.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(user.isActive).toBeDefined();
      expect(typeof user.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(user.toJSON).toBeDefined();
      expect(typeof user.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(user.toAPIPayload).toBeDefined();
      expect(typeof user.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access user data properties', () => {
      expect((user as any).name).toBe('John Doe');
      expect((user as any).email).toBe('john@example.com');
      expect((user as any).username).toBe('johndoe');
      expect((user as any).active).toBe(true);
    });

    it('should return user data via toJSON', () => {
      const jsonData = user.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = user.toAPIPayload();
      expect(apiPayload).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });
});
