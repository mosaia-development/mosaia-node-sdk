import Mosaia from '../index';
import { MosiaConfig } from '../types';

// Mock the API classes
jest.mock('../apis/apps');
jest.mock('../apis/tools');
jest.mock('../apis/users');
jest.mock('../apis/organizations');
jest.mock('../apis/agents');
jest.mock('../apis/agent-groups');
jest.mock('../apis/models');
jest.mock('../apis/clients');
jest.mock('../apis/auth');
jest.mock('../apis/billing');
jest.mock('../apis/permissions');

describe('Mosaia SDK', () => {
  let mosaia: Mosaia;
  const mockConfig: MosiaConfig = {
    apiKey: 'test-api-key',
    apiURL: 'https://api.test.com',
    version: '1',
    appURL: 'https://app.test.com',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    user: 'test-user-id',
    org: 'test-org-id'
  };

  beforeEach(() => {
    mosaia = new Mosaia(mockConfig);
  });

  describe('Constructor', () => {
    it('should create a Mosaia instance with default config', () => {
      const defaultMosaia = new Mosaia({
        apiKey: 'test-key'
      });
      expect(defaultMosaia).toBeInstanceOf(Mosaia);
    });

    it('should create a Mosaia instance with full config', () => {
      expect(mosaia).toBeInstanceOf(Mosaia);
    });

    it('should merge configuration correctly', () => {
      const config = mosaia['config'];
      expect(config.apiKey).toBe('test-api-key');
      expect(config.apiURL).toBe('https://api.test.com/v1');
      expect(config.appURL).toBe('https://app.test.com');
      expect(config.user).toBe('test-user-id');
      expect(config.org).toBe('test-org-id');
    });
  });

  describe('API Accessors', () => {
    it('should provide access to apps API', () => {
      expect(mosaia.apps).toBeDefined();
    });

    it('should provide access to tools API', () => {
      expect(mosaia.tools).toBeDefined();
    });

    it('should provide access to users API', () => {
      expect(mosaia.users).toBeDefined();
    });

    it('should provide access to organizations API', () => {
      expect(mosaia.organizations).toBeDefined();
    });

    it('should provide access to agents API', () => {
      expect(mosaia.agents).toBeDefined();
    });

    it('should provide access to agentGroups API', () => {
      expect(mosaia.agentGroups).toBeDefined();
    });

    it('should provide access to models API', () => {
      expect(mosaia.models).toBeDefined();
    });

    it('should provide access to clients API', () => {
      expect(mosaia.clients).toBeDefined();
    });

    it('should provide access to auth API', () => {
      expect(mosaia.auth).toBeDefined();
    });

    it('should provide access to billing API', () => {
      expect(mosaia.billing).toBeDefined();
    });

    it('should provide access to permissions API', () => {
      expect(mosaia.permissions).toBeDefined();
    });
  });

  describe('OAuth', () => {
    it('should create OAuth instance with valid config', () => {
      const oauth = mosaia.oauth({
        redirectUri: 'https://test.com/callback',
        scopes: ['read', 'write']
      });
      expect(oauth).toBeDefined();
    });

    it('should throw error when clientId is missing', () => {
      const mosaiaWithoutClientId = new Mosaia({
        apiKey: 'test-key'
      });

      expect(() => {
        mosaiaWithoutClientId.oauth({
          redirectUri: 'https://test.com/callback'
        });
      }).toThrow('Client ID is required to initialize OAuth');
    });
  });

  describe('Configuration Setters', () => {
    describe('apiKey setter', () => {
      it('should update apiKey configuration', () => {
        const newApiKey = 'new-api-key-123';
        mosaia.apiKey = newApiKey;
        expect(mosaia['config'].apiKey).toBe(newApiKey);
      });

      it('should allow updating apiKey multiple times', () => {
        mosaia.apiKey = 'first-key';
        expect(mosaia['config'].apiKey).toBe('first-key');

        mosaia.apiKey = 'second-key';
        expect(mosaia['config'].apiKey).toBe('second-key');

        mosaia.apiKey = 'third-key';
        expect(mosaia['config'].apiKey).toBe('third-key');
      });

      it('should accept empty string as apiKey', () => {
        mosaia.apiKey = '';
        expect(mosaia['config'].apiKey).toBe('');
      });

      it('should accept long apiKey strings', () => {
        const longApiKey = 'a'.repeat(1000);
        mosaia.apiKey = longApiKey;
        expect(mosaia['config'].apiKey).toBe(longApiKey);
      });
    });

    describe('version setter', () => {
      it('should update version configuration', () => {
        const newVersion = '2';
        mosaia.version = newVersion;
        expect(mosaia['config'].version).toBe(newVersion);
      });

      it('should allow updating version multiple times', () => {
        mosaia.version = '1';
        expect(mosaia['config'].version).toBe('1');

        mosaia.version = '2';
        expect(mosaia['config'].version).toBe('2');

        mosaia.version = '3';
        expect(mosaia['config'].version).toBe('3');
      });
    });

    describe('apiURL setter', () => {
      it('should update apiURL configuration', () => {
        const newApiURL = 'https://api-staging.mosaia.ai';
        mosaia.apiURL = newApiURL;
        expect(mosaia['config'].apiURL).toBe(newApiURL);
      });

      it('should allow updating apiURL multiple times', () => {
        mosaia.apiURL = 'https://api-dev.mosaia.ai';
        expect(mosaia['config'].apiURL).toBe('https://api-dev.mosaia.ai');

        mosaia.apiURL = 'https://api-staging.mosaia.ai';
        expect(mosaia['config'].apiURL).toBe('https://api-staging.mosaia.ai');

        mosaia.apiURL = 'https://api.mosaia.ai';
        expect(mosaia['config'].apiURL).toBe('https://api.mosaia.ai');
      });

      it('should accept localhost URLs', () => {
        mosaia.apiURL = 'http://localhost:3000';
        expect(mosaia['config'].apiURL).toBe('http://localhost:3000');
      });
    });

    describe('appURL setter', () => {
      it('should update appURL configuration', () => {
        const newAppURL = 'https://app-staging.mosaia.ai';
        mosaia.appURL = newAppURL;
        expect(mosaia['config'].appURL).toBe(newAppURL);
      });

      it('should allow updating appURL multiple times', () => {
        mosaia.appURL = 'https://app-dev.mosaia.ai';
        expect(mosaia['config'].appURL).toBe('https://app-dev.mosaia.ai');

        mosaia.appURL = 'https://app-staging.mosaia.ai';
        expect(mosaia['config'].appURL).toBe('https://app-staging.mosaia.ai');

        mosaia.appURL = 'https://mosaia.ai';
        expect(mosaia['config'].appURL).toBe('https://mosaia.ai');
      });

      it('should accept localhost URLs', () => {
        mosaia.appURL = 'http://localhost:3001';
        expect(mosaia['config'].appURL).toBe('http://localhost:3001');
      });
    });

    describe('clientId setter', () => {
      it('should update clientId configuration', () => {
        const newClientId = 'new-client-id-123';
        mosaia.clientId = newClientId;
        expect(mosaia['config'].clientId).toBe(newClientId);
      });

      it('should allow updating clientId multiple times', () => {
        mosaia.clientId = 'client-1';
        expect(mosaia['config'].clientId).toBe('client-1');

        mosaia.clientId = 'client-2';
        expect(mosaia['config'].clientId).toBe('client-2');

        mosaia.clientId = 'client-3';
        expect(mosaia['config'].clientId).toBe('client-3');
      });
    });

    describe('clientSecret setter', () => {
      it('should update clientSecret configuration', () => {
        const newClientSecret = 'new-client-secret-456';
        mosaia.clientSecret = newClientSecret;
        expect(mosaia['config'].clientSecret).toBe(newClientSecret);
      });

      it('should allow updating clientSecret multiple times', () => {
        mosaia.clientSecret = 'secret-1';
        expect(mosaia['config'].clientSecret).toBe('secret-1');

        mosaia.clientSecret = 'secret-2';
        expect(mosaia['config'].clientSecret).toBe('secret-2');

        mosaia.clientSecret = 'secret-3';
        expect(mosaia['config'].clientSecret).toBe('secret-3');
      });
    });

    describe('Configuration persistence', () => {
      it('should maintain configuration across API calls', () => {
        // Set initial configuration
        mosaia.apiKey = 'initial-key';
        mosaia.apiURL = 'https://api-initial.mosaia.ai';
        mosaia.appURL = 'https://app-initial.mosaia.ai';

        // Verify configuration is set
        expect(mosaia['config'].apiKey).toBe('initial-key');
        expect(mosaia['config'].apiURL).toBe('https://api-initial.mosaia.ai');
        expect(mosaia['config'].appURL).toBe('https://app-initial.mosaia.ai');

        // Update configuration
        mosaia.apiKey = 'updated-key';
        mosaia.apiURL = 'https://api-updated.mosaia.ai';
        mosaia.appURL = 'https://app-updated.mosaia.ai';

        // Verify configuration is updated
        expect(mosaia['config'].apiKey).toBe('updated-key');
        expect(mosaia['config'].apiURL).toBe('https://api-updated.mosaia.ai');
        expect(mosaia['config'].appURL).toBe('https://app-updated.mosaia.ai');
      });

      it('should preserve other configuration when updating individual properties', () => {
        // Set all configuration
        mosaia.apiKey = 'test-key';
        mosaia.version = '2';
        mosaia.apiURL = 'https://api.test.com';
        mosaia.appURL = 'https://app.test.com';
        mosaia.clientId = 'test-client';
        mosaia.clientSecret = 'test-secret';

        // Update only apiKey
        mosaia.apiKey = 'new-key';

        // Verify only apiKey changed, others remain the same
        expect(mosaia['config'].apiKey).toBe('new-key');
        expect(mosaia['config'].version).toBe('2');
        expect(mosaia['config'].apiURL).toBe('https://api.test.com');
        expect(mosaia['config'].appURL).toBe('https://app.test.com');
        expect(mosaia['config'].clientId).toBe('test-client');
        expect(mosaia['config'].clientSecret).toBe('test-secret');
      });
    });
  });
}); 