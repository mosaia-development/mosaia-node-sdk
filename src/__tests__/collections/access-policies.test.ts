import AccessPolicies from '../../collections/access-policies';
import { BaseCollection } from '../../collections/base-collection';
import { AccessPolicy } from '../../models';
import { GetAccessPoliciesPayload, GetAccessPolicyPayload, AccessPolicyInterface } from '../../types';

// Mock the BaseAPI
jest.mock('../../collections/base-collection', () => ({
      BaseCollection: jest.fn()
}));
const { BaseCollection: MockBaseCollection } = require('../../collections/base-collection');

// Mock the AccessPolicy model
jest.mock('../../models');
const MockAccessPolicy = AccessPolicy as jest.MockedClass<typeof AccessPolicy>;

describe('AccessPolicies', () => {
  let accessPolicies: AccessPolicies;
  let mockBaseAPI: jest.Mocked<BaseCollection<AccessPolicyInterface, AccessPolicy, GetAccessPoliciesPayload, GetAccessPolicyPayload>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock BaseAPI instance
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    } as any;

    // Setup mock returns
    MockBaseCollection.mockImplementation(() => mockBaseAPI);
    MockAccessPolicy.mockImplementation((data: any) => ({ data } as any));

    accessPolicies = new AccessPolicies();
  });

  describe('constructor', () => {
    it('should create AccessPolicies instance extending BaseCollection', () => {
      expect(accessPolicies).toBeDefined();
      expect(typeof accessPolicies.get).toBe('function');
      expect(typeof accessPolicies.create).toBe('function');
    });

    it('should initialize with correct URI and AccessPolicy model', () => {
      expect(MockBaseCollection).toHaveBeenCalledWith('/iam/policy', AccessPolicy);
    });

    it('should initialize with custom URI when provided', () => {
      const customAccessPolicies = new AccessPolicies('/org/org-id');
      expect(MockBaseCollection).toHaveBeenCalledWith('/org/org-id/iam/policy', AccessPolicy);
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultAccessPolicies = new AccessPolicies();
      expect(MockBaseCollection).toHaveBeenCalledWith('/iam/policy', AccessPolicy);
    });
  });

  describe('get method', () => {
    it('should get all access policies successfully', async () => {
      const mockPolicies = [
        { id: '1', name: 'Admin Policy', effect: 'allow' as const, actions: ['*'], resources: ['*'] },
        { id: '2', name: 'Read Only Policy', effect: 'allow' as const, actions: ['users:read'], resources: ['users'] }
      ];

      const mockResponse = {
        data: mockPolicies.map(policy => new MockAccessPolicy(policy))
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await accessPolicies.get();

      expect(mockBaseAPI.get).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific access policy by ID', async () => {
      const mockPolicy = { id: '1', name: 'Admin Policy', effect: 'allow' as const, actions: ['*'], resources: ['*'] };
      const mockResponse = new MockAccessPolicy(mockPolicy);
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await accessPolicies.get({}, '1');

      expect(mockBaseAPI.get).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get access policies with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        effect: 'allow' as const,
        active: true
      };

      const mockPolicies = [
        { id: '1', name: 'Admin Policy', effect: 'allow' as const, actions: ['*'], resources: ['*'] }
      ];

      const mockResponse = {
        data: mockPolicies.map(policy => new MockAccessPolicy(policy))
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await accessPolicies.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create method', () => {
    it('should create a new access policy successfully', async () => {
      const policyData = {
        name: 'New Policy',
        effect: 'allow' as const,
        actions: ['users:read', 'users:write'],
        resources: ['users', 'organizations']
      };

      const mockPolicy = { id: '3', ...policyData };
      const mockResponse = new MockAccessPolicy(mockPolicy);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await accessPolicies.create(policyData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(policyData);
      expect(result).toEqual(mockResponse);
    });

    it('should create access policy with conditions', async () => {
      const policyData = {
        name: 'Conditional Policy',
        effect: 'allow' as const,
        actions: ['users:read'],
        resources: ['users'],
        conditions: {
          time: { between: ['09:00', '17:00'] }
        }
      };

      const mockPolicy = { id: '4', ...policyData };
      const mockResponse = new MockAccessPolicy(mockPolicy);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await accessPolicies.create(policyData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(policyData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const policyData = {
        name: 'Invalid Policy',
        effect: 'allow' as const,
        actions: [],
        resources: []
      };

      const error = new Error('Validation failed');
      mockBaseAPI.create.mockRejectedValue(error);

      await expect(accessPolicies.create(policyData)).rejects.toThrow('Validation failed');
    });
  });
});

