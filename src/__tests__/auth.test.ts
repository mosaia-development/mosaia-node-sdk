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
}); 