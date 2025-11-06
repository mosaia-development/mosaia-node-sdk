import { Session } from '../../models';
import { SessionInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/session';
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
    this.getUri = jest.fn().mockReturnValue('/session/123');
    this.save = jest.fn();
    this.delete = jest.fn();
    this.isActive = jest.fn().mockReturnValue(data.active === true);
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

// Mock the User model
jest.mock('../../models/user', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function(this: any, data: any) {
    this.data = data;
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
    // Set properties from data
    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
  })
}));

// Mock the Organization model
jest.mock('../../models/organization', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function(this: any, data: any) {
    this.data = data;
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
    // Set properties from data
    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
  })
}));

// Mock the MosaiaClient
jest.mock('../../index', () => ({
  MosaiaClient: jest.fn().mockImplementation(() => ({
    config: {
      apiKey: 'test-api-key',
      apiURL: 'https://api.mosaia.ai',
      version: '1'
    }
  }))
}));

describe('Session Model', () => {
  let session: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const sessionData: Partial<SessionInterface> = {
      id: '123',
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      },
      org: {
        id: 'org-123',
        name: 'Test Organization'
      },
      active: true
    };

    session = new Session(sessionData);
    mockApiClient = session.apiClient;
  });

  describe('constructor', () => {
    it('should create Session instance with default URI', () => {
      const sessionData: Partial<SessionInterface> = {
        id: '123',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      const session = new Session(sessionData);
      expect(session).toBeDefined();
      expect((session as any).uri).toBe('/session');
    });

    it('should create Session instance with custom URI', () => {
      const sessionData: Partial<SessionInterface> = {
        id: '123',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      const session = new Session(sessionData);
      expect(session).toBeDefined();
      expect((session as any).uri).toBe('/session');
    });

    it('should set session properties from data', () => {
      const sessionData: Partial<SessionInterface> = {
        id: '123',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        },
        org: {
          id: 'org-123',
          name: 'Test Organization'
        }
      };

      const session = new Session(sessionData);
      expect((session as any).user).toBeDefined();
      expect((session as any).user.id).toBe('user-123');
      expect((session as any).user.name).toBe('Test User');
      expect((session as any).user.email).toBe('test@example.com');
      expect((session as any).org).toBeDefined();
      expect((session as any).org.id).toBe('org-123');
      expect((session as any).org.name).toBe('Test Organization');
    });
  });





  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(session.save).toBeDefined();
      expect(typeof session.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(session.delete).toBeDefined();
      expect(typeof session.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(session.update).toBeDefined();
      expect(typeof session.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(session.isActive).toBeDefined();
      expect(typeof session.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(session.toJSON).toBeDefined();
      expect(typeof session.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(session.toAPIPayload).toBeDefined();
      expect(typeof session.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access session data properties', () => {
      expect((session as any).user).toBeDefined();
      expect((session as any).user.id).toBe('user-123');
      expect((session as any).user.name).toBe('Test User');
      expect((session as any).user.email).toBe('test@example.com');
      expect((session as any).org).toBeDefined();
      expect((session as any).org.id).toBe('org-123');
      expect((session as any).org.name).toBe('Test Organization');
      expect((session as any).active).toBe(true);
    });

    it('should return session data via toJSON', () => {
      const jsonData = session.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        },
        org: {
          id: 'org-123',
          name: 'Test Organization'
        },
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = session.toAPIPayload();
      expect(apiPayload).toEqual({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        },
        org: {
          id: 'org-123',
          name: 'Test Organization'
        },
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('session-specific functionality', () => {
    it('should handle session updates', () => {
      const updates = {
        user: {
          id: 'user-456',
          name: 'Updated User',
          email: 'updated@example.com'
        }
      };

      session.update(updates);

      expect((session as any).user).toBeDefined();
      expect((session as any).user.id).toBe('user-456');
      expect((session as any).user.name).toBe('Updated User');
      expect((session as any).user.email).toBe('updated@example.com');
    });

    it('should check if session is active', () => {
      expect(session.isActive()).toBe(true);

      const inactiveSession = new Session({
        id: '456',
        user: {
          id: 'user-456',
          name: 'Inactive User'
        },
        active: false
      });

      expect(inactiveSession.isActive()).toBe(false);
    });
  });
});
