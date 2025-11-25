import { OrgPermission } from '../../models';
import { OrgPermissionInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/iam/permission';
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
    this.getUri = jest.fn().mockReturnValue('/iam/permission/123');
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

describe('OrgPermission Model', () => {
  let orgPermission: any;
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const permissionData: Partial<OrgPermissionInterface> = {
      id: '123',
      org: 'org-123',
      user: 'user-456',
      policy: 'policy-789',
      active: true
    };

    orgPermission = new OrgPermission(permissionData);
    mockApiClient = orgPermission.apiClient;
  });

  describe('constructor', () => {
    it('should create OrgPermission instance with default URI', () => {
      const permissionData: Partial<OrgPermissionInterface> = {
        org: 'org-123',
        user: 'user-456',
        policy: 'policy-789'
      };

      const permission = new OrgPermission(permissionData);
      expect(permission).toBeDefined();
      expect((permission as any).uri).toBe('/iam/permission');
    });

    it('should create OrgPermission instance with custom URI', () => {
      const permissionData: Partial<OrgPermissionInterface> = {
        org: 'org-123',
        user: 'user-456',
        policy: 'policy-789'
      };

      const permission = new OrgPermission(permissionData, '/org/org-id/iam/permission');
      expect(permission).toBeDefined();
      expect((permission as any).uri).toBe('/org/org-id/iam/permission');
    });

    it('should set org permission properties from data', () => {
      const permissionData: Partial<OrgPermissionInterface> = {
        org: 'org-123',
        client: 'client-456',
        policy: 'policy-789'
      };

      const permission = new OrgPermission(permissionData);
      expect((permission as any).org).toBe('org-123');
      expect((permission as any).client).toBe('client-456');
      expect((permission as any).policy).toBe('policy-789');
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(orgPermission.save).toBeDefined();
      expect(typeof orgPermission.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(orgPermission.delete).toBeDefined();
      expect(typeof orgPermission.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(orgPermission.update).toBeDefined();
      expect(typeof orgPermission.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(orgPermission.isActive).toBeDefined();
      expect(typeof orgPermission.isActive).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access org permission data properties', () => {
      expect((orgPermission as any).org).toBe('org-123');
      expect((orgPermission as any).user).toBe('user-456');
      expect((orgPermission as any).policy).toBe('policy-789');
    });

    it('should handle permission with client instead of user', () => {
      const clientPermission = new OrgPermission({
        org: 'org-123',
        client: 'client-456',
        policy: 'policy-789'
      });

      expect((clientPermission as any).org).toBe('org-123');
      expect((clientPermission as any).client).toBe('client-456');
      expect((clientPermission as any).policy).toBe('policy-789');
    });
  });
});

