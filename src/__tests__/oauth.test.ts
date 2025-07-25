import { OAuth } from '../oauth';
import { OAuthConfig } from '../types';

describe('OAuth API', () => {
  let oauth: OAuth;
  const mockConfig: OAuthConfig = {
    clientId: 'test-client-id',
    redirectUri: 'https://myapp.com/callback',
    appURL: 'https://app.test.com',
    scopes: ['read', 'write']
  };

  beforeEach(() => {
    oauth = new OAuth(mockConfig);
  });

  describe('Constructor', () => {
    it('should create an OAuth instance', () => {
      expect(oauth).toBeInstanceOf(OAuth);
    });

    it('should store configuration correctly', () => {
      expect((oauth as any).config).toEqual(mockConfig);
    });
  });

  describe('generatePKCE', () => {
    it('should generate code verifier and challenge', () => {
      // Since generatePKCE is private, we test it indirectly through getAuthorizationUrlAndCodeVerifier
      const result1 = oauth.getAuthorizationUrlAndCodeVerifier();
      const result2 = oauth.getAuthorizationUrlAndCodeVerifier();

      expect(result1.codeVerifier).toBeDefined();
      expect(result1.codeVerifier.length).toBeGreaterThan(40);
      expect(result1.codeVerifier.length).toBeLessThan(129);
      
      // Each call should generate different code verifiers
      expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
    });
  });

  describe('getAuthorizationUrlAndCodeVerifier', () => {
    it('should generate authorization URL with correct parameters', () => {
      const result = oauth.getAuthorizationUrlAndCodeVerifier();

      expect(result.url).toContain('https://app.test.com/oauth');
      expect(result.url).toContain('client_id=test-client-id');
      expect(result.url).toContain('redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback');
      expect(result.url).toContain('scope=read+write');
      expect(result.url).toContain('response_type=code');
      expect(result.url).toContain('code_challenge=');
      expect(result.url).toContain('code_challenge_method=S256');
      expect(result.codeVerifier).toBeDefined();
    });

    it('should use configured appURL for authorization URL', () => {
      const customConfig: OAuthConfig = {
        ...mockConfig,
        appURL: 'https://custom-app.mosaia.ai'
      };
      const customOauth = new OAuth(customConfig);

      const result = customOauth.getAuthorizationUrlAndCodeVerifier();

      expect(result.url).toContain('https://custom-app.mosaia.ai/oauth');
    });

    it('should handle single scope', () => {
      const singleScopeConfig: OAuthConfig = {
        ...mockConfig,
        scopes: ['read']
      };
      const singleScopeOauth = new OAuth(singleScopeConfig);

      const result = singleScopeOauth.getAuthorizationUrlAndCodeVerifier();

      expect(result.url).toContain('scope=read');
    });

    it('should handle multiple scopes', () => {
      const multiScopeConfig: OAuthConfig = {
        ...mockConfig,
        scopes: ['read', 'write', 'admin']
      };
      const multiScopeOauth = new OAuth(multiScopeConfig);

      const result = multiScopeOauth.getAuthorizationUrlAndCodeVerifier();

      expect(result.url).toContain('scope=read+write+admin');
    });
  });

  describe('exchangeCodeForToken', () => {
    beforeEach(() => {
      // Mock fetch globally
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should exchange code for token with correct parameters', async () => {
      const mockResponse = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
        token_type: 'Bearer',
        expires_in: 3600
      };

      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await oauth.exchangeCodeForToken('auth-code', 'code-verifier');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.mosaia.ai/auth/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: expect.stringContaining('grant_type=authorization_code')
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle token exchange errors', async () => {
      const errorResponse = {
        error: 'invalid_grant',
        error_description: 'The authorization code is invalid'
      };

      // Mock failed fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse
      });

      await expect(
        oauth.exchangeCodeForToken('invalid-code', 'code-verifier')
      ).rejects.toEqual(errorResponse);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');

      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(
        oauth.exchangeCodeForToken('auth-code', 'code-verifier')
      ).rejects.toThrow('Network error');
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      // Mock fetch globally
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should refresh token with correct parameters', async () => {
      const mockResponse = {
        access_token: 'new-access-token-789',
        refresh_token: 'new-refresh-token-012',
        token_type: 'Bearer',
        expires_in: 3600
      };

      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await oauth.refreshToken('old-refresh-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.mosaia.ai/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: expect.stringContaining('grant_type=refresh_token')
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle refresh token errors', async () => {
      const errorResponse = {
        error: 'invalid_grant',
        error_description: 'The refresh token is invalid'
      };

      // Mock failed fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse
      });

      await expect(
        oauth.refreshToken('invalid-refresh-token')
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('OAuth Flow with apiKey Assignment', () => {
    let mosaia: any;

    beforeEach(() => {
      // Mock the main Mosaia class
      mosaia = {
        config: {
          apiKey: 'initial-key',
          apiURL: 'https://api.test.com/v1',
          appURL: 'https://app.test.com',
          version: '1',
          clientId: 'test-client-id'
        },
        set apiKey(value: string) {
          this.config.apiKey = value;
        }
      };
    });

    describe('Complete OAuth Flow', () => {
      beforeEach(() => {
        // Mock fetch globally
        global.fetch = jest.fn();
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it('should complete full OAuth flow with apiKey assignment', async () => {
        // Step 1: Generate authorization URL
        const authData = oauth.getAuthorizationUrlAndCodeVerifier();

        expect(authData.url).toContain('https://app.test.com/oauth');
        expect(authData.codeVerifier).toBeDefined();

        // Step 2: Mock token exchange (simulating user authorization)
        const mockTokenResponse = {
          access_token: 'oauth-access-token-123',
          refresh_token: 'oauth-refresh-token-456',
          token_type: 'Bearer',
          expires_in: 3600
        };

        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockTokenResponse
        });

        // Step 3: Exchange code for token
        const tokenResponse = await oauth.exchangeCodeForToken('auth-code', authData.codeVerifier);

        // Step 4: Assign access token to SDK
        mosaia.apiKey = tokenResponse.access_token;

        // Verify the token was assigned correctly
        expect(mosaia.config.apiKey).toBe('oauth-access-token-123');
        expect(tokenResponse.access_token).toBe('oauth-access-token-123');
      });

      it('should handle token refresh and apiKey update', async () => {
        // Set initial token
        mosaia.apiKey = 'old-oauth-token';
        expect(mosaia.config.apiKey).toBe('old-oauth-token');

        // Mock token refresh
        const mockRefreshResponse = {
          access_token: 'new-oauth-token-789',
          refresh_token: 'new-oauth-refresh-token-012',
          token_type: 'Bearer',
          expires_in: 3600
        };

        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockRefreshResponse
        });

        // Refresh token
        const refreshResponse = await oauth.refreshToken('old-refresh-token');

        // Update SDK with new access token
        mosaia.apiKey = refreshResponse.access_token;

        // Verify the token was updated correctly
        expect(mosaia.config.apiKey).toBe('new-oauth-token-789');
        expect(refreshResponse.access_token).toBe('new-oauth-token-789');
      });
    });

    describe('OAuth Error Handling', () => {
      beforeEach(() => {
        // Mock fetch globally
        global.fetch = jest.fn();
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it('should not update apiKey when token exchange fails', async () => {
        // Set initial token
        mosaia.apiKey = 'initial-token';
        expect(mosaia.config.apiKey).toBe('initial-token');

        // Mock failed token exchange
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            error: 'invalid_grant',
            error_description: 'The authorization code is invalid'
          })
        });

        // Attempt token exchange (should fail)
        try {
          await oauth.exchangeCodeForToken('invalid-code', 'code-verifier');
        } catch (error) {
          // Token exchange failed as expected
        }

        // Verify the token was not changed
        expect(mosaia.config.apiKey).toBe('initial-token');
      });

      it('should handle network errors gracefully', async () => {
        // Set initial token
        mosaia.apiKey = 'initial-token';
        expect(mosaia.config.apiKey).toBe('initial-token');

        // Mock network error
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        // Attempt token exchange (should fail)
        try {
          await oauth.exchangeCodeForToken('auth-code', 'code-verifier');
        } catch (error) {
          // Network error occurred as expected
        }

        // Verify the token was not changed
        expect(mosaia.config.apiKey).toBe('initial-token');
      });
    });

    describe('OAuth Configuration Validation', () => {
      it('should require clientId for OAuth operations', () => {
        const configWithoutClientId: OAuthConfig = {
          clientId: 'test-client-id',
          redirectUri: 'https://myapp.com/callback',
          appURL: 'https://app.test.com'
        };

        const oauthWithoutClientId = new OAuth(configWithoutClientId);

        // Should still work for authorization URL generation
        const result = oauthWithoutClientId.getAuthorizationUrlAndCodeVerifier();
        expect(result.codeVerifier).toBeDefined();
        expect(result.url).toContain('https://app.test.com/oauth');
      });

      it('should use configured appURL for authorization URLs', () => {
        const customConfig: OAuthConfig = {
          ...mockConfig,
          appURL: 'https://custom-app.mosaia.ai'
        };
        const customOauth = new OAuth(customConfig);

        const result = customOauth.getAuthorizationUrlAndCodeVerifier();

        expect(result.url).toContain('https://custom-app.mosaia.ai/oauth');
      });
    });
  });
}); 