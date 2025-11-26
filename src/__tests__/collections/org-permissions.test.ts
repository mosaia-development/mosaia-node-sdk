import OrgPermissions from '../../collections/org-permissions';
import { BaseCollection } from '../../collections/base-collection';
import { OrgPermission } from '../../models';
import { GetOrgPermissionsPayload, GetOrgPermissionPayload, OrgPermissionInterface } from '../../types';

// Mock the BaseAPI
jest.mock('../../collections/base-collection', () => ({
      BaseCollection: jest.fn()
}));
const { BaseCollection: MockBaseCollection } = require('../../collections/base-collection');

// Mock the OrgPermission model
jest.mock('../../models');
const MockOrgPermission = OrgPermission as jest.MockedClass<typeof OrgPermission>;

describe('OrgPermissions', () => {
  let orgPermissions: OrgPermissions;
  let mockBaseAPI: jest.Mocked<BaseCollection<OrgPermissionInterface, OrgPermission, GetOrgPermissionsPayload, GetOrgPermissionPayload>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock BaseAPI instance
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    } as any;

    // Setup mock returns
    MockBaseCollection.mockImplementation(() => mockBaseAPI);
    MockOrgPermission.mockImplementation((data: any) => ({ data } as any));

    orgPermissions = new OrgPermissions();
  });

  describe('constructor', () => {
    it('should create OrgPermissions instance extending BaseCollection', () => {
      expect(orgPermissions).toBeDefined();
      expect(typeof orgPermissions.get).toBe('function');
      expect(typeof orgPermissions.create).toBe('function');
    });

    it('should initialize with correct URI and OrgPermission model', () => {
      expect(MockBaseCollection).toHaveBeenCalledWith('/iam/permission', OrgPermission);
    });

    it('should initialize with custom URI when provided', () => {
      const customOrgPermissions = new OrgPermissions('/org/org-id');
      expect(MockBaseCollection).toHaveBeenCalledWith('/org/org-id/iam/permission', OrgPermission);
    });
  });

  describe('get method', () => {
    it('should get all org permissions successfully', async () => {
      const mockPermissions = [
        { id: '1', org: 'org-1', user: 'user-1', policy: 'policy-1' },
        { id: '2', org: 'org-1', client: 'client-1', policy: 'policy-2' }
      ];

      const mockResponse = {
        data: mockPermissions.map(permission => new MockOrgPermission(permission))
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await orgPermissions.get();

      expect(mockBaseAPI.get).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific org permission by ID', async () => {
      const mockPermission = { id: '1', org: 'org-1', user: 'user-1', policy: 'policy-1' };
      const mockResponse = new MockOrgPermission(mockPermission);
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await orgPermissions.get({}, '1');

      expect(mockBaseAPI.get).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create method', () => {
    it('should create a new org permission successfully', async () => {
      const permissionData = {
        org: 'org-123',
        user: 'user-456',
        policy: 'policy-789'
      };

      const mockPermission = { id: '3', ...permissionData };
      const mockResponse = new MockOrgPermission(mockPermission);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await orgPermissions.create(permissionData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(permissionData);
      expect(result).toEqual(mockResponse);
    });

    it('should create org permission with client', async () => {
      const permissionData = {
        org: 'org-123',
        client: 'client-456',
        policy: 'policy-789'
      };

      const mockPermission = { id: '4', ...permissionData };
      const mockResponse = new MockOrgPermission(mockPermission);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await orgPermissions.create(permissionData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(permissionData);
      expect(result).toEqual(mockResponse);
    });
  });
});

