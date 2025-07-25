import Auth from '../apis/auth';
import { MosiaConfig, AuthRequest, AuthResponse } from '../types';

// Mock the APIClient
jest.mock('../apis/api-client');

describe('Auth API', () => {
  let auth: Auth;
  const mockConfig: MosiaConfig = {
    apiKey: 'test-api-key',
    apiURL: 'https://api.test.com/v1',
    version: '1'
  };

  beforeEach(() => {
    auth = new Auth(mockConfig);
  });

  describe('Constructor', () => {
    it('should create an Auth instance', () => {
      expect(auth).toBeInstanceOf(Auth);
    });
  });

  describe('signInWithPassword', () => {
    it('should call POST with password auth request', async () => {
      const mockResponse: AuthResponse = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 3600
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 })
      };

      (auth as any).client = mockClient;

      const result = await auth.signInWithPassword('test@example.com', 'password', 'client-id');

      const expectedRequest: AuthRequest = {
        grant_type: 'password',
        email: 'test@example.com',
        password: 'password',
        client_id: 'client-id'
      };

      expect(mockClient.POST).toHaveBeenCalledWith('/auth/signin', expectedRequest);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('signInWithClient', () => {
    it('should call POST with client auth request', async () => {
      const mockResponse: AuthResponse = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 3600
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 })
      };

      (auth as any).client = mockClient;

      const result = await auth.signInWithClient('client-id', 'client-secret');

      const expectedRequest: AuthRequest = {
        grant_type: 'client',
        client_id: 'client-id',
        client_secret: 'client-secret'
      };

      expect(mockClient.POST).toHaveBeenCalledWith('/auth/signin', expectedRequest);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('should call POST with refresh token request', async () => {
      const mockResponse: AuthResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 })
      };

      (auth as any).client = mockClient;

      const result = await auth.refreshToken('refresh-token');

      const expectedRequest: AuthRequest = {
        grant_type: 'refresh',
        refresh_token: 'refresh-token'
      };

      expect(mockClient.POST).toHaveBeenCalledWith('/auth/signin', expectedRequest);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('signOut', () => {
    it('should call DELETE without token', async () => {
      const mockResponse = {
        data: null,
        status: 204
      };

      const mockClient = {
        DELETE: jest.fn().mockResolvedValue(mockResponse)
      };

      (auth as any).client = mockClient;

      const result = await auth.signOut();

      expect(mockClient.DELETE).toHaveBeenCalledWith('/auth/signout');
      expect(result).toEqual(mockResponse);
    });

    it('should call DELETE with token parameter', async () => {
      const mockResponse = {
        data: null,
        status: 204
      };

      const mockClient = {
        DELETE: jest.fn().mockResolvedValue(mockResponse)
      };

      (auth as any).client = mockClient;

      const result = await auth.signOut('token-to-delete');

      expect(mockClient.DELETE).toHaveBeenCalledWith('/auth/signout', { token: 'token-to-delete' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSession', () => {
    it('should call GET for session info', async () => {
      const mockResponse = {
        data: {
          data: { user: 'user-id', org: 'org-id' }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (auth as any).client = mockClient;

      const result = await auth.getSession();

      expect(mockClient.GET).toHaveBeenCalledWith('/session');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSelf', () => {
    it('should call GET for self info', async () => {
      const mockResponse = {
        data: {
          data: { user: 'user-info', org: 'org-info' }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (auth as any).client = mockClient;

      const result = await auth.getSelf();

      expect(mockClient.GET).toHaveBeenCalledWith('/self');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Authentication Flow with apiKey Assignment', () => {
    let mosaia: any;

    beforeEach(() => {
      // Mock the main Mosaia class
      mosaia = {
        config: {
          apiKey: 'initial-key',
          apiURL: 'https://api.test.com/v1',
          version: '1'
        },
        set apiKey(value: string) {
          this.config.apiKey = value;
        }
      };
    });

    describe('Password Authentication Flow', () => {
      it('should assign access token to apiKey after successful password authentication', async () => {
        const mockResponse: AuthResponse = {
          access_token: 'new-access-token-123',
          refresh_token: 'refresh-token-456',
          token_type: 'Bearer',
          expires_in: 3600
        };

        const mockClient = {
          POST: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 })
        };

        (auth as any).client = mockClient;

        // Perform authentication
        const result = await auth.signInWithPassword('test@example.com', 'password', 'client-id');

        // Simulate assigning the access token to the SDK
        mosaia.apiKey = result.data.access_token;

        // Verify the token was assigned correctly
        expect(mosaia.config.apiKey).toBe('new-access-token-123');
        expect(result.data.access_token).toBe('new-access-token-123');
      });

      it('should handle multiple password authentication attempts with different tokens', async () => {
        const firstResponse: AuthResponse = {
          access_token: 'first-token',
          refresh_token: 'first-refresh',
          token_type: 'Bearer',
          expires_in: 3600
        };

        const secondResponse: AuthResponse = {
          access_token: 'second-token',
          refresh_token: 'second-refresh',
          token_type: 'Bearer',
          expires_in: 3600
        };

        const mockClient = {
          POST: jest.fn()
            .mockResolvedValueOnce({ data: firstResponse, status: 201 })
            .mockResolvedValueOnce({ data: secondResponse, status: 201 })
        };

        (auth as any).client = mockClient;

        // First authentication
        const firstResult = await auth.signInWithPassword('user1@example.com', 'password1', 'client-id');
        mosaia.apiKey = firstResult.data.access_token;
        expect(mosaia.config.apiKey).toBe('first-token');

        // Second authentication
        const secondResult = await auth.signInWithPassword('user2@example.com', 'password2', 'client-id');
        mosaia.apiKey = secondResult.data.access_token;
        expect(mosaia.config.apiKey).toBe('second-token');
      });
    });

    describe('Client Credentials Authentication Flow', () => {
      it('should assign access token to apiKey after successful client authentication', async () => {
        const mockResponse: AuthResponse = {
          access_token: 'client-access-token-789',
          refresh_token: 'client-refresh-token-012',
          token_type: 'Bearer',
          expires_in: 3600
        };

        const mockClient = {
          POST: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 })
        };

        (auth as any).client = mockClient;

        // Perform client authentication
        const result = await auth.signInWithClient('client-id', 'client-secret');

        // Simulate assigning the access token to the SDK
        mosaia.apiKey = result.data.access_token;

        // Verify the token was assigned correctly
        expect(mosaia.config.apiKey).toBe('client-access-token-789');
        expect(result.data.access_token).toBe('client-access-token-789');
      });
    });

    describe('Token Refresh Flow', () => {
      it('should assign new access token to apiKey after successful token refresh', async () => {
        const mockResponse: AuthResponse = {
          access_token: 'refreshed-access-token-345',
          refresh_token: 'new-refresh-token-678',
          token_type: 'Bearer',
          expires_in: 3600
        };

        const mockClient = {
          POST: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 })
        };

        (auth as any).client = mockClient;

        // Set initial token
        mosaia.apiKey = 'old-access-token';
        expect(mosaia.config.apiKey).toBe('old-access-token');

        // Perform token refresh
        const result = await auth.refreshToken('old-refresh-token');

        // Update the SDK with the new access token
        mosaia.apiKey = result.data.access_token;

        // Verify the token was updated correctly
        expect(mosaia.config.apiKey).toBe('refreshed-access-token-345');
        expect(result.data.access_token).toBe('refreshed-access-token-345');
      });

      it('should handle token refresh with different token types', async () => {
        const mockResponse: AuthResponse = {
          access_token: 'new-token-with-special-chars!@#$%^&*()',
          refresh_token: 'new-refresh-with-special-chars!@#$%^&*()',
          token_type: 'Bearer',
          expires_in: 7200
        };

        const mockClient = {
          POST: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 })
        };

        (auth as any).client = mockClient;

        // Perform token refresh
        const result = await auth.refreshToken('old-refresh-token');

        // Update the SDK with the new access token
        mosaia.apiKey = result.data.access_token;

        // Verify the token was assigned correctly, including special characters
        expect(mosaia.config.apiKey).toBe('new-token-with-special-chars!@#$%^&*()');
        expect(result.data.access_token).toBe('new-token-with-special-chars!@#$%^&*()');
      });
    });

    describe('Error Handling in Authentication Flow', () => {
      it('should not update apiKey when authentication fails', async () => {
        const mockClient = {
          POST: jest.fn().mockRejectedValue(new Error('Authentication failed'))
        };

        (auth as any).client = mockClient;

        // Set initial token
        mosaia.apiKey = 'initial-token';
        expect(mosaia.config.apiKey).toBe('initial-token');

        // Attempt authentication (should fail)
        try {
          await auth.signInWithPassword('invalid@example.com', 'wrong-password', 'client-id');
        } catch (error) {
          // Authentication failed as expected
        }

        // Verify the token was not changed
        expect(mosaia.config.apiKey).toBe('initial-token');
      });

      it('should handle empty access token gracefully', async () => {
        const mockResponse: AuthResponse = {
          access_token: '',
          refresh_token: 'refresh-token',
          token_type: 'Bearer',
          expires_in: 3600
        };

        const mockClient = {
          POST: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 })
        };

        (auth as any).client = mockClient;

        // Perform authentication
        const result = await auth.signInWithPassword('test@example.com', 'password', 'client-id');

        // Assign empty token to SDK
        mosaia.apiKey = result.data.access_token;

        // Verify empty token is handled correctly
        expect(mosaia.config.apiKey).toBe('');
        expect(result.data.access_token).toBe('');
      });
    });
  });
}); 