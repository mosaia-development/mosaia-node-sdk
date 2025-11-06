import crypto from 'crypto';
import {
    OAuthConfig,
    OAuthErrorResponse,
    MosaiaConfig
} from '../types';
import {
    ConfigurationManager,
    DEFAULT_CONFIG
} from '../config';

/**
 * OAuth client for handling OAuth2 Authorization Code flow with PKCE
 * 
 * This class implements the OAuth2 Authorization Code flow with PKCE (Proof Key for Code Exchange)
 * for secure authentication. It provides a complete OAuth2 implementation including:
 * - Authorization URL generation with PKCE
 * - Token exchange with code verifier
 * - Token refresh
 * - State parameter support for CSRF protection
 * 
 * The implementation follows RFC 7636 for PKCE, ensuring secure authentication
 * even for public clients.
 * 
 * @remarks
 * The class uses cryptographically secure random values for code verifiers
 * and implements the S256 challenge method as specified in RFC 7636.
 * All code verifiers are 128 characters long and properly base64url encoded.
 * 
 * @example
 * Basic OAuth flow:
 * ```typescript
 * // Initialize OAuth client
 * const oauth = new OAuth({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 *   appURL: 'https://mosaia.ai',
 *   scopes: ['read', 'write']
 * });
 * 
 * // Step 1: Get authorization URL and code verifier
 * const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();
 * 
 * // Store code verifier securely (e.g., session storage)
 * sessionStorage.setItem('code_verifier', codeVerifier);
 * 
 * // Step 2: Redirect user to authorization URL
 * window.location.href = url;
 * 
 * // Step 3: Handle OAuth callback
 * const code = new URLSearchParams(window.location.search).get('code');
 * const storedVerifier = sessionStorage.getItem('code_verifier');
 * 
 * if (code && storedVerifier) {
 *   const config = await oauth.authenticateWithCodeAndVerifier(
 *     code,
 *     storedVerifier
 *   );
 *   
 *   // Use the config with the SDK
 *   const mosaia = new MosaiaClient(config);
 * }
 * ```
 * 
 * @example
 * With state parameter for CSRF protection:
 * ```typescript
 * const state = crypto.randomBytes(32).toString('hex');
 * sessionStorage.setItem('oauth_state', state);
 * 
 * const oauth = new OAuth({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 *   scopes: ['read', 'write'],
 *   state: state
 * });
 * ```
 * 
 * @category Authentication
 */
export class OAuth {
    /**
     * OAuth configuration object containing all settings for the OAuth flow
     * 
     * This configuration object is initialized in the constructor and used
     * throughout the OAuth flow. It includes all necessary parameters for
     * authorization, token exchange, and API access.
     * 
     * @type {OAuthConfig}
     * @public
     */
    public config: OAuthConfig;

    /**
     * Creates a new OAuth instance
     * 
     * Initializes an OAuth client with the provided configuration. If certain
     * configuration values are missing, it attempts to use values from the
     * ConfigurationManager.
     * 
     * @param config - OAuth configuration object
     * @param config.clientId - OAuth client ID for application identification
     * @param config.redirectUri - URI where the OAuth provider will redirect after authorization
     * @param config.appURL - Base URL for authorization endpoints (e.g., https://mosaia.ai)
     * @param config.scopes - Array of permission scopes to request (e.g., ['read', 'write'])
     * @param config.state - Optional state parameter for CSRF protection
     * @param config.apiURL - Optional API URL override (defaults to ConfigurationManager value)
     * @param config.apiVersion - Optional API version override (defaults to ConfigurationManager value)
     * 
     * @throws {Error} When required configuration values (clientId, apiURL, apiVersion) are missing
     * 
     * @example
     * ```typescript
     * // Basic initialization
     * const oauth = new OAuth({
     *   clientId: 'your-client-id',
     *   redirectUri: 'https://your-app.com/callback',
     *   scopes: ['read', 'write']
     * });
     * 
     * // Full configuration
     * const oauth = new OAuth({
     *   clientId: 'your-client-id',
     *   redirectUri: 'https://your-app.com/callback',
     *   appURL: 'https://mosaia.ai',
     *   scopes: ['read', 'write'],
     *   state: 'random-state-string',
     *   apiURL: 'https://api.mosaia.ai',
     *   apiVersion: '1'
     * });
     * ```
     */
    constructor(config?: OAuthConfig) {
        config = config || {} as OAuthConfig;
        const configManager = ConfigurationManager.getInstance();
        const defaultConfig = configManager.getConfig();

        if (!config.appURL) config.appURL = DEFAULT_CONFIG.APP.URL;
        if (defaultConfig) {
            if (!config.clientId) config.clientId = defaultConfig.clientId;
            if (!config.apiURL) config.apiURL = defaultConfig.apiURL;
            if (!config.apiVersion) config.apiVersion = defaultConfig.version;
        }
        if (!config.clientId) {
            throw new Error('clientId is required in OAuth config');
        }
        if (!config.apiURL) {
            throw new Error('apiURL is required in OAuth config');
        }
        if (!config.apiVersion) {
            throw new Error('apiVersion is required in OAuth config');
        }
        this.config = config;
    }

