import UserPermissions from '../../collections/user-permissions';
import { BaseCollection } from '../../collections/base-collection';
import { UserPermission } from '../../models';
import { GetUserPermissionsPayload, GetUserPermissionPayload, UserPermissionInterface } from '../../types';

// Mock the BaseAPI
jest.mock('../../collections/base-collection', () => ({
      BaseCollection: jest.fn()
}));
const { BaseCollection: MockBaseCollection } = require('../../collections/base-collection');

// Mock the UserPermission model
jest.mock('../../models');
const MockUserPermission = UserPermission as jest.MockedClass<typeof UserPermission>;

describe('UserPermissions', () => {
  let userPermissions: UserPermissions;
  let mockBaseAPI: jest.Mocked<BaseCollection<UserPermissionInterface, UserPermission, GetUserPermissionsPayload, GetUserPermissionPayload>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock BaseAPI instance
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    } as any;

    // Setup mock returns
    MockBaseCollection.mockImplementation(() => mockBaseAPI);
    MockUserPermission.mockImplementation((data: any) => ({ data } as any));

    userPermissions = new UserPermissions();
  });

  describe('constructor', () => {
    it('should create UserPermissions instance extending BaseCollection', () => {
      expect(userPermissions).toBeDefined();
      expect(typeof userPermissions.get).toBe('function');
      expect(typeof userPermissions.create).toBe('function');
    });

    it('should initialize with correct URI and UserPermission model', () => {
      expect(MockBaseCollection).toHaveBeenCalledWith('/iam/permission', UserPermission);
    });

    it('should initialize with custom URI when provided', () => {
      const customUserPermissions = new UserPermissions('/user/user-id');
      expect(MockBaseCollection).toHaveBeenCalledWith('/user/user-id/iam/permission', UserPermission);
    });
  });

  describe('get method', () => {
    it('should get all user permissions successfully', async () => {
      const mockPermissions = [
        { id: '1', user: 'user-1', client: 'client-1', policy: 'policy-1' },
        { id: '2', user: 'user-1', client: 'client-2', policy: 'policy-2' }
      ];

      const mockResponse = {
        data: mockPermissions.map(permission => new MockUserPermission(permission))
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await userPermissions.get();

      expect(mockBaseAPI.get).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific user permission by ID', async () => {
      const mockPermission = { id: '1', user: 'user-1', client: 'client-1', policy: 'policy-1' };
      const mockResponse = new MockUserPermission(mockPermission);
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await userPermissions.get({}, '1');

      expect(mockBaseAPI.get).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create method', () => {
    it('should create a new user permission successfully', async () => {
      const permissionData = {
        user: 'user-456',
        client: 'client-789',
        policy: 'policy-123'
      };

      const mockPermission = { id: '3', ...permissionData };
      const mockResponse = new MockUserPermission(mockPermission);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await userPermissions.create(permissionData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(permissionData);
      expect(result).toEqual(mockResponse);
    });
  });
});

