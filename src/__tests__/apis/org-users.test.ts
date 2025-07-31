import OrgUsers from '../../apis/org-users';
import { BaseAPI } from '../../apis/base-api';
import { OrgUser } from '../../models';
import { GetOrgUsersPayload, GetOrgUserPayload, OrgUserInterface } from '../../types';

// Mock the BaseAPI
jest.mock('../../apis/base-api', () => ({
  BaseAPI: jest.fn()
}));
const { BaseAPI: MockBaseAPI } = require('../../apis/base-api');

// Mock the OrgUser model
jest.mock('../../models');
const MockOrgUser = OrgUser as jest.MockedClass<typeof OrgUser>;

describe('OrgUsers', () => {
  let orgUsers: OrgUsers;
  let mockBaseAPI: jest.Mocked<BaseAPI<OrgUserInterface, OrgUser, GetOrgUsersPayload, GetOrgUserPayload>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock BaseAPI instance
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    } as any;

    // Setup mock returns
    MockBaseAPI.mockImplementation(() => mockBaseAPI);
    MockOrgUser.mockImplementation((data: any) => ({ data } as any));

    orgUsers = new OrgUsers();
  });

  describe('constructor', () => {
    it('should create OrgUsers instance extending BaseAPI', () => {
      expect(orgUsers).toBeDefined();
      expect(typeof orgUsers.get).toBe('function');
      expect(typeof orgUsers.create).toBe('function');
    });

    it('should initialize with correct URI and OrgUser model', () => {
      expect(MockBaseAPI).toHaveBeenCalledWith('/user', OrgUser);
    });

    it('should initialize with custom URI when provided', () => {
      const customOrgUsers = new OrgUsers('/api/v1');
      expect(MockBaseAPI).toHaveBeenCalledWith('/api/v1/user', OrgUser);
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultOrgUsers = new OrgUsers();
      expect(MockBaseAPI).toHaveBeenCalledWith('/user', OrgUser);
    });

    it('should initialize with custom endpoint when provided', () => {
      const orgContextOrgUsers = new OrgUsers('/api/v1', '/org');
      expect(MockBaseAPI).toHaveBeenCalledWith('/api/v1/org', OrgUser);
    });

    it('should initialize with custom URI and endpoint', () => {
      const customOrgUsers = new OrgUsers('/api/v2', '/member');
      expect(MockBaseAPI).toHaveBeenCalledWith('/api/v2/member', OrgUser);
    });
  });

  describe('get method', () => {
    it('should get all org users successfully', async () => {
      const mockOrgUsers = [
        { id: '1', org: 'org-1', user: 'user-1', permission: 'admin' },
        { id: '2', org: 'org-1', user: 'user-2', permission: 'member' }
      ];

      const mockResponse = mockOrgUsers.map(orgUser => new MockOrgUser(orgUser));
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      const result = await orgUsers.get();

      expect(mockBaseAPI.get).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result).toHaveLength(2);
    });

    it('should get a specific org user by ID', async () => {
      const mockOrgUser = { id: '1', org: 'org-1', user: 'user-1', permission: 'admin' };
      const mockResponse = new MockOrgUser(mockOrgUser);
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      const result = await orgUsers.get({}, '1');

      expect(mockBaseAPI.get).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get org users with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        org: 'org-1',
        user: 'user-1',
        permission: 'admin',
        active: true
      };

      const mockOrgUsers = [
        { id: '1', org: 'org-1', user: 'user-1', permission: 'admin' }
      ];

      const mockResponse = mockOrgUsers.map(orgUser => new MockOrgUser(orgUser));
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      const result = await orgUsers.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty org users list', async () => {
      const mockResponse: any[] = [];
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      const result = await orgUsers.get();

      expect(result).toEqual([]);
    });

    it('should handle null response', async () => {
      mockBaseAPI.get.mockResolvedValue(null);

      const result = await orgUsers.get();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch org users');
      mockBaseAPI.get.mockRejectedValue(error);

      await expect(orgUsers.get()).rejects.toThrow('Failed to fetch org users');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockBaseAPI.get.mockRejectedValue(networkError);

      await expect(orgUsers.get()).rejects.toThrow('Network error');
    });
  });

  describe('create method', () => {
    it('should create a new org user successfully', async () => {
      const orgUserData = {
        org: 'org-3',
        user: 'user-3',
        permission: 'admin'
      };

      const mockOrgUser = { id: '3', ...orgUserData };
      const mockResponse = new MockOrgUser(mockOrgUser);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await orgUsers.create(orgUserData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(orgUserData);
      expect(result).toEqual(mockResponse);
    });

    it('should create org user with minimal data', async () => {
      const orgUserData = {
        org: 'org-4',
        user: 'user-4',
        permission: 'member'
      };

      const mockOrgUser = { id: '4', ...orgUserData };
      const mockResponse = new MockOrgUser(mockOrgUser);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await orgUsers.create(orgUserData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(orgUserData);
      expect(result).toEqual(mockResponse);
    });

    it('should create org user with all optional fields', async () => {
      const orgUserData = {
        org: 'org-5',
        user: 'user-5',
        permission: 'member',
        active: true,
        external_id: 'ext-org-user-123'
      };

      const mockOrgUser = { id: '5', ...orgUserData };
      const mockResponse = new MockOrgUser(mockOrgUser);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await orgUsers.create(orgUserData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(orgUserData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const orgUserData = {
        org: 'invalid-org',
        user: 'invalid-user',
        permission: 'invalid-permission'
      };

      const error = new Error('Validation failed');
      mockBaseAPI.create.mockRejectedValue(error);

      await expect(orgUsers.create(orgUserData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const orgUserData = {
        org: 'org-6',
        user: 'user-6',
        permission: 'member'
      };

      const networkError = new Error('Network error');
      mockBaseAPI.create.mockRejectedValue(networkError);

      await expect(orgUsers.create(orgUserData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty org user data in create', async () => {
      const orgUserData = {
        org: '',
        user: '',
        permission: ''
      };

      const mockOrgUser = { id: '6', ...orgUserData };
      const mockResponse = new MockOrgUser(mockOrgUser);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await orgUsers.create(orgUserData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in org user data', async () => {
      const orgUserData = {
        org: 'org-with-special-chars_123',
        user: 'user-with-special-chars_123',
        permission: 'permission-with-special-chars@#$%^&*()'
      };

      const mockOrgUser = { id: '7', ...orgUserData };
      const mockResponse = new MockOrgUser(mockOrgUser);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await orgUsers.create(orgUserData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(orgUserData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long org user data', async () => {
      const longOrgId = 'a'.repeat(1000);
      const longUserId = 'b'.repeat(1000);
      const orgUserData = {
        org: longOrgId,
        user: longUserId,
        permission: 'admin'
      };

      const mockOrgUser = { id: '8', ...orgUserData };
      const mockResponse = new MockOrgUser(mockOrgUser);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await orgUsers.create(orgUserData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        org: 'org@example.com',
        user: 'user-with-special-chars_123',
        external_id: 'id-with-special-chars_123'
      };

      const mockOrgUsers = [
        { id: '1', org: 'Test Org', user: 'Test User', permission: 'admin' }
      ];

      const mockResponse = mockOrgUsers.map(orgUser => new MockOrgUser(orgUser));
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      await orgUsers.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        org: 'org-123',
        user: 'user-456',
        permission: 'admin',
        active: true,
        external_id: 'ext-123'
      };

      const mockOrgUsers = [
        { id: '1', org: 'org-123', user: 'user-456', permission: 'admin' }
      ];

      const mockResponse = mockOrgUsers.map(orgUser => new MockOrgUser(orgUser));
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      await orgUsers.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete org user management flow', async () => {
      // Step 1: Get all org users
      const mockOrgUsers = [
        { id: '1', org: 'org-1', user: 'user-1', permission: 'admin' },
        { id: '2', org: 'org-1', user: 'user-2', permission: 'member' }
      ];

      const mockGetResponse = mockOrgUsers.map(orgUser => new MockOrgUser(orgUser));
      mockBaseAPI.get.mockResolvedValueOnce(mockGetResponse);

      const allOrgUsers = await orgUsers.get();
      expect(allOrgUsers).toHaveLength(2);

      // Step 2: Get specific org user
      const mockOrgUser = { id: '1', org: 'org-1', user: 'user-1', permission: 'admin' };
      const mockGetOrgUserResponse = new MockOrgUser(mockOrgUser);
      mockBaseAPI.get.mockResolvedValueOnce(mockGetOrgUserResponse);

      const specificOrgUser = await orgUsers.get({}, '1');
      expect(specificOrgUser).toEqual(mockGetOrgUserResponse);

      // Step 3: Create new org user
      const newOrgUserData = {
        org: 'org-3',
        user: 'user-3',
        permission: 'admin'
      };

      const mockNewOrgUser = { id: '3', ...newOrgUserData };
      const mockCreateResponse = new MockOrgUser(mockNewOrgUser);
      mockBaseAPI.create.mockResolvedValueOnce(mockCreateResponse);

      const createdOrgUser = await orgUsers.create(newOrgUserData);
      expect(createdOrgUser).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageOrgUsers = [
        { id: '1', org: 'org-1', user: 'user-1', permission: 'admin' },
        { id: '2', org: 'org-1', user: 'user-2', permission: 'member' }
      ];

      const mockFirstPage = firstPageOrgUsers.map(orgUser => new MockOrgUser(orgUser));
      mockBaseAPI.get.mockResolvedValueOnce(mockFirstPage);

      const firstPage = await orgUsers.get({ limit: 2, offset: 0 });
      expect(firstPage).toHaveLength(2);

      // Second page
      const secondPageOrgUsers = [
        { id: '3', org: 'org-1', user: 'user-3', permission: 'member' },
        { id: '4', org: 'org-1', user: 'user-4', permission: 'viewer' }
      ];

      const mockSecondPage = secondPageOrgUsers.map(orgUser => new MockOrgUser(orgUser));
      mockBaseAPI.get.mockResolvedValueOnce(mockSecondPage);

      const secondPage = await orgUsers.get({ limit: 2, offset: 2 });
      expect(secondPage).toHaveLength(2);
    });

    it('should handle search and filtering scenarios', async () => {
      // Filter by organization
      const orgUsersData = [
        { id: '1', org: 'org-1', user: 'user-1', permission: 'admin' }
      ];

      const mockOrgUsers = orgUsersData.map(orgUser => new MockOrgUser(orgUser));
      mockBaseAPI.get.mockResolvedValueOnce(mockOrgUsers);

      const orgResults = await orgUsers.get({ org: 'org-1' });
      expect(orgResults).toHaveLength(1);

      // Filter by user
      const userOrgUsersData = [
        { id: '1', org: 'org-1', user: 'user-1', permission: 'admin' }
      ];

      const mockUserOrgUsers = userOrgUsersData.map(orgUser => new MockOrgUser(orgUser));
      mockBaseAPI.get.mockResolvedValueOnce(mockUserOrgUsers);

      const userResults = await orgUsers.get({ user: 'user-1' });
      expect(userResults).toHaveLength(1);

      // Filter by permission
      const adminOrgUsersData = [
        { id: '1', org: 'org-1', user: 'user-1', permission: 'admin' }
      ];

      const mockAdminOrgUsers = adminOrgUsersData.map(orgUser => new MockOrgUser(orgUser));
      mockBaseAPI.get.mockResolvedValueOnce(mockAdminOrgUsers);

      const adminResults = await orgUsers.get({ permission: 'admin' });
      expect(adminResults).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle API validation errors', async () => {
      const orgUserData = {
        org: 'invalid-org',
        user: 'invalid-user',
        permission: 'invalid-permission'
      };

      const validationError = new Error('Invalid permission specified');
      mockBaseAPI.create.mockRejectedValue(validationError);

      await expect(orgUsers.create(orgUserData)).rejects.toThrow('Invalid permission specified');
    });

    it('should handle duplicate org user creation', async () => {
      const orgUserData = {
        org: 'org-1',
        user: 'user-1',
        permission: 'admin'
      };

      const duplicateError = new Error('User is already a member of this organization');
      mockBaseAPI.create.mockRejectedValue(duplicateError);

      await expect(orgUsers.create(orgUserData)).rejects.toThrow('User is already a member of this organization');
    });

    it('should handle org user not found', async () => {
      const notFoundError = new Error('Organization user relationship not found');
      mockBaseAPI.get.mockRejectedValue(notFoundError);

      await expect(orgUsers.get({}, 'nonexistent-id')).rejects.toThrow('Organization user relationship not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockBaseAPI.get.mockRejectedValue(serverError);

      await expect(orgUsers.get()).rejects.toThrow('Internal server error');
    });

    it('should handle organization validation errors', async () => {
      const orgUserData = {
        org: 'nonexistent-org',
        user: 'user-1',
        permission: 'admin'
      };

      const orgError = new Error('Organization not found');
      mockBaseAPI.create.mockRejectedValue(orgError);

      await expect(orgUsers.create(orgUserData)).rejects.toThrow('Organization not found');
    });

    it('should handle user validation errors', async () => {
      const orgUserData = {
        org: 'org-1',
        user: 'nonexistent-user',
        permission: 'admin'
      };

      const userError = new Error('User not found');
      mockBaseAPI.create.mockRejectedValue(userError);

      await expect(orgUsers.create(orgUserData)).rejects.toThrow('User not found');
    });

    it('should handle permission validation errors', async () => {
      const orgUserData = {
        org: 'org-1',
        user: 'user-1',
        permission: 'super-admin' // Invalid permission
      };

      const permissionError = new Error('Invalid permission level');
      mockBaseAPI.create.mockRejectedValue(permissionError);

      await expect(orgUsers.create(orgUserData)).rejects.toThrow('Invalid permission level');
    });
  });
}); 