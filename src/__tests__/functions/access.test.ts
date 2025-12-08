import { Access, Accessor, AccessAction } from '../../functions/access';

// Mock the APIClient
jest.mock('../../utils/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    POST: jest.fn(),
    DELETE: jest.fn()
  }));
});

// Mock the ConfigurationManager
jest.mock('../../config', () => ({
  ConfigurationManager: {
    getInstance: jest.fn().mockReturnValue({
      getConfig: jest.fn().mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1'
      })
    })
  }
}));

// Mock the model imports
jest.mock('../../models/user', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('../../models/org-user', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('../../models/agent', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('../../models/client', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('Access', () => {
  let access: Access;
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    access = new Access('/drive/123');
    mockApiClient = (access as any).apiClient;
  });

  describe('constructor', () => {
    it('should create Access instance with default URI', () => {
      const access = new Access();
      expect(access).toBeDefined();
      expect((access as any).uri).toBe('/access');
    });

    it('should create Access instance with custom URI', () => {
      const access = new Access('/drive/456');
      expect(access).toBeDefined();
      expect((access as any).uri).toBe('/drive/456/access');
    });

    it('should initialize API client and config manager', () => {
      expect((access as any).apiClient).toBeDefined();
      expect((access as any).configManager).toBeDefined();
      expect((access as any).config).toBeDefined();
    });
  });

  describe('normalizeAccessor', () => {
    it('should normalize accessor with string user ID', () => {
      const accessor: Accessor = { user: 'user-123' };
      const normalized = (access as any).normalizeAccessor(accessor);
      
      expect(normalized).toEqual({ user: 'user-123' });
    });

    it('should normalize accessor with User model object', () => {
      const userModel = { id: 'user-456', email: 'test@example.com' };
      const accessor: Accessor = { user: userModel as any };
      const normalized = (access as any).normalizeAccessor(accessor);
      
      expect(normalized).toEqual({ user: 'user-456' });
    });

    it('should normalize accessor with string org_user ID', () => {
      const accessor: Accessor = { org_user: 'orguser-123' };
      const normalized = (access as any).normalizeAccessor(accessor);
      
      expect(normalized).toEqual({ org_user: 'orguser-123' });
    });

    it('should normalize accessor with OrgUser model object', () => {
      const orgUserModel = { id: 'orguser-456', role: 'admin' };
      const accessor: Accessor = { org_user: orgUserModel as any };
      const normalized = (access as any).normalizeAccessor(accessor);
      
      expect(normalized).toEqual({ org_user: 'orguser-456' });
    });

    it('should normalize accessor with string agent ID', () => {
      const accessor: Accessor = { agent: 'agent-123' };
      const normalized = (access as any).normalizeAccessor(accessor);
      
      expect(normalized).toEqual({ agent: 'agent-123' });
    });

    it('should normalize accessor with Agent model object', () => {
      const agentModel = { id: 'agent-456', name: 'Test Agent' };
      const accessor: Accessor = { agent: agentModel as any };
      const normalized = (access as any).normalizeAccessor(accessor);
      
      expect(normalized).toEqual({ agent: 'agent-456' });
    });

    it('should normalize accessor with string client ID', () => {
      const accessor: Accessor = { client: 'client-123' };
      const normalized = (access as any).normalizeAccessor(accessor);
      
      expect(normalized).toEqual({ client: 'client-123' });
    });

    it('should normalize accessor with Client model object', () => {
      const clientModel = { id: 'client-456', name: 'Test Client' };
      const accessor: Accessor = { client: clientModel as any };
      const normalized = (access as any).normalizeAccessor(accessor);
      
      expect(normalized).toEqual({ client: 'client-456' });
    });

    it('should handle empty accessor', () => {
      const accessor: Accessor = {};
      const normalized = (access as any).normalizeAccessor(accessor);
      
      expect(normalized).toEqual({});
    });

    it('should handle multiple accessor types', () => {
      const accessor: Accessor = {
        user: 'user-123',
        agent: { id: 'agent-456' } as any
      };
      const normalized = (access as any).normalizeAccessor(accessor);
      
      expect(normalized).toEqual({
        user: 'user-123',
        agent: 'agent-456'
      });
    });
  });

  describe('grant', () => {
    it('should grant access with string user ID', async () => {
      const mockResponse = {
        data: {
          permission: { id: 'perm-123' },
          drive_id: 'drive-123',
          accessor_id: 'user-123',
          action: 'read'
        }
      };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const result = await access.grant({ user: 'user-123' }, 'read');

      expect(mockApiClient.POST).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { user: 'user-123' }, action: 'read' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should grant access with User model object', async () => {
      const userModel = { id: 'user-456', email: 'test@example.com' };
      const mockResponse = {
        data: {
          permission: { id: 'perm-456' },
          drive_id: 'drive-123',
          accessor_id: 'user-456',
          action: 'update'
        }
      };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const result = await access.grant({ user: userModel as any }, 'update');

      expect(mockApiClient.POST).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { user: 'user-456' }, action: 'update' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should grant access with all action types', async () => {
      const actions: AccessAction[] = ['read', 'update', 'delete', '*'];
      
      for (const action of actions) {
        mockApiClient.POST.mockResolvedValue({
          data: { permission: {}, accessor_id: 'user-123', action }
        });

        await access.grant({ user: 'user-123' }, action);

        expect(mockApiClient.POST).toHaveBeenCalledWith(
          '/drive/123/access',
          { accessor: { user: 'user-123' }, action }
        );
      }
    });

    it('should grant access to org user', async () => {
      const mockResponse = {
        data: {
          permission: { id: 'perm-789' },
          drive_id: 'drive-123',
          accessor_id: 'orguser-789',
          action: 'delete'
        }
      };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const result = await access.grant({ org_user: 'orguser-789' }, 'delete');

      expect(mockApiClient.POST).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { org_user: 'orguser-789' }, action: 'delete' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should grant access to agent', async () => {
      const agentModel = { id: 'agent-101', name: 'Test Agent' };
      const mockResponse = {
        data: {
          permission: { id: 'perm-101' },
          item_id: 'item-123',
          accessor_id: 'agent-101',
          action: '*'
        }
      };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const result = await access.grant({ agent: agentModel as any }, '*');

      expect(mockApiClient.POST).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { agent: 'agent-101' }, action: '*' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should grant access to client', async () => {
      const mockResponse = {
        data: {
          permission: { id: 'perm-202' },
          drive_id: 'drive-123',
          accessor_id: 'client-202',
          action: 'read'
        }
      };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const result = await access.grant({ client: 'client-202' }, 'read');

      expect(mockApiClient.POST).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { client: 'client-202' }, action: 'read' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const error = new Error('Permission denied');
      mockApiClient.POST.mockRejectedValue(error);

      await expect(access.grant({ user: 'user-123' }, 'read'))
        .rejects.toThrow('Permission denied');
    });

    it('should return response data directly if no data property', async () => {
      const mockResponse = {
        permission: { id: 'perm-303' },
        drive_id: 'drive-123',
        accessor_id: 'user-303',
        action: 'read'
      };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const result = await access.grant({ user: 'user-303' }, 'read');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('revoke', () => {
    it('should revoke access with string user ID', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'user-123',
          action: 'read',
          deleted_count: 1
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ user: 'user-123' }, 'read');

      expect(mockApiClient.DELETE).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { user: 'user-123' }, action: 'read' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should revoke access with User model object', async () => {
      const userModel = { id: 'user-456', email: 'test@example.com' };
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'user-456',
          action: 'update',
          deleted_count: 2
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ user: userModel as any }, 'update');

      expect(mockApiClient.DELETE).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { user: 'user-456' }, action: 'update' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should revoke access with all action types', async () => {
      const actions: AccessAction[] = ['read', 'update', 'delete', '*'];
      
      for (const action of actions) {
        mockApiClient.DELETE.mockResolvedValue({
          data: { accessor_id: 'user-123', action, deleted_count: 1 }
        });

        await access.revoke({ user: 'user-123' }, action);

        expect(mockApiClient.DELETE).toHaveBeenCalledWith(
          '/drive/123/access',
          { accessor: { user: 'user-123' }, action }
        );
      }
    });

    it('should revoke access from org user', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'orguser-789',
          action: 'delete',
          deleted_count: 1
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ org_user: 'orguser-789' }, 'delete');

      expect(mockApiClient.DELETE).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { org_user: 'orguser-789' }, action: 'delete' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should revoke access from agent', async () => {
      const agentModel = { id: 'agent-101', name: 'Test Agent' };
      const mockResponse = {
        data: {
          item_id: 'item-123',
          accessor_id: 'agent-101',
          action: '*',
          deleted_count: 3
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ agent: agentModel as any }, '*');

      expect(mockApiClient.DELETE).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { agent: 'agent-101' }, action: '*' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should revoke access from client', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'client-202',
          action: 'read',
          deleted_count: 1
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ client: 'client-202' }, 'read');

      expect(mockApiClient.DELETE).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { client: 'client-202' }, action: 'read' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const error = new Error('Permission not found');
      mockApiClient.DELETE.mockRejectedValue(error);

      await expect(access.revoke({ user: 'user-123' }, 'read'))
        .rejects.toThrow('Permission not found');
    });

    it('should return response data directly if no data property', async () => {
      const mockResponse = {
        drive_id: 'drive-123',
        accessor_id: 'user-303',
        action: 'read',
        deleted_count: 1
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ user: 'user-303' }, 'read');

      expect(result).toEqual(mockResponse);
    });

    it('should return deleted_count in response', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'user-123',
          action: '*',
          deleted_count: 5
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ user: 'user-123' }, '*');

      expect(result.deleted_count).toBe(5);
    });
  });

  describe('error handling', () => {
    it('should handle unknown errors in grant', async () => {
      mockApiClient.POST.mockRejectedValue('Unknown error');

      await expect(access.grant({ user: 'user-123' }, 'read'))
        .rejects.toBeDefined();
    });

    it('should handle unknown errors in revoke', async () => {
      mockApiClient.DELETE.mockRejectedValue('Unknown error');

      await expect(access.revoke({ user: 'user-123' }, 'read'))
        .rejects.toBeDefined();
    });

    it('should handle error objects with message', async () => {
      const error = new Error('Custom error message');
      mockApiClient.POST.mockRejectedValue(error);

      await expect(access.grant({ user: 'user-123' }, 'read'))
        .rejects.toThrow('Custom error message');
    });
  });
});