    /**
     * Generates a PKCE code verifier and code challenge
     * 
     * This method implements the PKCE (Proof Key for Code Exchange) protocol
     * as specified in RFC 7636. It generates:
     * 1. A cryptographically secure random code verifier (128 characters)
     * 2. A code challenge using SHA256 and base64url encoding
     * 
     * The code verifier must be stored securely (e.g., in session storage)
     * and used later during the token exchange step.
     * 
     * @returns Object containing the PKCE values
     * @returns {string} returns.code_verifier - 128-character random code verifier
     * @returns {string} returns.code_challenge - Base64url-encoded SHA256 hash of verifier
     * 
     * @example
     * ```typescript
     * const { code_verifier, code_challenge } = oauth.generatePKCE();
     * console.log('Verifier length:', code_verifier.length); // 128
     * console.log('Challenge:', code_challenge); // Base64url-encoded string
     * ```
     * 
     * @private
     * @see {@link https://datatracker.ietf.org/doc/html/rfc7636 RFC 7636}
     */
    private generatePKCE(): { code_verifier: string; code_challenge: string } {
        // Generate code verifier using base64url encoding (RFC 7636 compliant)
        // Use 96 bytes to ensure we get 128 characters after base64url encoding
        const codeVerifier = crypto.randomBytes(96)
            .toString('base64url');

        // Generate code challenge using SHA256 hash and base64url encoding
        const codeChallenge = crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');

        return {
            code_verifier: codeVerifier,
            code_challenge: codeChallenge
        };
    }

    /**
     * Generates the authorization URL and PKCE code verifier for the OAuth flow
     * 
     * This method prepares everything needed to start the OAuth authorization flow:
     * 1. Generates a PKCE code verifier and challenge
     * 2. Constructs the authorization URL with all required parameters
     * 3. Returns both the URL and verifier for the next steps
     * 
     * The authorization URL includes:
     * - client_id
     * - redirect_uri
     * - response_type=code
     * - code_challenge (PKCE)
     * - code_challenge_method=S256
     * - scopes (if provided)
     * - state (if provided)
     * 
     * @returns Authorization data for the OAuth flow
     * @returns {string} returns.url - Complete authorization URL to redirect users to
     * @returns {string} returns.codeVerifier - PKCE code verifier (store securely)
     * 
     * @throws {Error} When required configuration (scopes, redirectUri) is missing
     * 
     * @example
     * Basic usage:
     * ```typescript
     * const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();
     * 
     * // Store verifier securely
     * sessionStorage.setItem('code_verifier', codeVerifier);
     * 
     * // Redirect to authorization URL
     * window.location.href = url;
     * ```
     * 
     * @example
     * With error handling:
     * ```typescript
     * try {
     *   const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();
     *   
     *   // Store both verifier and current URL for later
     *   sessionStorage.setItem('code_verifier', codeVerifier);
     *   sessionStorage.setItem('return_to', window.location.href);
     *   
     *   // Redirect to authorization
     *   window.location.href = url;
     * } catch (error) {
     *   console.error('Failed to start OAuth flow:', error.message);
     * }
     * ```
     * 
     * @see {@link authenticateWithCodeAndVerifier} for handling the callback
     */
    getAuthorizationUrlAndCodeVerifier(): { url: string; codeVerifier: string } {
        if (!this.config.scopes || this.config.scopes.length === 0) {
            throw new Error('scopes are required in OAuth config to generate authorization url and code verifier');
        }
        if (!this.config.redirectUri) {
            throw new Error('redirectUri is required in OAuth config to generate authorization url and code verifier');
        }
        const { code_verifier, code_challenge } = this.generatePKCE();
        const params = new URLSearchParams({
            client_id: this.config.clientId!,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            code_challenge: code_challenge,
            code_challenge_method: 'S256',
            ...(this.config.scopes && this.config.scopes.length > 0 && { scope: this.config.scopes.join(',') }),
            ...(this.config.state && { state: this.config.state })
        });

        return {
            url: `${this.config.appURL!}/oauth?${params.toString()}`,
            codeVerifier: code_verifier
        };
    }

