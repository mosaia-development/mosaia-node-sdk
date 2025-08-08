import { Organization } from '../../models';
import { OrganizationInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/org';
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
    this.getUri = jest.fn().mockReturnValue('/org/123');
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
  Users: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  })),
  Models: jest.fn().mockImplementation((uri: string) => ({
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

describe('Organization Model', () => {
  let organization: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const orgData: Partial<OrganizationInterface> = {
      id: '123',
      name: 'Test Organization',
      short_description: 'A test organization',
      active: true
    };

    organization = new Organization(orgData);
    mockApiClient = organization.apiClient;
  });

  describe('constructor', () => {
    it('should create Organization instance with default URI', () => {
      const orgData: Partial<OrganizationInterface> = {
        id: '123',
        name: 'Test Organization',
        short_description: 'A test organization'
      };

      const organization = new Organization(orgData);
      expect(organization).toBeDefined();
      expect((organization as any).uri).toBe('/org');
    });

    it('should create Organization instance with custom URI', () => {
      const orgData: Partial<OrganizationInterface> = {
        id: '123',
        name: 'Test Organization',
        short_description: 'A test organization'
      };

      const organization = new Organization(orgData, '/custom/org');
      expect(organization).toBeDefined();
      expect((organization as any).uri).toBe('/custom/org');
    });

    it('should set organization properties from data', () => {
      const orgData: Partial<OrganizationInterface> = {
        id: '123',
        name: 'Test Organization',
        short_description: 'A test organization'
      };

      const organization = new Organization(orgData);
      expect((organization as any).name).toBe('Test Organization');
      expect((organization as any).short_description).toBe('A test organization');
    });
  });

  describe('agents getter', () => {
    it('should return Agents instance with correct URI', () => {
      const { Agents } = require('../../collections');
      
      const agents = organization.agents;

      expect(Agents).toHaveBeenCalledWith('/org/123');
      expect(agents).toBeDefined();
      expect(agents.uri).toBe('/org/123');
    });
  });

  describe('apps getter', () => {
    it('should return Apps instance with correct URI', () => {
      const { Apps } = require('../../collections');
      
      const apps = organization.apps;

      expect(Apps).toHaveBeenCalledWith('/org/123');
      expect(apps).toBeDefined();
      expect(apps.uri).toBe('/org/123');
    });
  });



  describe('models getter', () => {
    it('should return Models instance with correct URI', () => {
      const { Models } = require('../../collections');
      
      const models = organization.models;

      expect(Models).toHaveBeenCalledWith('/org/123');
      expect(models).toBeDefined();
      expect(models.uri).toBe('/org/123');
    });
  });

  describe('tools getter', () => {
    it('should return Tools instance with correct URI', () => {
      const { Tools } = require('../../collections');
      
      const tools = organization.tools;

      expect(Tools).toHaveBeenCalledWith('/org/123');
      expect(tools).toBeDefined();
      expect(tools.uri).toBe('/org/123');
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(organization.save).toBeDefined();
      expect(typeof organization.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(organization.delete).toBeDefined();
      expect(typeof organization.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(organization.update).toBeDefined();
      expect(typeof organization.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(organization.isActive).toBeDefined();
      expect(typeof organization.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(organization.toJSON).toBeDefined();
      expect(typeof organization.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(organization.toAPIPayload).toBeDefined();
      expect(typeof organization.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access organization data properties', () => {
      expect((organization as any).name).toBe('Test Organization');
      expect((organization as any).short_description).toBe('A test organization');
      expect((organization as any).active).toBe(true);
    });

    it('should return organization data via toJSON', () => {
      const jsonData = organization.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        name: 'Test Organization',
        short_description: 'A test organization',
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = organization.toAPIPayload();
      expect(apiPayload).toEqual({
        name: 'Test Organization',
        short_description: 'A test organization',
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('organization-specific functionality', () => {
    it('should handle organization updates', () => {
      const updates = {
        name: 'Updated Organization',
        short_description: 'An updated organization'
      };

      organization.update(updates);

      expect((organization as any).name).toBe('Updated Organization');
      expect((organization as any).short_description).toBe('An updated organization');
    });

    it('should check if organization is active', () => {
      expect(organization.isActive()).toBe(true);

      const inactiveOrg = new Organization({
        id: '456',
        name: 'Inactive Organization',
        short_description: 'An inactive organization',
        active: false
      });

      expect(inactiveOrg.isActive()).toBe(false);
    });
  });
});
