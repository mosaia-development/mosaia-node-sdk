import { Access, Accessor, AccessAction, DriveRole, DriveDirectoryRole, DriveFileRole, DriveItemRole } from '../../functions/access';

// Mock the APIClient
jest.mock('../../utils/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    POST: jest.fn(),
    DELETE: jest.fn(),
    GET: jest.fn()
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

  describe('grantByRole', () => {
    it('should grant access with role to user', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'user-123',
          role: 'EDITOR',
          permissions: [
            { action: 'read', success: true, permission: { id: 'perm-1' } },
            { action: 'create', success: true, permission: { id: 'perm-2' } },
            { action: 'update', success: true, permission: { id: 'perm-3' } }
          ]
        }
      };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const result = await access.grantByRole({ user: 'user-123' }, 'EDITOR');

      expect(mockApiClient.POST).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { user: 'user-123' }, role: 'EDITOR' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should grant access with role and options', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'orguser-123',
          role: 'MANAGER',
          drive_permissions: [],
          cascaded_items: { total: 10, granted: 20, failed: 0, items: [] }
        }
      };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const result = await access.grantByRole(
        { org_user: 'orguser-123' },
        'MANAGER',
        { cascade_to_items: true }
      );

      expect(mockApiClient.POST).toHaveBeenCalledWith(
        '/drive/123/access',
        {
          accessor: { org_user: 'orguser-123' },
          role: 'MANAGER',
          options: { cascade_to_items: true }
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should grant path-based access to item', async () => {
      const mockResponse = {
        data: {
          item_id: 'item-123',
          accessor_id: 'orguser-123',
          role: 'EDITOR',
          drive_permissions: [],
          folder_permissions: [],
          target_permissions: []
        }
      };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      const result = await access.grantByRole(
        { org_user: 'orguser-123' },
        'EDITOR',
        { mode: 'path', folder_role: 'READ_ONLY' }
      );

      expect(mockApiClient.POST).toHaveBeenCalledWith(
        '/drive/123/access',
        {
          accessor: { org_user: 'orguser-123' },
          role: 'EDITOR',
          options: { mode: 'path', folder_role: 'READ_ONLY' }
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const error = new Error('Invalid role');
      mockApiClient.POST.mockRejectedValue(error);

      await expect(access.grantByRole({ user: 'user-123' }, 'INVALID_ROLE' as any))
        .rejects.toThrow('Invalid role');
    });
  });

  describe('revoke', () => {
    it('should revoke all access with string user ID', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'user-123',
          revoked_count: 3
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ user: 'user-123' });

      expect(mockApiClient.DELETE).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { user: 'user-123' } }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should revoke all access with User model object', async () => {
      const userModel = { id: 'user-456', email: 'test@example.com' };
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'user-456',
          revoked_count: 2
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ user: userModel as any });

      expect(mockApiClient.DELETE).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { user: 'user-456' } }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should revoke all access from org user', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'orguser-789',
          revoked_count: 1
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ org_user: 'orguser-789' });

      expect(mockApiClient.DELETE).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { org_user: 'orguser-789' } }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should revoke all access from agent', async () => {
      const agentModel = { id: 'agent-101', name: 'Test Agent' };
      const mockResponse = {
        data: {
          item_id: 'item-123',
          accessor_id: 'agent-101',
          revoked_count: 3
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ agent: agentModel as any });

      expect(mockApiClient.DELETE).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { agent: 'agent-101' } }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should revoke all access from client', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'client-202',
          revoked_count: 1
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ client: 'client-202' });

      expect(mockApiClient.DELETE).toHaveBeenCalledWith(
        '/drive/123/access',
        { accessor: { client: 'client-202' } }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const error = new Error('Accessor not found');
      mockApiClient.DELETE.mockRejectedValue(error);

      await expect(access.revoke({ user: 'user-123' }))
        .rejects.toThrow('Accessor not found');
    });

    it('should return response data directly if no data property', async () => {
      const mockResponse = {
        drive_id: 'drive-123',
        accessor_id: 'user-303',
        revoked_count: 1
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ user: 'user-303' });

      expect(result).toEqual(mockResponse);
    });

    it('should return revoked_count in response', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessor_id: 'user-123',
          revoked_count: 5
        }
      };
      mockApiClient.DELETE.mockResolvedValue(mockResponse);

      const result = await access.revoke({ user: 'user-123' });

      expect(result.revoked_count).toBe(5);
    });
  });

  describe('list', () => {
    it('should list all accessors', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessors: [
            {
              accessor_id: 'user-123',
              accessor_type: 'user',
              role: 'EDITOR'
            },
            {
              accessor_id: 'orguser-456',
              accessor_type: 'org_user',
              role: 'VIEWER'
            }
          ]
        }
      };
      mockApiClient.GET.mockResolvedValue(mockResponse);

      const result = await access.list();

      expect(mockApiClient.GET).toHaveBeenCalledWith('/drive/123/access');
      expect(result).toEqual(mockResponse.data);
      expect(result.accessors).toHaveLength(2);
    });

    it('should return empty array when no accessors', async () => {
      const mockResponse = {
        data: {
          drive_id: 'drive-123',
          accessors: []
        }
      };
      mockApiClient.GET.mockResolvedValue(mockResponse);

      const result = await access.list();

      expect(result.accessors).toEqual([]);
    });

    it('should handle API errors', async () => {
      const error = new Error('Drive not found');
      mockApiClient.GET.mockRejectedValue(error);

      await expect(access.list())
        .rejects.toThrow('Drive not found');
    });

    it('should return response data directly if no data property', async () => {
      const mockResponse = {
        drive_id: 'drive-123',
        accessors: []
      };
      mockApiClient.GET.mockResolvedValue(mockResponse);

      const result = await access.list();

      expect(result).toEqual(mockResponse);
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

      await expect(access.revoke({ user: 'user-123' }))
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
