import { OAuth } from '../oauth';
import { OAuthConfig, OAuthErrorResponse, MosaiaConfig } from '../types';
import { ConfigurationManager } from '../config';

// Mock fetch globally
global.fetch = jest.fn();

// Helper function to create mock Response objects
const createMockResponse = (data: any, ok: boolean = true): Response => ({
  ok,
  json: async () => data,
  headers: new Headers(),
  redirected: false,
  status: ok ? 200 : 400,
  statusText: ok ? 'OK' : 'Bad Request',
  type: 'default',
  url: 'https://api.mosaia.ai/auth/token',
  body: null,
  bodyUsed: false,
  clone: jest.fn(),
  arrayBuffer: jest.fn(),
  blob: jest.fn(),
  formData: jest.fn(),
  text: jest.fn(),
  bytes: jest.fn()
} as Response);

describe('OAuth', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>;
  let oauth: OAuth;
  let validConfig: OAuthConfig;
  let configManager: ConfigurationManager;

  beforeEach(() => {
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();

    // Initialize ConfigurationManager with default config
    configManager = ConfigurationManager.getInstance();
    configManager.initialize({
      clientId: 'test-client-id',
      apiURL: 'https://api.mosaia.ai',
      version: '1'
    });

    validConfig = {
      clientId: 'test-client-id',
      redirectUri: 'https://test-app.com/callback',
      appURL: 'https://mosaia.ai',
      apiURL: 'https://api.mosaia.ai',
      apiVersion: '1',
      scopes: ['read', 'write'],
      state: 'test-state'
    };

    oauth = new OAuth(validConfig);
  });

  afterEach(() => {
    configManager.reset();
  });

  describe('constructor', () => {
    it('should create OAuth instance with valid config', () => {
      expect(oauth).toBeInstanceOf(OAuth);
    });

    it('should accept config without optional parameters', () => {
      const minimalConfig: OAuthConfig = {
        clientId: 'test-client-id',
        redirectUri: 'https://test-app.com/callback',
        appURL: 'https://mosaia.ai',
        apiURL: 'https://api.mosaia.ai',
        apiVersion: '1',
        scopes: ['read', 'write']
      };

      const oauthInstance = new OAuth(minimalConfig);
      expect(oauthInstance).toBeInstanceOf(OAuth);
    });
  });

  describe('getAuthorizationUrlAndCodeVerifier', () => {
    it('should generate authorization URL with all required parameters', () => {
      const result = oauth.getAuthorizationUrlAndCodeVerifier();

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('codeVerifier');
      expect(typeof result.codeVerifier).toBe('string');
      expect(result.codeVerifier.length).toBeGreaterThan(0);

      const url = new URL(result.url);
      expect(url.origin).toBe('https://mosaia.ai');
      expect(url.pathname).toBe('/oauth');

      const params = new URLSearchParams(url.search);
      expect(params.get('client_id')).toBe('test-client-id');
      expect(params.get('redirect_uri')).toBe('https://test-app.com/callback');
      expect(params.get('response_type')).toBe('code');
      expect(params.get('code_challenge')).toBeTruthy();
      expect(params.get('code_challenge_method')).toBe('S256');
      expect(params.get('scope')).toBe('read,write');
      expect(params.get('state')).toBe('test-state');
    });

    it('should generate authorization URL without optional parameters', () => {
      const minimalConfig: OAuthConfig = {
        clientId: 'test-client-id',
        redirectUri: 'https://test-app.com/callback',
        appURL: 'https://mosaia.ai',
        apiURL: 'https://api.mosaia.ai',
        apiVersion: '1',
        scopes: ['read', 'write']
      };

      const oauthInstance = new OAuth(minimalConfig);
      const result = oauthInstance.getAuthorizationUrlAndCodeVerifier();

      const url = new URL(result.url);
      const params = new URLSearchParams(url.search);

      expect(params.get('scope')).toBe('read,write');
      expect(params.get('state')).toBeNull();
      expect(params.get('client_id')).toBe('test-client-id');
      expect(params.get('redirect_uri')).toBe('https://test-app.com/callback');
    });

    it('should generate different code verifiers on each call', () => {
      const result1 = oauth.getAuthorizationUrlAndCodeVerifier();
      const result2 = oauth.getAuthorizationUrlAndCodeVerifier();

      expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
    });

    it('should generate valid PKCE code verifier format', () => {
      const result = oauth.getAuthorizationUrlAndCodeVerifier();
      
      // Code verifier should be base64url encoded (no padding, no special chars)
      expect(result.codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(result.codeVerifier.length).toBeLessThanOrEqual(128);
      expect(result.codeVerifier.length).toBeGreaterThan(30); // Minimum reasonable length for 32 bytes
    });

    it('should handle special characters in URLs correctly', () => {
      const configWithSpecialChars: OAuthConfig = {
        ...validConfig,
        redirectUri: 'https://test-app.com/callback?param=value&other=123',
        appURL: 'https://mosaia.ai/path/with/special/chars'
      };

      const oauthInstance = new OAuth(configWithSpecialChars);
      const result = oauthInstance.getAuthorizationUrlAndCodeVerifier();

      const url = new URL(result.url);
      const params = new URLSearchParams(url.search);
      
      expect(params.get('redirect_uri')).toBe('https://test-app.com/callback?param=value&other=123');
    });
  });

  describe('authenticateWithCodeAndVerifier', () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
      sub: 'user-123',
      iat: '1640995200',
      exp: '1640998800'
    };

    it('should successfully exchange code for token', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTokenResponse));

      const code = 'test-authorization-code';
      const codeVerifier = 'test-code-verifier';

      const result = await oauth.authenticateWithCodeAndVerifier(code, codeVerifier);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.mosaia.ai/v1/auth/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.stringContaining('client_id=test-client-id')
        }
      );

      expect(result).toEqual({
        ...validConfig,
        apiKey: 'mock-access-token',
        session: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          authType: 'oauth',
          sub: 'user-123',
          iat: '1640995200',
          exp: '1640998800'
        }
      });
    });

    it('should include correct request body parameters', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTokenResponse));

      const code = 'test-authorization-code';
      const codeVerifier = 'test-code-verifier';

      await oauth.authenticateWithCodeAndVerifier(code, codeVerifier);

      const call = mockFetch.mock.calls[0];
      const body = call[1]?.body as string;
      const params = new URLSearchParams(body);

      expect(params.get('client_id')).toBe('test-client-id');
      expect(params.get('redirect_uri')).toBe('https://test-app.com/callback');
      expect(params.get('code')).toBe('test-authorization-code');
      expect(params.get('code_verifier')).toBe('test-code-verifier');
      expect(params.get('grant_type')).toBe('authorization_code');
    });

    it('should handle OAuth error responses', async () => {
      const errorResponse: OAuthErrorResponse = {
        error: 'invalid_grant',
        error_description: 'The authorization code has expired',
        error_uri: 'https://docs.mosaia.ai/oauth/errors'
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(errorResponse, false));

      const code = 'expired-code';
      const codeVerifier = 'test-code-verifier';

      await expect(
        oauth.authenticateWithCodeAndVerifier(code, codeVerifier)
      ).rejects.toEqual(errorResponse);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      const code = 'test-code';
      const codeVerifier = 'test-verifier';

      await expect(
        oauth.authenticateWithCodeAndVerifier(code, codeVerifier)
      ).rejects.toEqual(networkError);
    });

    it('should handle malformed JSON responses', async () => {
      const mockResponse = createMockResponse({});
      mockResponse.json = async () => {
        throw new Error('Invalid JSON');
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const code = 'test-code';
      const codeVerifier = 'test-verifier';

      await expect(
        oauth.authenticateWithCodeAndVerifier(code, codeVerifier)
      ).rejects.toThrow('Invalid JSON');
    });

    it('should handle missing refresh token in response', async () => {
      const responseWithoutRefreshToken = {
        ...mockTokenResponse,
        refresh_token: undefined
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(responseWithoutRefreshToken));

      const code = 'test-code';
      const codeVerifier = 'test-verifier';

      const result = await oauth.authenticateWithCodeAndVerifier(code, codeVerifier);

      expect(result.session?.refreshToken).toBeUndefined();
      expect(result.apiKey).toBe('mock-access-token');
    });

    it('should handle empty or null response values', async () => {
      const responseWithNulls = {
        access_token: 'mock-access-token',
        refresh_token: null,
        token_type: 'Bearer',
        expires_in: null,
        sub: '',
        iat: null,
        exp: null
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(responseWithNulls));

      const code = 'test-code';
      const codeVerifier = 'test-verifier';

      const result = await oauth.authenticateWithCodeAndVerifier(code, codeVerifier);

      expect(result.session?.refreshToken).toBeNull();
      expect(result.session?.sub).toBe('');
      expect(result.session?.iat).toBeNull();
      expect(result.session?.exp).toBeNull();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty code and code verifier', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({
        access_token: 'mock-token',
        token_type: 'Bearer',
        expires_in: 3600,
        sub: 'user-123',
        iat: '1640995200',
        exp: '1640998800'
      }));

      const result = await oauth.authenticateWithCodeAndVerifier('', '');

      expect(result.apiKey).toBe('mock-token');
    });

    it('should handle special characters in code and code verifier', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({
        access_token: 'mock-token',
        token_type: 'Bearer',
        expires_in: 3600,
        sub: 'user-123',
        iat: '1640995200',
        exp: '1640998800'
      }));

      const code = 'code+with/special=chars&and?query';
      const codeVerifier = 'verifier+with/special=chars&and?query';

      await oauth.authenticateWithCodeAndVerifier(code, codeVerifier);

      const call = mockFetch.mock.calls[0];
      const body = call[1]?.body as string;
      const params = new URLSearchParams(body);

      expect(params.get('code')).toBe(code);
      expect(params.get('code_verifier')).toBe(codeVerifier);
    });

    it('should handle very long code verifiers', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({
        access_token: 'mock-token',
        token_type: 'Bearer',
        expires_in: 3600,
        sub: 'user-123',
        iat: '1640995200',
        exp: '1640998800'
      }));

      const longCodeVerifier = 'a'.repeat(128);
      const code = 'test-code';

      await oauth.authenticateWithCodeAndVerifier(code, longCodeVerifier);

      const call = mockFetch.mock.calls[0];
      const body = call[1]?.body as string;
      const params = new URLSearchParams(body);

      expect(params.get('code_verifier')).toBe(longCodeVerifier);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete OAuth flow simulation', async () => {
      // Step 1: Generate authorization URL
      const authResult = oauth.getAuthorizationUrlAndCodeVerifier();
      expect(authResult.url).toContain('https://mosaia.ai/oauth');
      expect(authResult.codeVerifier).toBeTruthy();

      // Step 2: Simulate token exchange
      mockFetch.mockResolvedValueOnce(createMockResponse({
        access_token: 'final-access-token',
        refresh_token: 'final-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
        sub: 'final-user-id',
        iat: '1640995200',
        exp: '1640998800'
      }));

      const tokenResult = await oauth.authenticateWithCodeAndVerifier(
        'simulated-auth-code',
        authResult.codeVerifier
      );

      expect(tokenResult.apiKey).toBe('final-access-token');
      expect(tokenResult.session?.refreshToken).toBe('final-refresh-token');
      expect(tokenResult.session?.authType).toBe('oauth');
    });

    it('should handle OAuth flow with different scopes', () => {
      const configWithCustomScopes: OAuthConfig = {
        ...validConfig,
        scopes: ['admin', 'read:users', 'write:users']
      };

      const oauthInstance = new OAuth(configWithCustomScopes);
      const result = oauthInstance.getAuthorizationUrlAndCodeVerifier();

      const url = new URL(result.url);
      const params = new URLSearchParams(url.search);

      expect(params.get('scope')).toBe('admin,read:users,write:users');
    });

    it('should handle OAuth flow with custom state', () => {
      const configWithCustomState: OAuthConfig = {
        ...validConfig,
        state: 'custom-state-value-123'
      };

      const oauthInstance = new OAuth(configWithCustomState);
      const result = oauthInstance.getAuthorizationUrlAndCodeVerifier();

      const url = new URL(result.url);
      const params = new URLSearchParams(url.search);

      expect(params.get('state')).toBe('custom-state-value-123');
    });
  });

  describe('security considerations', () => {
    it('should generate cryptographically secure code verifiers', () => {
      const results = [];
      
      // Generate multiple code verifiers to check for randomness
      for (let i = 0; i < 10; i++) {
        const result = oauth.getAuthorizationUrlAndCodeVerifier();
        results.push(result.codeVerifier);
      }

      // All code verifiers should be different
      const uniqueVerifiers = new Set(results);
      expect(uniqueVerifiers.size).toBe(10);
    });

    it('should properly encode PKCE parameters', () => {
      const result = oauth.getAuthorizationUrlAndCodeVerifier();
      
      const url = new URL(result.url);
      const params = new URLSearchParams(url.search);

      // Code challenge should be base64url encoded
      const codeChallenge = params.get('code_challenge');
      expect(codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(codeChallenge).not.toContain('+');
      expect(codeChallenge).not.toContain('/');
      expect(codeChallenge).not.toContain('=');
    });
  });
}); 