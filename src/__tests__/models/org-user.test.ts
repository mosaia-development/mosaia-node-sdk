import { OrgUser } from '../../models';
import { OrgUserInterface, MosaiaConfig, AuthResponse, UserInterface, OrganizationInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/org';
    this.apiClient = {
      GET: jest.fn(),
      DELETE: jest.fn()
    };
    this.config = {
      apiKey: 'test-api-key',
      apiURL: 'https://api.mosaia.ai',
      version: '1'
    };
    this.update = jest.fn();
    this.getUri = jest.fn().mockReturnValue('/org/123');
  })
}));

// Mock the User model
jest.mock('../../models/user', () => {
  return jest.fn().mockImplementation((data: any) => ({
    data,
    name: data.name || 'Test User',
    email: data.email || 'test@example.com'
  }));
});

// Mock the Organization model
jest.mock('../../models/organization', () => {
  return jest.fn().mockImplementation((data: any) => ({
    data,
    name: data.name || 'Test Organization',
    short_description: data.short_description || 'Test Description'
  }));
});

describe('OrgUser Model', () => {
  let orgUser: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const orgUserData: Partial<OrgUserInterface> = {
      id: '123',
      org: 'org-123',
      user: 'user-123',
      permission: 'admin',
      active: true
    };

    orgUser = new OrgUser(orgUserData);
    mockApiClient = orgUser.apiClient;
  });

  describe('constructor', () => {
    it('should create OrgUser instance with default URI', () => {
      const orgUserData: Partial<OrgUserInterface> = {
        id: '123',
        org: 'org-123',
        user: 'user-123',
        permission: 'admin'
      };

      const orgUser = new OrgUser(orgUserData);
      expect(orgUser).toBeDefined();
      expect((orgUser as any).uri).toBe('/org');
    });

    it('should create OrgUser instance with custom URI', () => {
      const orgUserData: Partial<OrgUserInterface> = {
        id: '123',
        org: 'org-123',
        user: 'user-123',
        permission: 'admin'
      };

      const orgUser = new OrgUser(orgUserData, '/custom/uri');
      expect(orgUser).toBeDefined();
      expect((orgUser as any).uri).toBe('/custom/uri');
    });
  });

  describe('user getter', () => {
    it('should return User instance when user data is available', () => {
      const userData: UserInterface = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      orgUser.data.user = userData;
      const user = orgUser.user;

      expect(user).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should throw error when user data is not available', () => {
      orgUser.data.user = undefined;

      expect(() => orgUser.user).toThrow('User data not available');
    });
  });

  describe('user setter', () => {
    it('should update user data', () => {
      const newUserData = {
        id: 'user-456',
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      orgUser.user = newUserData;

      expect(orgUser.update).toHaveBeenCalledWith({ user: newUserData });
    });
  });

  describe('org getter', () => {
    it('should return Organization instance when org data is available', () => {
      const orgData: OrganizationInterface = {
        id: 'org-123',
        name: 'Test Organization',
        short_description: 'Test Description'
      };

      orgUser.data.org = orgData;
      const org = orgUser.org;

      expect(org).toBeDefined();
      expect(org.name).toBe('Test Organization');
      expect(org.short_description).toBe('Test Description');
    });

    it('should throw error when org data is not available', () => {
      orgUser.data.org = undefined;

      expect(() => orgUser.org).toThrow('Organization data not available');
    });
  });

  describe('org setter', () => {
    it('should update org data', () => {
      const newOrgData = {
        id: 'org-456',
        name: 'New Organization',
        short_description: 'New Description'
      };

      orgUser.org = newOrgData;

      expect(orgUser.update).toHaveBeenCalledWith({ org: newOrgData });
    });
  });

  describe('session method', () => {
    it('should return MosaiaConfig when session is successful', async () => {
      const mockAuthResponse: AuthResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600
      };

      mockApiClient.GET.mockResolvedValue({
        data: mockAuthResponse,
        error: null
      });

      const result = await orgUser.session();

      expect(mockApiClient.GET).toHaveBeenCalledWith('/org/session');
      expect(result).toEqual({
        apiKey: 'new-access-token',
        apiURL: 'https://api.mosaia.ai',
        version: '1',
        session: mockAuthResponse
      });
    });

    it('should throw error when API returns error', async () => {
      mockApiClient.GET.mockResolvedValue({
        data: null,
        error: { message: 'Session not found' }
      });

      await expect(orgUser.session()).rejects.toThrow('Session not found');
    });

    it('should throw error when API call fails', async () => {
      const networkError = new Error('Network error');
      mockApiClient.GET.mockRejectedValue(networkError);

      await expect(orgUser.session()).rejects.toThrow('Network error');
    });

    it('should throw generic error when unknown error occurs', async () => {
      mockApiClient.GET.mockRejectedValue('Unknown error type');

      await expect(orgUser.session()).rejects.toThrow('Unknown error occurred');
    });
  });

  describe('disable method', () => {
    it('should successfully disable org user relationship', async () => {
      mockApiClient.DELETE.mockResolvedValue({
        error: null
      });

      await orgUser.disable();

      expect(mockApiClient.DELETE).toHaveBeenCalledWith('/org/123');
    });

    it('should throw error when API returns error', async () => {
      mockApiClient.DELETE.mockResolvedValue({
        error: { message: 'Failed to disable relationship' }
      });

      await expect(orgUser.disable()).rejects.toThrow('Failed to disable relationship');
    });

    it('should throw error when API call fails', async () => {
      const networkError = new Error('Network error');
      mockApiClient.DELETE.mockRejectedValue(networkError);

      await expect(orgUser.disable()).rejects.toThrow('Network error');
    });

    it('should throw generic error when unknown error occurs', async () => {
      mockApiClient.DELETE.mockRejectedValue('Unknown error type');

      await expect(orgUser.disable()).rejects.toThrow('Unknown error occurred');
    });
  });

  describe('edge cases', () => {
    it('should handle session with minimal auth response', async () => {
      const minimalAuthResponse: AuthResponse = {
        access_token: 'minimal-token',
        token_type: 'Bearer',
        expires_in: 3600
      };

      mockApiClient.GET.mockResolvedValue({
        data: minimalAuthResponse,
        error: null
      });

      const result = await orgUser.session();

      expect(result.apiKey).toBe('minimal-token');
      expect(result.session).toEqual(minimalAuthResponse);
    });

    it('should handle session with full auth response', async () => {
      const fullAuthResponse: AuthResponse = {
        access_token: 'full-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 3600
      };

      mockApiClient.GET.mockResolvedValue({
        data: fullAuthResponse,
        error: null
      });

      const result = await orgUser.session();

      expect(result.apiKey).toBe('full-token');
      expect(result.session).toEqual(fullAuthResponse);
    });

    it('should handle user data with missing fields', () => {
      const minimalUserData: UserInterface = {
        id: 'user-123'
        // Missing name and email
      };

      orgUser.data.user = minimalUserData;
      const user = orgUser.user;

      expect(user).toBeDefined();
      expect(user.name).toBe('Test User'); // Default from mock
      expect(user.email).toBe('test@example.com'); // Default from mock
    });

    it('should handle org data with missing fields', () => {
      const minimalOrgData: Partial<OrganizationInterface> = {
        id: 'org-123'
        // Missing name and description
      };

      orgUser.data.org = minimalOrgData;
      const org = orgUser.org;

      expect(org).toBeDefined();
      expect(org.name).toBe('Test Organization'); // Default from mock
      expect(org.short_description).toBe('Test Description'); // Default from mock
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete org user workflow', async () => {
      // Step 1: Get user and org data
      const userData: UserInterface = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      const orgData: OrganizationInterface = {
        id: 'org-123',
        name: 'Test Organization',
        short_description: 'Test Description'
      };

      orgUser.data.user = userData;
      orgUser.data.org = orgData;

      const user = orgUser.user;
      const org = orgUser.org;

      expect(user.name).toBe('John Doe');
      expect(org.name).toBe('Test Organization');

      // Step 2: Get session
      const mockAuthResponse: AuthResponse = {
        access_token: 'session-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 3600
      };

      mockApiClient.GET.mockResolvedValue({
        data: mockAuthResponse,
        error: null
      });

      const sessionConfig = await orgUser.session();

      expect(sessionConfig.apiKey).toBe('session-token');
      expect(sessionConfig.session).toEqual(mockAuthResponse);

      // Step 3: Disable relationship
      mockApiClient.DELETE.mockResolvedValue({
        error: null
      });

      await orgUser.disable();

      expect(mockApiClient.DELETE).toHaveBeenCalledWith('/org/123');
    });

    it('should handle session and disable with error scenarios', async () => {
      // Session fails
      mockApiClient.GET.mockResolvedValue({
        data: null,
        error: { message: 'Session expired' }
      });

      await expect(orgUser.session()).rejects.toThrow('Session expired');

      // Disable fails
      mockApiClient.DELETE.mockResolvedValue({
        error: { message: 'Cannot disable active relationship' }
      });

      await expect(orgUser.disable()).rejects.toThrow('Cannot disable active relationship');
    });
  });
}); 