import * as SDK from '../index';
import { ConfigurationManager } from '../config';
import { MosaiaConfig, UserInterface } from '../types';
import APIClient from '../utils/api-client';
import { Session } from '../models';
import { OAuth } from '../auth/oauth';

const { MosaiaClient } = SDK;

// Mock dependencies
jest.mock('../utils/api-client');
jest.mock('../models');
jest.mock('../auth/oauth');

const MockAPIClient = APIClient as jest.MockedClass<typeof APIClient>;
const MockSession = Session as jest.MockedClass<typeof Session>;
const MockOAuth = OAuth as jest.MockedClass<typeof OAuth>;

describe('MosaiaClient', () => {
  let mosaia: InstanceType<typeof MosaiaClient>;
  let mockConfigManager: jest.Mocked<ConfigurationManager>;

  const defaultConfig: MosaiaConfig = {
    apiKey: 'test-api-key',
    apiURL: 'https://api.mosaia.ai',

    version: '1',
    clientId: 'test-client-id'
  };

  beforeEach(() => {
    // Reset ConfigurationManager singleton
    (ConfigurationManager as any).instance = undefined;
    
    // Mock ConfigurationManager
    mockConfigManager = {
      initialize: jest.fn(),
      getConfig: jest.fn().mockReturnValue(defaultConfig),
      getReadOnlyConfig: jest.fn().mockReturnValue(Object.freeze(defaultConfig)),
      updateConfig: jest.fn(),
      getApiUrl: jest.fn().mockReturnValue('https://api.mosaia.ai/v1'),
      getAppUrl: jest.fn().mockReturnValue('https://mosaia.ai'),
      getApiKey: jest.fn().mockReturnValue('test-api-key'),
      isInitialized: jest.fn().mockReturnValue(true),
      reset: jest.fn()
    } as any;

    jest.spyOn(ConfigurationManager, 'getInstance').mockReturnValue(mockConfigManager);

    // Reset mocks
    jest.clearAllMocks();
    
    mosaia = new MosaiaClient(defaultConfig);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided configuration', () => {
      expect(ConfigurationManager.getInstance).toHaveBeenCalled();
      expect(mockConfigManager.initialize).toHaveBeenCalledWith(defaultConfig);
    });

    it('should initialize with minimal configuration', () => {
      const minimalConfig: MosaiaConfig = {
        apiKey: 'minimal-key'
      };

      new MosaiaClient(minimalConfig);
      expect(mockConfigManager.initialize).toHaveBeenCalledWith(minimalConfig);
    });

    it('should initialize with full configuration', () => {
      const fullConfig: MosaiaConfig = {
        apiKey: 'full-key',
        version: '2',
        apiURL: 'https://custom-api.mosaia.ai',
        clientId: 'full-client-id',
        clientSecret: 'full-client-secret',
        verbose: true,
        session: {
          accessToken: 'full-key',
          refreshToken: 'refresh-token',
          authType: 'oauth',
          sub: 'user-123',
          iat: '1640995200',
          exp: '1640998800'
        }
      };

      new MosaiaClient(fullConfig);
      expect(mockConfigManager.initialize).toHaveBeenCalledWith(fullConfig);
    });
  });

  describe('config getter and setter', () => {
    it('should get current configuration', () => {
      const config = mosaia.config;
      expect(mockConfigManager.getConfig).toHaveBeenCalled();
      expect(config).toEqual(defaultConfig);
    });

    it('should set new configuration', () => {
      const newConfig: MosaiaConfig = {
        apiKey: 'new-key',
        apiURL: 'https://new-api.mosaia.ai'
      };

      mosaia.config = newConfig;
      expect(mockConfigManager.initialize).toHaveBeenCalledWith(newConfig);
    });
  });

  describe('apiKey setter', () => {
    it('should update API key', () => {
      mosaia.apiKey = 'new-api-key';
      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith('apiKey', 'new-api-key');
    });
  });

  describe('version setter', () => {
    it('should update version', () => {
      mosaia.version = '3';
      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith('version', '3');
    });
  });

  describe('apiURL setter', () => {
    it('should update API URL', () => {
      mosaia.apiURL = 'https://new-api.mosaia.ai';
      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith('apiURL', 'https://new-api.mosaia.ai');
    });
  });

  describe('clientId setter', () => {
    it('should update client ID', () => {
      mosaia.clientId = 'new-client-id';
      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith('clientId', 'new-client-id');
    });
  });

  describe('clientSecret setter', () => {
    it('should update client secret', () => {
      mosaia.clientSecret = 'new-client-secret';
      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith('clientSecret', 'new-client-secret');
    });
  });

  describe('auth getter', () => {
    it('should return Auth instance', () => {
      const auth = mosaia.auth;
      expect(auth).toBeDefined();
      // Note: Auth is imported and instantiated directly, so we can't easily mock it
      // This test ensures the getter returns something
    });
  });

  describe('agents getter', () => {
    it('should return Agents instance', () => {
      const agents = mosaia.agents;
      expect(agents).toBeDefined();
      // Note: Agents is imported and instantiated directly
    });
  });

  describe('self method', () => {
    let mockClient: jest.Mocked<APIClient>;

    beforeEach(() => {
      mockClient = {
        GET: jest.fn()
      } as any;
      MockAPIClient.mockImplementation(() => mockClient);
    });

    it('should return Self instance on successful API call', async () => {
      const mockUserData: UserInterface = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe'
      };

      const mockResponse = {
        meta: { status: 200, message: 'Success' },
        data: mockUserData,
        error: null
      };

      mockClient.GET.mockResolvedValue(mockResponse);
          MockSession.mockImplementation((data: any) => ({ data } as any));

    const result = await mosaia.session();

      expect(mockClient.GET).toHaveBeenCalledWith('/self');
      expect(MockSession).toHaveBeenCalledWith(mockUserData);
      expect(result).toEqual({ data: mockUserData });
    });

    it('should throw error when API returns error', async () => {
      const mockResponse = {
        meta: { status: 400, message: 'Bad Request' },
        data: null,
        error: { message: 'API Error', code: 'API_ERROR', status: 400 }
      };

      mockClient.GET.mockResolvedValue(mockResponse);

      await expect(mosaia.session()).rejects.toThrow('API Error');
    });

    it('should throw error when configuration is not initialized', async () => {
      mockConfigManager.getConfig.mockImplementation(() => {
        throw new Error('Configuration not initialized');
      });

      await expect(mosaia.session()).rejects.toThrow('Configuration not initialized');
    });

    it('should throw error when API call fails', async () => {
      mockClient.GET.mockRejectedValue(new Error('Network error'));

      await expect(mosaia.session()).rejects.toThrow('Network error');
    });

    it('should throw generic error for unknown errors', async () => {
      mockClient.GET.mockRejectedValue({});

      await expect(mosaia.session()).rejects.toThrow('Unknown error occurred');
    });
  });

  describe('apps getter', () => {
    it('should return Apps instance', () => {
      const apps = mosaia.apps;
      expect(apps).toBeDefined();
    });
  });

  describe('tools getter', () => {
    it('should return Tools instance', () => {
      const tools = mosaia.tools;
      expect(tools).toBeDefined();
    });
  });

  describe('users getter', () => {
    it('should return Users instance', () => {
      const users = mosaia.users;
      expect(users).toBeDefined();
    });
  });

  describe('organizations getter', () => {
    it('should return Organizations instance', () => {
      const organizations = mosaia.organizations;
      expect(organizations).toBeDefined();
    });
  });

  describe('agentGroups getter', () => {
    it('should return AgentGroups instance', () => {
      const agentGroups = mosaia.agentGroups;
      expect(agentGroups).toBeDefined();
    });
  });

  describe('models getter', () => {
    it('should return Models instance', () => {
      const models = mosaia.models;
      expect(models).toBeDefined();
    });
  });

  describe('oauth method', () => {
    it('should create OAuth instance with valid configuration', () => {
      const oauthConfig = {
        redirectUri: 'https://myapp.com/callback',
        appURL: 'https://custom-app.mosaia.ai',
        scopes: ['read', 'write']
      };

      const oauthInstance = mosaia.oauth(oauthConfig);

      expect(MockOAuth).toHaveBeenCalledWith(oauthConfig);
      expect(oauthInstance).toBeDefined();
    });

    it('should create OAuth instance with required scopes', () => {
      const oauthConfig = {
        redirectUri: 'https://myapp.com/callback',
        scopes: ['read', 'write'],
        appURL: 'https://custom-app.mosaia.ai'
      };

      mosaia.oauth(oauthConfig);

      expect(MockOAuth).toHaveBeenCalledWith(oauthConfig);
    });

    it('should handle missing configuration values by using defaults', () => {
      const oauthConfig = {
        redirectUri: 'https://myapp.com/callback',
        scopes: ['read', 'write']
      };

      const oauthInstance = mosaia.oauth(oauthConfig);
      expect(oauthInstance).toBeDefined();
      expect(MockOAuth).toHaveBeenCalledWith(oauthConfig);
    });
  });

  describe('edge cases', () => {
    it('should handle empty configuration', () => {
      const emptyConfig: MosaiaConfig = {};
      new MosaiaClient(emptyConfig);
      expect(mockConfigManager.initialize).toHaveBeenCalledWith(emptyConfig);
    });

    it('should handle configuration with only required fields', () => {
      const minimalConfig: MosaiaConfig = {
        apiKey: 'minimal-key'
      };
      new MosaiaClient(minimalConfig);
      expect(mockConfigManager.initialize).toHaveBeenCalledWith(minimalConfig);
    });

    it('should handle configuration with all optional fields', () => {
      const fullConfig: MosaiaConfig = {
        apiKey: 'full-key',
        version: '2',
        apiURL: 'https://custom-api.mosaia.ai',
        clientId: 'full-client-id',
        clientSecret: 'full-client-secret',
        verbose: true,
        session: {
          accessToken: 'full-key',
          refreshToken: 'refresh-token',
          authType: 'oauth',
          sub: 'user-123',
          iat: '1640995200',
          exp: '1640998800'
        }
      };
      new MosaiaClient(fullConfig);
      expect(mockConfigManager.initialize).toHaveBeenCalledWith(fullConfig);
    });
  });

  describe('integration scenarios', () => {
    it('should allow chaining configuration updates', () => {
      mosaia.apiKey = 'new-key';
      mosaia.version = '2';
      mosaia.apiURL = 'https://new-api.mosaia.ai';

      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith('apiKey', 'new-key');
      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith('version', '2');
      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith('apiURL', 'https://new-api.mosaia.ai');
    });

    it('should maintain configuration state across method calls', () => {
      // Update configuration
      mosaia.apiKey = 'updated-key';
      
      // Call a method that uses configuration
      const config = mosaia.config;
      
      expect(config.apiKey).toBe('test-api-key'); // This comes from the mock
      expect(mockConfigManager.getConfig).toHaveBeenCalled();
    });
  });
});

// Test the main SDK class export
describe('Main SDK class export', () => {
  it('should export MosaiaClient', () => {
    expect(MosaiaClient).toBeDefined();
    expect(typeof MosaiaClient).toBe('function');
  });
});

// Test the default export
describe('Default export', () => {
  it('should export MosaiaClient as default', () => {
    const DefaultExport = require('../index').default;
    expect(DefaultExport).toBeDefined();
    expect(typeof DefaultExport).toBe('function');
    expect(DefaultExport).toBe(MosaiaClient);
  });
});

// Test that all exports are available
describe('Module exports', () => {
  it('should export all necessary types and APIs', () => {
    // This test ensures that the module exports are working correctly
    // The actual exports are tested in the individual API test files
    expect(MosaiaClient).toBeDefined();
  });
}); 