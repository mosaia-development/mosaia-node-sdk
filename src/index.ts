import { Apps } from './apis';
import { MosiaConfig, OAuthConfig } from './types';
import { DEFAULT_CONFIG } from './config';
import { OAuth } from './oauth';

class Mosaia {
    private config: MosiaConfig;
    
    constructor(config: MosiaConfig) {
        const baseURL = `${config.baseURL || DEFAULT_CONFIG.API.BASE_URL}/v${config.version || DEFAULT_CONFIG.API.VERSION}`;
        const frontendURL = config.frontendURL || DEFAULT_CONFIG.FRONTEND.URL;

        this.config = {
            ...config,
            baseURL,
            frontendURL
        };
    }

    get apps() {
        return new Apps(this.config);
    }

    /**
     * Creates a new OAuth instance for handling OAuth2 Authorization Code flow with PKCE
     * @param config OAuth configuration
     * @returns {OAuth} OAuth instance
     */
    oauth({
        redirectUri,
        scopes
    }: {
        redirectUri: string,
        scopes?: string[]
    }): OAuth {
        if (!this.config.clientId) {
            throw new Error('Client ID is required to initialize OAuth');
        }

        return new OAuth({
            clientId: this.config.clientId,
            redirectUri,
            scopes
        });
    }
}

// Export types
export * from './types';
// Export APIs
export * from './apis';
// Export OAuth
export * from './oauth';

// Export default SDK
export default Mosaia;