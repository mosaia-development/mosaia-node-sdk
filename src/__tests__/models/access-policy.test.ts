import { AccessPolicy } from '../../models';
import { AccessPolicyInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/iam/policy';
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
    this.getUri = jest.fn().mockReturnValue('/iam/policy/123');
    this.save = jest.fn();
    this.delete = jest.fn();
    this.isActive = jest.fn().mockReturnValue(data.active !== false);
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

describe('AccessPolicy Model', () => {
  let accessPolicy: any;
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const policyData: Partial<AccessPolicyInterface> = {
      id: '123',
      name: 'Admin Access',
      effect: 'allow',
      actions: ['users:read', 'users:write'],
      resources: ['users', 'organizations'],
      active: true
    };

    accessPolicy = new AccessPolicy(policyData);
    mockApiClient = accessPolicy.apiClient;
  });

  describe('constructor', () => {
    it('should create AccessPolicy instance with default URI', () => {
      const policyData: Partial<AccessPolicyInterface> = {
        name: 'Read Only Access',
        effect: 'allow',
        actions: ['users:read'],
        resources: ['users']
      };

      const policy = new AccessPolicy(policyData);
      expect(policy).toBeDefined();
      expect((policy as any).uri).toBe('/iam/policy');
    });

    it('should create AccessPolicy instance with custom URI', () => {
      const policyData: Partial<AccessPolicyInterface> = {
        name: 'Custom Policy',
        effect: 'allow',
        actions: ['users:read'],
        resources: ['users']
      };

      const policy = new AccessPolicy(policyData, '/org/org-id/iam/policy');
      expect(policy).toBeDefined();
      expect((policy as any).uri).toBe('/org/org-id/iam/policy');
    });

    it('should set access policy properties from data', () => {
      const policyData: Partial<AccessPolicyInterface> = {
        name: 'Test Policy',
        effect: 'deny',
        actions: ['users:delete'],
        resources: ['users:*']
      };

      const policy = new AccessPolicy(policyData);
      expect((policy as any).name).toBe('Test Policy');
      expect((policy as any).effect).toBe('deny');
      expect((policy as any).actions).toEqual(['users:delete']);
      expect((policy as any).resources).toEqual(['users:*']);
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(accessPolicy.save).toBeDefined();
      expect(typeof accessPolicy.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(accessPolicy.delete).toBeDefined();
      expect(typeof accessPolicy.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(accessPolicy.update).toBeDefined();
      expect(typeof accessPolicy.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(accessPolicy.isActive).toBeDefined();
      expect(typeof accessPolicy.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(accessPolicy.toJSON).toBeDefined();
      expect(typeof accessPolicy.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(accessPolicy.toAPIPayload).toBeDefined();
      expect(typeof accessPolicy.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access access policy data properties', () => {
      expect((accessPolicy as any).name).toBe('Admin Access');
      expect((accessPolicy as any).effect).toBe('allow');
      expect((accessPolicy as any).actions).toEqual(['users:read', 'users:write']);
      expect((accessPolicy as any).resources).toEqual(['users', 'organizations']);
    });

    it('should return access policy data via toJSON', () => {
      const jsonData = accessPolicy.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        name: 'Admin Access',
        effect: 'allow',
        actions: ['users:read', 'users:write'],
        resources: ['users', 'organizations'],
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = accessPolicy.toAPIPayload();
      expect(apiPayload).toEqual({
        name: 'Admin Access',
        effect: 'allow',
        actions: ['users:read', 'users:write'],
        resources: ['users', 'organizations'],
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('access policy-specific functionality', () => {
    it('should handle allow policy', () => {
      const allowPolicy = new AccessPolicy({
        name: 'Allow Policy',
        effect: 'allow',
        actions: ['*'],
        resources: ['*']
      });

      expect((allowPolicy as any).effect).toBe('allow');
      expect((allowPolicy as any).actions).toEqual(['*']);
      expect((allowPolicy as any).resources).toEqual(['*']);
    });

    it('should handle deny policy', () => {
      const denyPolicy = new AccessPolicy({
        name: 'Deny Policy',
        effect: 'deny',
        actions: ['users:delete'],
        resources: ['users:*']
      });

      expect((denyPolicy as any).effect).toBe('deny');
      expect((denyPolicy as any).actions).toEqual(['users:delete']);
    });

    it('should handle policy with conditions', () => {
      const conditionalPolicy = new AccessPolicy({
        name: 'Time-based Policy',
        effect: 'allow',
        actions: ['users:read'],
        resources: ['users'],
        conditions: {
          time: {
            between: ['09:00', '17:00']
          }
        }
      });

      expect((conditionalPolicy as any).conditions).toEqual({
        time: {
          between: ['09:00', '17:00']
        }
      });
    });

    it('should handle policy with external_id', () => {
      const policyWithExternalId = new AccessPolicy({
        name: 'External Policy',
        effect: 'allow',
        actions: ['users:read'],
        resources: ['users'],
        external_id: 'ext-policy-123'
      });

      expect((policyWithExternalId as any).external_id).toBe('ext-policy-123');
    });

    it('should handle policy with extensors', () => {
      const policyWithExtensors = new AccessPolicy({
        name: 'Extended Policy',
        effect: 'allow',
        actions: ['users:read'],
        resources: ['users'],
        extensors: {
          environment: 'production',
          team: 'security'
        }
      });

      expect((policyWithExtensors as any).extensors).toEqual({
        environment: 'production',
        team: 'security'
      });
    });

    it('should handle multiple actions and resources', () => {
      const multiPolicy = new AccessPolicy({
        name: 'Multi Resource Policy',
        effect: 'allow',
        actions: ['users:read', 'users:write', 'organizations:read'],
        resources: ['users', 'organizations', 'apps']
      });

      expect((multiPolicy as any).actions).toHaveLength(3);
      expect((multiPolicy as any).resources).toHaveLength(3);
    });
  });
});

