import Clients from '../../collections/clients';
import { Client } from '../../models';
import { GetClientsPayload, GetClientPayload, ClientInterface } from '../../types';

// Mock the Client model
jest.mock('../../models');
const MockClient = Client as jest.MockedClass<typeof Client>;

// Mock the BaseAPI class properly
jest.mock('../../collections/base-collection');
const { BaseCollection } = require('../../collections/base-collection');
const MockBaseCollection = BaseCollection as jest.MockedClass<typeof BaseCollection>;

// Mock the ConfigurationManager
jest.mock('../../config', () => ({
  ConfigurationManager: {
    getInstance: jest.fn().mockReturnValue({
      getConfig: jest.fn().mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
      })
    })
  }
}));

// Mock the APIClient
jest.mock('../../utils/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
  }));
});

describe('Clients', () => {
  let clients: any;
  let mockGet: jest.MockedFunction<any>;
  let mockCreate: jest.MockedFunction<any>;
  let mockBaseAPI: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock returns
    MockClient.mockImplementation((data: any) => ({ data } as any));

    // Setup BaseAPI mock
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    };
    MockBaseCollection.mockImplementation(() => mockBaseAPI);

    clients = new Clients();
    
    // Get the mocked methods from the instance
    mockGet = clients.get;
    mockCreate = clients.create;
  });

  describe('constructor', () => {
    it('should create Clients instance extending BaseCollection', () => {
      expect(clients).toBeDefined();
      expect(typeof clients.get).toBe('function');
      expect(typeof clients.create).toBe('function');
    });

    it('should initialize with correct URI and Client model', () => {
      expect(MockBaseCollection).toHaveBeenCalledWith('/client', Client);
    });

    it('should initialize with custom URI when provided', () => {
      const customClients = new Clients('/api/v1');
      expect(MockBaseCollection).toHaveBeenCalledWith('/api/v1/client', Client);
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultClients = new Clients();
      expect(MockBaseCollection).toHaveBeenCalledWith('/client', Client);
    });
  });

  describe('get method', () => {
    it('should get all clients successfully', async () => {
      const mockClients = [
        { id: '1', name: 'Client A', client_id: 'client-a' },
        { id: '2', name: 'Client B', client_id: 'client-b' }
      ];

      const mockResponse = {
        data: mockClients.map(client => new MockClient(client))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await clients.get();

      expect(mockGet).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific client by ID', async () => {
      const mockClient = { id: '1', name: 'Client A', client_id: 'client-a' };
      const mockResponse = new MockClient(mockClient);
      mockGet.mockResolvedValue(mockResponse);

      const result = await clients.get({}, '1');

      expect(mockGet).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get clients with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        q: 'client',
        active: true
      };

      const mockClients = [
        { id: '1', name: 'Client A', client_id: 'client-a' }
      ];

      const mockResponse = {
        data: mockClients.map(client => new MockClient(client))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await clients.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty clients list', async () => {
      const mockResponse = { data: [] };
      mockGet.mockResolvedValue(mockResponse);

      const result = await clients.get();

      expect(result).toEqual({ data: [] });
    });

    it('should handle null response', async () => {
      mockGet.mockResolvedValue(null);

      const result = await clients.get();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch clients');
      mockBaseAPI.get.mockRejectedValue(error);

      await expect(clients.get()).rejects.toThrow('Failed to fetch clients');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockBaseAPI.get.mockRejectedValue(networkError);

      await expect(clients.get()).rejects.toThrow('Network error');
    });
  });

  describe('create method', () => {
    it('should create a new client successfully', async () => {
      const clientData = {
        name: 'New App',
        client_id: 'new-app-client-id',
        client_secret: 'new-app-client-secret',
        redirect_uris: ['https://newapp.com/callback'],
        scopes: ['read', 'write']
      };

      const mockClient = { id: '3', ...clientData };
      const mockResponse = new MockClient(mockClient);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await clients.create(clientData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(clientData);
      expect(result).toEqual(mockResponse);
    });

    it('should create client with minimal data', async () => {
      const clientData = {
        name: 'Minimal App',
        client_id: 'minimal-app-client-id'
      };

      const mockClient = { id: '4', ...clientData };
      const mockResponse = new MockClient(mockClient);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await clients.create(clientData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(clientData);
      expect(result).toEqual(mockResponse);
    });

    it('should create client with all optional fields', async () => {
      const clientData = {
        name: 'Full App',
        client_id: 'full-app-client-id',
        client_secret: 'full-app-client-secret',
        redirect_uris: [
          'https://fullapp.com/callback',
          'https://fullapp.com/auth'
        ],
        scopes: ['read', 'write', 'admin'],
        active: true,
        external_id: 'ext-client-123'
      };

      const mockClient = { id: '5', ...clientData };
      const mockResponse = new MockClient(mockClient);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await clients.create(clientData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(clientData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const clientData = {
        name: 'Invalid App',
        client_id: 'invalid-app-client-id'
      };

      const error = new Error('Validation failed');
      mockBaseAPI.create.mockRejectedValue(error);

      await expect(clients.create(clientData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const clientData = {
        name: 'Network App',
        client_id: 'network-app-client-id'
      };

      const networkError = new Error('Network error');
      mockBaseAPI.create.mockRejectedValue(networkError);

      await expect(clients.create(clientData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty client data in create', async () => {
      const clientData = {
        name: '',
        client_id: '',
        client_secret: '',
        redirect_uris: [],
        scopes: []
      };

      const mockClient = { id: '6', ...clientData };
      const mockResponse = new MockClient(mockClient);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await clients.create(clientData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in client data', async () => {
      const clientData = {
        name: 'App with Special Chars: @#$%^&*()',
        client_id: 'app-with-special-chars_123',
        redirect_uris: ['https://example.com/callback?param=value&other=123']
      };

      const mockClient = { id: '7', ...clientData };
      const mockResponse = new MockClient(mockClient);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await clients.create(clientData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(clientData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long client data', async () => {
      const longName = 'a'.repeat(1000);
      const longClientId = 'b'.repeat(500);
      const clientData = {
        name: longName,
        client_id: longClientId,
        redirect_uris: ['https://example.com/callback']
      };

      const mockClient = { id: '8', ...clientData };
      const mockResponse = new MockClient(mockClient);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await clients.create(clientData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        q: 'client@example.com',
        external_id: 'id-with-special-chars_123'
      };

      const mockClients = [
        { id: '1', name: 'Test Client', client_id: 'test-client-id' }
      ];

      const mockResponse = mockClients.map(client => new MockClient(client));
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      await clients.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        q: 'web application client',
        active: true,
        external_id: 'ext-123'
      };

      const mockClients = [
        { id: '1', name: 'Web App', client_id: 'web-app-client' }
      ];

      const mockResponse = mockClients.map(client => new MockClient(client));
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      await clients.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete client management flow', async () => {
      // Step 1: Get all clients
      const mockClients = [
        { id: '1', name: 'Web App', client_id: 'web-app-client' },
        { id: '2', name: 'Mobile App', client_id: 'mobile-app-client' }
      ];

      const mockGetResponse = {
        data: mockClients.map(client => new MockClient(client))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockGetResponse);

      const allClients = await clients.get();
      expect(allClients.data).toHaveLength(2);

      // Step 2: Get specific client
      const mockClient = { id: '1', name: 'Web App', client_id: 'web-app-client' };
      const mockGetClientResponse = new MockClient(mockClient);
      mockBaseAPI.get.mockResolvedValueOnce(mockGetClientResponse);

      const specificClient = await clients.get({}, '1');
      expect(specificClient).toEqual(mockGetClientResponse);

      // Step 3: Create new client
      const newClientData = {
        name: 'New App',
        client_id: 'new-app-client-id',
        redirect_uris: ['https://newapp.com/callback']
      };

      const mockNewClient = { id: '3', ...newClientData };
      const mockCreateResponse = new MockClient(mockNewClient);
      mockBaseAPI.create.mockResolvedValueOnce(mockCreateResponse);

      const createdClient = await clients.create(newClientData);
      expect(createdClient).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageClients = [
        { id: '1', name: 'Client 1', client_id: 'client-1-id' },
        { id: '2', name: 'Client 2', client_id: 'client-2-id' }
      ];

      const mockFirstPage = {
        data: firstPageClients.map(client => new MockClient(client))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockFirstPage);

      const firstPage = await clients.get({ limit: 2, offset: 0 });
      expect(firstPage.data).toHaveLength(2);

      // Second page
      const secondPageClients = [
        { id: '3', name: 'Client 3', client_id: 'client-3-id' },
        { id: '4', name: 'Client 4', client_id: 'client-4-id' }
      ];

      const mockSecondPage = {
        data: secondPageClients.map(client => new MockClient(client))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockSecondPage);

      const secondPage = await clients.get({ limit: 2, offset: 2 });
      expect(secondPage.data).toHaveLength(2);
    });

    it('should handle search and filtering scenarios', async () => {
      // Search by name
      const searchResults = [
        { id: '1', name: 'Web App', client_id: 'web-app-client' }
      ];

      const mockSearchResults = {
        data: searchResults.map(client => new MockClient(client))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockSearchResults);

      const searchResults1 = await clients.get({ q: 'web' });
      expect(searchResults1.data).toHaveLength(1);

      // Filter by active status
      const activeClients = [
        { id: '1', name: 'Active App', client_id: 'active-app-client' }
      ];

      const mockActiveClients = {
        data: activeClients.map(client => new MockClient(client))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockActiveClients);

      const activeResults = await clients.get({ active: true });
      expect(activeResults.data).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle API validation errors', async () => {
      const clientData = {
        name: 'Invalid Client',
        client_id: 'invalid-client-id'
      };

      const validationError = new Error('Client ID is required');
      mockBaseAPI.create.mockRejectedValue(validationError);

      await expect(clients.create(clientData)).rejects.toThrow('Client ID is required');
    });

    it('should handle duplicate client creation', async () => {
      const clientData = {
        name: 'Duplicate App',
        client_id: 'duplicate-app-client-id'
      };

      const duplicateError = new Error('Client with this ID already exists');
      mockBaseAPI.create.mockRejectedValue(duplicateError);

      await expect(clients.create(clientData)).rejects.toThrow('Client with this ID already exists');
    });

    it('should handle client not found', async () => {
      const notFoundError = new Error('Client not found');
      mockBaseAPI.get.mockRejectedValue(notFoundError);

      await expect(clients.get({}, 'nonexistent-id')).rejects.toThrow('Client not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockBaseAPI.get.mockRejectedValue(serverError);

      await expect(clients.get()).rejects.toThrow('Internal server error');
    });

    it('should handle redirect URI validation errors', async () => {
      const clientData = {
        name: 'Invalid URI App',
        client_id: 'invalid-uri-app-id',
        redirect_uris: ['invalid-url']
      };

      const uriError = new Error('Invalid redirect URI format');
      mockBaseAPI.create.mockRejectedValue(uriError);

      await expect(clients.create(clientData)).rejects.toThrow('Invalid redirect URI format');
    });

    it('should handle scope validation errors', async () => {
      const clientData = {
        name: 'Invalid Scope App',
        client_id: 'invalid-scope-app-id',
        scopes: ['invalid-scope']
      };

      const scopeError = new Error('Invalid scope specified');
      mockBaseAPI.create.mockRejectedValue(scopeError);

      await expect(clients.create(clientData)).rejects.toThrow('Invalid scope specified');
    });
  });
}); 