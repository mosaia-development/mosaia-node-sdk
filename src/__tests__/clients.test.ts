import Clients from '../apis/clients';
import { MosiaConfig, ClientInterface } from '../types';

// Mock the APIClient
jest.mock('../apis/api-client');

describe('Clients API', () => {
  let clients: Clients;
  const mockConfig: MosiaConfig = {
    apiKey: 'test-api-key',
    apiURL: 'https://api.test.com/v1',
    version: '1'
  };

  beforeEach(() => {
    clients = new Clients();
  });

  describe('Constructor', () => {
    it('should create a Clients instance', () => {
      expect(clients).toBeInstanceOf(Clients);
    });
  });

  describe('getAll', () => {
    it('should call GET with search parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            { 
              id: '1', 
              name: 'Test Client', 
              client_id: 'test-client-id',
              redirect_uris: ['https://test.com/callback'],
              scopes: ['read', 'write'],
              active: true
            }
          ],
          paging: { limit: 10, offset: 0, total: 1 }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (clients as any).client = mockClient;

      const params = {
        limit: 10,
        offset: 0,
        search: 'test',
        active: true,
        org: 'org-123',
        user: 'user-123'
      };

      const result = await clients.getAll(params);

      expect(mockClient.GET).toHaveBeenCalledWith('/client', params);
      expect(result).toEqual(mockResponse);
    });

    it('should call GET without parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            { 
              id: '1', 
              name: 'Test Client', 
              client_id: 'test-client-id',
              redirect_uris: ['https://test.com/callback'],
              scopes: ['read', 'write']
            }
          ],
          paging: { limit: 5, offset: 0, total: 1 }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (clients as any).client = mockClient;

      const result = await clients.getAll();

      expect(mockClient.GET).toHaveBeenCalledWith('/client', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should handle organization filtering', async () => {
      const mockResponse = {
        data: {
          data: [
            { 
              id: '1', 
              name: 'Org Client', 
              client_id: 'org-client-id',
              org: 'org-123',
              active: true
            }
          ],
          paging: { limit: 10, offset: 0, total: 1 }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (clients as any).client = mockClient;

      const result = await clients.getAll({ org: 'org-123' });

      expect(mockClient.GET).toHaveBeenCalledWith('/client', { org: 'org-123' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should call GET with client ID', async () => {
      const mockResponse = {
        data: {
          data: { 
            id: '1', 
            name: 'Test Client', 
            client_id: 'test-client-id',
            redirect_uris: ['https://test.com/callback'],
            scopes: ['read', 'write'],
            active: true
          }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (clients as any).client = mockClient;

      const result = await clients.getById('1');

      expect(mockClient.GET).toHaveBeenCalledWith('/client/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle client not found', async () => {
      const mockError = {
        data: null,
        meta: {
          status: 404,
          message: 'Client not found'
        },
        error: {
          message: 'Client not found',
          code: 'CLIENT_NOT_FOUND',
          status: 404
        }
      };

      const mockClient = {
        GET: jest.fn().mockRejectedValue(mockError)
      };

      (clients as any).client = mockClient;

      await expect(clients.getById('nonexistent')).rejects.toEqual(mockError);
    });
  });

  describe('create', () => {
    it('should call POST with client data', async () => {
      const mockResponse = {
        data: {
          data: { 
            id: '2', 
            name: 'New Client', 
            client_id: 'new-client-id',
            redirect_uris: ['https://newapp.com/callback'],
            scopes: ['read', 'write'],
            active: true
          }
        },
        status: 201
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue(mockResponse)
      };

      (clients as any).client = mockClient;

      const newClient: Omit<ClientInterface, 'id'> = {
        name: 'New Client',
        client_id: 'new-client-id',
        redirect_uris: ['https://newapp.com/callback'],
        scopes: ['read', 'write'],
        active: true
      };

      const result = await clients.create(newClient);

      expect(mockClient.POST).toHaveBeenCalledWith('/client', newClient);
      expect(result).toEqual(mockResponse);
    });

    it('should handle required fields validation', async () => {
      const mockError = {
        data: null,
        meta: {
          status: 400,
          message: 'Validation error'
        },
        error: {
          message: 'Client ID is required',
          code: 'VALIDATION_ERROR',
          status: 400
        }
      };

      const mockClient = {
        POST: jest.fn().mockRejectedValue(mockError)
      };

      (clients as any).client = mockClient;

      const invalidClient = {
        name: 'Invalid Client'
        // Missing client_id
      };

      await expect(clients.create(invalidClient as any)).rejects.toEqual(mockError);
    });
  });

  describe('update', () => {
    it('should call PUT with client ID and update data', async () => {
      const mockResponse = {
        data: {
          data: { 
            id: '1', 
            name: 'Updated Client', 
            client_id: 'test-client-id',
            redirect_uris: ['https://updated.com/callback'],
            scopes: ['read', 'write', 'admin'],
            active: true
          }
        },
        status: 200
      };

      const mockClient = {
        PUT: jest.fn().mockResolvedValue(mockResponse)
      };

      (clients as any).client = mockClient;

      const updateData = {
        name: 'Updated Client',
        redirect_uris: ['https://updated.com/callback'],
        scopes: ['read', 'write', 'admin']
      };

      const result = await clients.update('1', updateData);

      expect(mockClient.PUT).toHaveBeenCalledWith('/client/1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle partial updates', async () => {
      const mockResponse = {
        data: {
          data: { 
            id: '1', 
            name: 'Test Client', 
            client_id: 'test-client-id',
            redirect_uris: ['https://test.com/callback'],
            scopes: ['read', 'write'],
            active: false // Updated
          }
        },
        status: 200
      };

      const mockClient = {
        PUT: jest.fn().mockResolvedValue(mockResponse)
      };

      (clients as any).client = mockClient;

      const result = await clients.update('1', { active: false });

      expect(mockClient.PUT).toHaveBeenCalledWith('/client/1', { active: false });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call DELETE with client ID for soft delete', async () => {
      const mockResponse = {
        data: null,
        meta: {
          status: 200,
          message: 'Client deleted successfully'
        },
        error: null
      };

      const mockClient = {
        DELETE: jest.fn().mockResolvedValue(mockResponse)
      };

      (clients as any).client = mockClient;

      const result = await clients.delete('1');

      expect(mockClient.DELETE).toHaveBeenCalledWith('/client/1', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call DELETE with force parameter for hard delete', async () => {
      const mockResponse = {
        data: null,
        meta: {
          status: 200,
          message: 'Client permanently deleted'
        },
        error: null
      };

      const mockClient = {
        DELETE: jest.fn().mockResolvedValue(mockResponse)
      };

      (clients as any).client = mockClient;

      const result = await clients.delete('1', { force: true });

      expect(mockClient.DELETE).toHaveBeenCalledWith('/client/1', { force: true });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Client interface validation', () => {
    it('should validate required fields for client creation', () => {
      const validClient: Omit<ClientInterface, 'id'> = {
        name: 'Test Client',
        client_id: 'test-client-id'
      };

      expect(validClient.name).toBeDefined();
      expect(validClient.client_id).toBeDefined();
    });

    it('should handle optional fields', () => {
      const clientWithOptionalFields: Omit<ClientInterface, 'id'> = {
        name: 'Test Client',
        client_id: 'test-client-id',
        client_secret: 'secret-123',
        redirect_uris: ['https://test.com/callback'],
        scopes: ['read', 'write'],
        active: true,
        external_id: 'ext-123',
        extensors: {
          custom_field: 'custom_value'
        }
      };

      expect(clientWithOptionalFields.client_secret).toBeDefined();
      expect(clientWithOptionalFields.redirect_uris).toBeDefined();
      expect(clientWithOptionalFields.scopes).toBeDefined();
      expect(clientWithOptionalFields.active).toBeDefined();
      expect(clientWithOptionalFields.external_id).toBeDefined();
      expect(clientWithOptionalFields.extensors).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      const mockClient = {
        GET: jest.fn().mockRejectedValue(networkError)
      };

      (clients as any).client = mockClient;

      await expect(clients.getAll()).rejects.toThrow('Network error');
    });

    it('should handle API errors with proper structure', async () => {
      const apiError = {
        data: null,
        meta: {
          status: 500,
          message: 'Internal server error'
        },
        error: {
          message: 'Something went wrong',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };

      const mockClient = {
        GET: jest.fn().mockRejectedValue(apiError)
      };

      (clients as any).client = mockClient;

      await expect(clients.getAll()).rejects.toEqual(apiError);
    });
  });
}); 