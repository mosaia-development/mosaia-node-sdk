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
    baseURL: 'https://api.test.com',
    version: '1',
    frontendURL: 'https://app.test.com',
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
      expect(config.baseURL).toBe('https://api.test.com/v1');
      expect(config.frontendURL).toBe('https://app.test.com');
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
}); 