    /**
     * Exchanges an authorization code for access and refresh tokens
     * 
     * This method completes the OAuth flow by exchanging the authorization code
     * for access and refresh tokens. It includes the PKCE code verifier in the
     * token request for additional security.
     * 
     * The method:
     * 1. Validates required parameters
     * 2. Constructs the token request with PKCE verification
     * 3. Exchanges the code for tokens
     * 4. Returns a complete MosaiaConfig with the new tokens
     * 
     * @param code - Authorization code from the OAuth callback
     * @param codeVerifier - Original PKCE code verifier from {@link getAuthorizationUrlAndCodeVerifier}
     * @returns Promise resolving to a complete MosaiaConfig
     * 
     * @throws {Error} When required configuration (redirectUri) is missing
     * @throws {OAuthErrorResponse} When token exchange fails
     * @throws {OAuthErrorResponse} When code is invalid or expired
     * @throws {OAuthErrorResponse} When code verifier doesn't match challenge
     * 
     * @example
     * Basic OAuth callback handling:
     * ```typescript
     * // In your OAuth callback route/page
     * const code = new URLSearchParams(window.location.search).get('code');
     * const verifier = sessionStorage.getItem('code_verifier');
     * 
     * if (code && verifier) {
     *   try {
     *     const config = await oauth.authenticateWithCodeAndVerifier(code, verifier);
     *     
     *     // Initialize SDK with the new config
     *     const mosaia = new MosaiaClient(config);
     *     
     *     // Clean up stored values
     *     sessionStorage.removeItem('code_verifier');
     *     
     *     // Return to original page
     *     const returnTo = sessionStorage.getItem('return_to') || '/';
     *     window.location.href = returnTo;
     *   } catch (error) {
     *     console.error('Token exchange failed:', error);
     *     // Handle error (e.g., redirect to login)
     *   }
     * }
     * ```
     * 
     * @example
     * With state verification:
     * ```typescript
     * const params = new URLSearchParams(window.location.search);
     * const code = params.get('code');
     * const state = params.get('state');
     * const verifier = sessionStorage.getItem('code_verifier');
     * const savedState = sessionStorage.getItem('oauth_state');
     * 
     * // Verify state to prevent CSRF
     * if (state !== savedState) {
     *   throw new Error('OAuth state mismatch');
     * }
     * 
     * if (code && verifier) {
     *   const config = await oauth.authenticateWithCodeAndVerifier(code, verifier);
     *   // Use the config...
     * }
     * ```
     * 
     * @see {@link getAuthorizationUrlAndCodeVerifier} for starting the OAuth flow
     */
    async authenticateWithCodeAndVerifier(code: string, codeVerifier: string): Promise<MosaiaConfig> {
        if (!this.config.redirectUri) {
            throw new Error('redirectUri is required in OAuth config to authenticate with code and verifier');
        }
        const params = new URLSearchParams({
            client_id: this.config.clientId!,
            redirect_uri: this.config.redirectUri,
            code: code,
            code_verifier: codeVerifier,
            grant_type: 'authorization_code'
        });

        try {
            const {
                apiURL,
                apiVersion
            } = this.config;
            const response = await fetch(`${apiURL}/v${apiVersion}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });

            const data = await response.json();

            if (!response.ok) {
                throw data as OAuthErrorResponse;
            }

            const sesson = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                sub: data.sub,
                iat: data.iat,
                exp: data.exp,
                authType: 'oauth' as const
            };

            return Promise.resolve({
                ...this.config,
                apiKey: sesson.accessToken,
                session: sesson
            });
        } catch (error) {
            throw error as OAuthErrorResponse;
        }
    }
}
