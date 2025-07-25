import { Apps, Tools, AppBots, Users, Organizations, Agents, AgentGroups, Models, Clients, Auth, Billing, Permissions } from './apis';
import { App, Tool, AppBot } from './models';
import { MosiaConfig, OAuthConfig } from './types';
import { DEFAULT_CONFIG } from './config';
import { OAuth } from './oauth';
import { isSdkError } from './utils';

class Mosaia {
    private config: MosiaConfig;
    
    constructor(config: MosiaConfig) {
        const apiURL = `${config.apiURL || DEFAULT_CONFIG.API.BASE_URL}/v${config.version || DEFAULT_CONFIG.API.VERSION}`;
        const appURL = config.appURL || DEFAULT_CONFIG.APP.URL;
        const user = config.user;
        const org = config.org;

        this.config = {
            ...config,
            apiURL,
            appURL,
            user,
            org,
        };
    }

    get apps() {
        return new Apps(this.config);
    }

    get tools() {
        return new Tools(this.config);
    }

    get users() {
        return new Users(this.config);
    }

    get organizations() {
        return new Organizations(this.config);
    }

    get agents() {
        return new Agents(this.config);
    }

    get agentGroups() {
        return new AgentGroups(this.config);
    }

    get models() {
        return new Models(this.config);
    }

    get clients() {
        return new Clients(this.config);
    }

    get auth() {
        return new Auth(this.config);
    }

    get billing() {
        return new Billing(this.config);
    }

    get permissions() {
        return new Permissions(this.config);
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

        if (!this.config.appURL) {
            throw new Error('appURL is required to initialize OAuth');
        }

        return new OAuth({
            clientId: this.config.clientId,
            redirectUri,
            appURL: this.config.appURL,
            scopes
        });
    }
}

// Export types
export * from './types';
// Export APIs
export * from './apis';
// Export models
export * from './models';
// Export OAuth
export * from './oauth';

export { isSdkError };

// Export default SDK
export default Mosaia;