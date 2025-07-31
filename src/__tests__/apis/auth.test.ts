import MosaiaAuth from '../../apis/auth';
import { ConfigurationManager } from '../../config';
import APIClient from '../../apis/api-client';
import { AuthRequest, AuthResponse } from '../../types';

// Mock the ConfigurationManager
jest.mock('../../config', () => ({
  ConfigurationManager: {
    getInstance: jest.fn().mockReturnValue({
      getConfig: jest.fn().mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
      })
    })
  }
}));

// Mock the APIClient
jest.mock('../../apis/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    POST: jest.fn(),
    DELETE: jest.fn(),
    GET: jest.fn(),
    PUT: jest.fn(),
  }));
});

// Mock fetch for OAuth tests
global.fetch = jest.fn();

describe('MosaiaAuth', () => {
  let auth: MosaiaAuth;
  let mockAPIClient: jest.Mocked<APIClient>;
  let mockConfigManager: jest.Mocked<ConfigurationManager>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock instances
    mockAPIClient = {
      POST: jest.fn(),
      DELETE: jest.fn(),
      GET: jest.fn(),
      PUT: jest.fn(),
    } as any;

    mockConfigManager = {
      getConfig: jest.fn(),
      getInstance: jest.fn(),
      reset: jest.fn(),
    } as any;

    // Setup mock returns
    (APIClient as jest.MockedClass<typeof APIClient>).mockImplementation(() => mockAPIClient);
    (ConfigurationManager.getInstance as jest.Mock).mockReturnValue(mockConfigManager);
    mockConfigManager.getConfig.mockReturnValue({
      apiKey: 'test-api-key',
      apiURL: 'https://api.test.com',
      version: '1',
    });

    auth = new MosaiaAuth();
  });

  describe('constructor', () => {
    it('should create MosaiaAuth instance with APIClient and ConfigurationManager', () => {
      expect(auth).toBeInstanceOf(MosaiaAuth);
      expect(APIClient).toHaveBeenCalled();
      expect(ConfigurationManager.getInstance).toHaveBeenCalled();
    });
  });

  describe('signInWithPassword', () => {
    it('should authenticate successfully with email and password', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600
        },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await auth.signInWithPassword('user@test.com', 'password123', 'client-id');

      expect(mockAPIClient.POST).toHaveBeenCalledWith('/auth/signin', {
        grant_type: 'password',
        email: 'user@test.com',
        password: 'password123',
        client_id: 'client-id'
      });

      expect(result).toEqual({
        apiKey: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600,
        authType: 'password',
        apiURL: 'https://api.test.com',
        version: '1',
        exp: undefined,
        iat: undefined,
        sub: undefined
      });
    });

    it('should handle authentication error', async () => {
      const mockResponse = {
        data: null,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
          status: 401
        }
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      await expect(
        auth.signInWithPassword('user@test.com', 'wrongpassword', 'client-id')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockAPIClient.POST.mockRejectedValue(networkError);

      await expect(
        auth.signInWithPassword('user@test.com', 'password123', 'client-id')
      ).rejects.toThrow('Network error');
    });

    it('should handle empty email and password', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600
        },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await auth.signInWithPassword('', '', 'client-id');

      expect(mockAPIClient.POST).toHaveBeenCalledWith('/auth/signin', {
        grant_type: 'password',
        email: '',
        password: '',
        client_id: 'client-id'
      });

      expect(result).toBeDefined();
    });
  });

  describe('signInWithClient', () => {
    it('should authenticate successfully with client credentials', async () => {
      const mockResponse = {
        data: {
          access_token: 'client-access-token',
          refresh_token: 'client-refresh-token',
          token_type: 'Bearer',
          expires_in: 7200
        },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await auth.signInWithClient('client-id', 'client-secret');

      expect(mockAPIClient.POST).toHaveBeenCalledWith('/auth/signin', {
        grant_type: 'client',
        client_id: 'client-id',
        client_secret: 'client-secret'
      });

      expect(result).toEqual({
        apiKey: 'client-access-token',
        refreshToken: 'client-refresh-token',
        expiresIn: 7200,
        authType: 'client',
        apiURL: 'https://api.test.com',
        version: '1',
        exp: undefined,
        iat: undefined,
        sub: undefined
      });
    });

    it('should handle client authentication error', async () => {
      const mockResponse = {
        data: null,
        error: {
          message: 'Invalid client credentials',
          code: 'INVALID_CLIENT',
          status: 401
        }
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      await expect(
        auth.signInWithClient('invalid-client', 'invalid-secret')
      ).rejects.toThrow('Invalid client credentials');
    });

    it('should handle network errors during client authentication', async () => {
      const networkError = new Error('Network error');
      mockAPIClient.POST.mockRejectedValue(networkError);

      await expect(
        auth.signInWithClient('client-id', 'client-secret')
      ).rejects.toThrow('Network error');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600
        },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await auth.refreshToken('old-refresh-token');

      expect(mockAPIClient.POST).toHaveBeenCalledWith('/auth/signin', {
        grant_type: 'refresh',
        refresh_token: 'old-refresh-token'
      });

      expect(result).toEqual({
        apiKey: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        authType: 'refresh',
        apiURL: 'https://api.test.com',
        version: '1',
        exp: undefined,
        iat: undefined,
        sub: undefined
      });
    });

    it('should use current refresh token when no token provided', async () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'test-api-key',
        refreshToken: 'current-refresh-token',
        apiURL: 'https://api.test.com',
        version: '1',
      });

      // Recreate auth instance to pick up the new config
      auth = new MosaiaAuth();

      const mockResponse = {
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600
        },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await auth.refreshToken();

      expect(mockAPIClient.POST).toHaveBeenCalledWith('/auth/signin', {
        grant_type: 'refresh',
        refresh_token: 'current-refresh-token'
      });

      expect(result).toBeDefined();
    });

    it('should handle refresh token error', async () => {
      const mockResponse = {
        data: null,
        error: {
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN',
          status: 401
        }
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      await expect(
        auth.refreshToken('invalid-refresh-token')
      ).rejects.toThrow('Invalid refresh token');
    });

    it('should handle network errors during token refresh', async () => {
      const networkError = new Error('Network error');
      mockAPIClient.POST.mockRejectedValue(networkError);

      await expect(
        auth.refreshToken('refresh-token')
      ).rejects.toThrow('Network error');
    });
  });

  describe('refreshOAuthToken', () => {
    it('should refresh OAuth token successfully', async () => {
      const mockResponse = {
        access_token: 'new-oauth-token',
        refresh_token: 'new-oauth-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
        sub: 'user-123',
        iat: '1640995200',
        exp: '1640998800'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      const result = await auth.refreshOAuthToken('oauth-refresh-token');

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'refresh_token=oauth-refresh-token&grant_type=refresh_token'
      });

      expect(result).toEqual({
        apiKey: 'new-oauth-token',
        refreshToken: 'new-oauth-refresh-token',
        expiresIn: 3600,
        sub: 'user-123',
        iat: '1640995200',
        exp: '1640998800',
        authType: 'oauth',
        apiURL: 'https://api.test.com',
        version: '1'
      });
    });

    it('should handle OAuth refresh error', async () => {
      const mockResponse = {
        error: 'invalid_grant',
        error_description: 'OAuth refresh failed'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      const result = await auth.refreshOAuthToken('invalid-oauth-refresh-token');

      // The implementation doesn't throw errors, it just returns the response
      expect(result).toEqual({
        apiKey: undefined,
        refreshToken: undefined,
        expiresIn: undefined,
        sub: undefined,
        iat: undefined,
        exp: undefined,
        authType: 'oauth',
        apiURL: 'https://api.test.com',
        version: '1'
      });
    });

    it('should handle OAuth error response format', async () => {
      const oauthError = {
        error: 'invalid_grant',
        error_description: 'The refresh token has expired',
        error_uri: 'https://docs.test.com/oauth/errors'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(oauthError)
      });

      const result = await auth.refreshOAuthToken('expired-oauth-refresh-token');

      // The implementation doesn't throw errors, it just returns the response
      expect(result).toEqual({
        apiKey: undefined,
        refreshToken: undefined,
        expiresIn: undefined,
        sub: undefined,
        iat: undefined,
        exp: undefined,
        authType: 'oauth',
        apiURL: 'https://api.test.com',
        version: '1'
      });
    });

    it('should handle network errors during OAuth refresh', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        auth.refreshOAuthToken('oauth-refresh-token')
      ).rejects.toThrow('Network error');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully with provided API key', async () => {
      const mockResponse = {
        data: { success: true },
        error: null
      };

      mockAPIClient.DELETE.mockResolvedValue(mockResponse);

      await auth.signOut('api-key-to-signout');

      expect(mockAPIClient.DELETE).toHaveBeenCalledWith('/auth/signout', {
        token: 'api-key-to-signout'
      });
    });

    it('should use current API key when no key provided', async () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'current-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
      });

      // Recreate auth instance to pick up the new config
      auth = new MosaiaAuth();

      const mockResponse = {
        data: { success: true },
        error: null
      };

      mockAPIClient.DELETE.mockResolvedValue(mockResponse);

      await auth.signOut();

      expect(mockAPIClient.DELETE).toHaveBeenCalledWith('/auth/signout', {
        token: 'current-api-key'
      });
    });

    it('should handle sign out error', async () => {
      const mockResponse = {
        data: null,
        error: {
          message: 'Sign out failed',
          code: 'SIGNOUT_ERROR',
          status: 500
        }
      };

      mockAPIClient.DELETE.mockResolvedValue(mockResponse);

      // The implementation doesn't throw errors, it just resets the config
      await auth.signOut('api-key');
      
      expect(mockAPIClient.DELETE).toHaveBeenCalledWith('/auth/signout', {
        token: 'api-key'
      });
      expect(mockConfigManager.reset).toHaveBeenCalled();
    });

    it('should handle network errors during sign out', async () => {
      const networkError = new Error('Network error');
      mockAPIClient.DELETE.mockRejectedValue(networkError);

      await expect(
        auth.signOut('api-key')
      ).rejects.toThrow('Network error');
    });
  });

  describe('refresh', () => {
    it('should refresh using current configuration', async () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'current-api-key',
        refreshToken: 'current-refresh-token',
        authType: 'password',
        apiURL: 'https://api.test.com',
        version: '1',
      });

      // Recreate auth instance to pick up the new config
      auth = new MosaiaAuth();

      const mockResponse = {
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600
        },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await auth.refresh();

      expect(mockAPIClient.POST).toHaveBeenCalledWith('/auth/signin', {
        grant_type: 'refresh',
        refresh_token: 'current-refresh-token'
      });

      expect(result).toEqual({
        apiKey: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        authType: 'refresh',
        apiURL: 'https://api.test.com',
        version: '1',
        exp: undefined,
        iat: undefined,
        sub: undefined
      });
    });

    it('should handle refresh without refresh token', async () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'current-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
      });

      await expect(auth.refresh()).rejects.toThrow('No refresh token found in config');
    });
  });

  describe('edge cases', () => {
    it('should handle empty response data', async () => {
      const mockResponse = {
        data: null,
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      await expect(
        auth.signInWithPassword('user@test.com', 'password123', 'client-id')
      ).rejects.toThrow('Cannot read properties of null (reading \'access_token\')');
    });

    it('should handle missing access token in response', async () => {
      const mockResponse = {
        data: {
          refresh_token: 'test-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600
        },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await auth.signInWithPassword('user@test.com', 'password123', 'client-id');

      // The implementation doesn't validate access_token, it just returns undefined
      expect(result).toEqual({
        apiKey: undefined,
        refreshToken: 'test-refresh-token',
        expiresIn: 3600,
        authType: 'password',
        apiURL: 'https://api.test.com',
        version: '1',
        exp: undefined,
        iat: undefined,
        sub: undefined
      });
    });

    it('should handle special characters in credentials', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600
        },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      await auth.signInWithPassword('user+test@example.com', 'password@123!', 'client-id-with-special-chars');

      expect(mockAPIClient.POST).toHaveBeenCalledWith('/auth/signin', {
        grant_type: 'password',
        email: 'user+test@example.com',
        password: 'password@123!',
        client_id: 'client-id-with-special-chars'
      });
    });

    it('should handle very long tokens', async () => {
      const longToken = 'a'.repeat(1000);
      const mockResponse = {
        data: {
          access_token: longToken,
          refresh_token: longToken,
          token_type: 'Bearer',
          expires_in: 3600
        },
        error: null
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await auth.signInWithPassword('user@test.com', 'password123', 'client-id');

      expect(result.apiKey).toBe(longToken);
      expect(result.refreshToken).toBe(longToken);
    });
  });

  describe('error handling', () => {
    it('should handle unknown error types', async () => {
      const mockResponse = {
        data: null,
        error: {
          message: 'Unknown error occurred',
          code: 'UNKNOWN_ERROR',
          status: 500
        }
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      await expect(
        auth.signInWithPassword('user@test.com', 'password123', 'client-id')
      ).rejects.toThrow('Unknown error occurred');
    });

    it('should handle error without message', async () => {
      const mockResponse = {
        data: null,
        error: {
          code: 'ERROR_WITHOUT_MESSAGE',
          status: 400
        }
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      await expect(
        auth.signInWithPassword('user@test.com', 'password123', 'client-id')
      ).rejects.toThrow('Unknown error');
    });
  });
}); 