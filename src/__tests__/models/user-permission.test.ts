import { UserPermission } from '../../models';
import { UserPermissionInterface } from '../../types';

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

describe('UserPermission Model', () => {
  let userPermission: any;
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const permissionData: Partial<UserPermissionInterface> = {
      id: '123',
      user: 'user-456',
      client: 'client-789',
      policy: 'policy-123',
      active: true
    };

    userPermission = new UserPermission(permissionData);
    mockApiClient = userPermission.apiClient;
  });

  describe('constructor', () => {
    it('should create UserPermission instance with default URI', () => {
      const permissionData: Partial<UserPermissionInterface> = {
        user: 'user-456',
        client: 'client-789',
        policy: 'policy-123'
      };

      const permission = new UserPermission(permissionData);
      expect(permission).toBeDefined();
      expect((permission as any).uri).toBe('/iam/permission');
    });

    it('should create UserPermission instance with custom URI', () => {
      const permissionData: Partial<UserPermissionInterface> = {
        user: 'user-456',
        client: 'client-789',
        policy: 'policy-123'
      };

      const permission = new UserPermission(permissionData, '/user/user-id/iam/permission');
      expect(permission).toBeDefined();
      expect((permission as any).uri).toBe('/user/user-id/iam/permission');
    });

    it('should set user permission properties from data', () => {
      const permissionData: Partial<UserPermissionInterface> = {
        user: 'user-456',
        client: 'client-789',
        policy: 'policy-123'
      };

      const permission = new UserPermission(permissionData);
      expect((permission as any).user).toBe('user-456');
      expect((permission as any).client).toBe('client-789');
      expect((permission as any).policy).toBe('policy-123');
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(userPermission.save).toBeDefined();
      expect(typeof userPermission.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(userPermission.delete).toBeDefined();
      expect(typeof userPermission.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(userPermission.update).toBeDefined();
      expect(typeof userPermission.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(userPermission.isActive).toBeDefined();
      expect(typeof userPermission.isActive).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access user permission data properties', () => {
      expect((userPermission as any).user).toBe('user-456');
      expect((userPermission as any).client).toBe('client-789');
      expect((userPermission as any).policy).toBe('policy-123');
    });
  });
});

