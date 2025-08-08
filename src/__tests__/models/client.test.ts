import { Client } from '../../models';
import { ClientInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/client';
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
    this.getUri = jest.fn().mockReturnValue('/client/123');
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

describe('Client Model', () => {
  let client: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

          const clientData: Partial<ClientInterface> = {
        id: '123',
        name: 'Test Client',
        client_id: 'test-client-id',
        active: true
      };

    client = new Client(clientData);
    mockApiClient = client.apiClient;
  });

  describe('constructor', () => {
    it('should create Client instance with default URI', () => {
      const clientData: Partial<ClientInterface> = {
        id: '123',
        name: 'Test Client',
        client_id: 'test-client-id'
      };

      const client = new Client(clientData);
      expect(client).toBeDefined();
      expect((client as any).uri).toBe('/client');
    });

    it('should create Client instance with custom URI', () => {
      const clientData: Partial<ClientInterface> = {
        id: '123',
        name: 'Test Client',
        client_id: 'test-client-id'
      };

      const client = new Client(clientData, '/custom/client');
      expect(client).toBeDefined();
      expect((client as any).uri).toBe('/custom/client');
    });

    it('should set client properties from data', () => {
      const clientData: Partial<ClientInterface> = {
        id: '123',
        name: 'Test Client',
        client_id: 'test-client-id'
      };

      const client = new Client(clientData);
      expect((client as any).name).toBe('Test Client');
      expect((client as any).client_id).toBe('test-client-id');
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(client.save).toBeDefined();
      expect(typeof client.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(client.delete).toBeDefined();
      expect(typeof client.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(client.update).toBeDefined();
      expect(typeof client.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(client.isActive).toBeDefined();
      expect(typeof client.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(client.toJSON).toBeDefined();
      expect(typeof client.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(client.toAPIPayload).toBeDefined();
      expect(typeof client.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access client data properties', () => {
      expect((client as any).name).toBe('Test Client');
      expect((client as any).client_id).toBe('test-client-id');
      expect((client as any).active).toBe(true);
    });

    it('should return client data via toJSON', () => {
      const jsonData = client.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        name: 'Test Client',
        client_id: 'test-client-id',
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = client.toAPIPayload();
      expect(apiPayload).toEqual({
        name: 'Test Client',
        client_id: 'test-client-id',
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('client-specific functionality', () => {
    it('should handle client updates', () => {
      const updates = {
        name: 'Updated Client',
        client_id: 'updated-client-id'
      };

      client.update(updates);

      expect((client as any).name).toBe('Updated Client');
      expect((client as any).client_id).toBe('updated-client-id');
    });

    it('should check if client is active', () => {
      expect(client.isActive()).toBe(true);

      const inactiveClient = new Client({
        id: '456',
        name: 'Inactive Client',
        client_id: 'inactive-client-id',
        active: false
      });

      expect(inactiveClient.isActive()).toBe(false);
    });
  });
});
