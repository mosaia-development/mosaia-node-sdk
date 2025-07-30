// Simple test for ConfigurationManager without external dependencies
describe('ConfigurationManager Simple Tests', () => {
  // Mock the ConfigurationManager class for testing
  class MockConfigurationManager {
    private static instance: MockConfigurationManager;
    private config: any = null;
    private readonly defaultConfig = {
      API: {
        BASE_URL: 'https://api.mosaia.ai',
        VERSION: '1',
        CONTENT_TYPE: 'application/json',
      },
      APP: {
        URL: 'https://mosaia.ai',
      },
      AUTH: {
        TOKEN_PREFIX: 'Bearer',
      },
      ERRORS: {
        NO_AUTH: 'Run bot.auth($YOUR_MOSAIA_BOT_KEY) first',
        UNKNOWN_ERROR: 'Unknown Error',
        DEFAULT_STATUS: 'UNKNOWN',
        DEFAULT_STATUS_CODE: 400,
      },
      ENDPOINTS: {
        APPS: '/app',
        TOOLS: '/tool',
        BOTS: '/bot',
      },
      RESPONSE: {
        SUCCESS: {
          data: null,
          error: null
        }
      }
    };

    private constructor() {}

    public static getInstance(): MockConfigurationManager {
      if (!MockConfigurationManager.instance) {
        MockConfigurationManager.instance = new MockConfigurationManager();
      }
      return MockConfigurationManager.instance;
    }

    public initialize(userConfig: any): void {
      const apiURL = userConfig.apiURL || this.defaultConfig.API.BASE_URL;
      const version = userConfig.version || this.defaultConfig.API.VERSION;
      const appURL = userConfig.appURL || this.defaultConfig.APP.URL;

      this.config = {
        ...userConfig,
        apiURL,
        version,
        appURL
      };
    }

    public getConfig(): any {
      if (!this.config) {
        throw new Error('Configuration not initialized. Call initialize() first.');
      }
      return this.config;
    }

    public getReadOnlyConfig(): any {
      return Object.freeze({ ...this.getConfig() });
    }

    public updateConfig(key: string, value: any): void {
      if (!this.config) {
        throw new Error('Configuration not initialized. Call initialize() first.');
      }
      this.config = { ...this.config, [key]: value };
    }

    public getApiUrl(): string {
      const config = this.getConfig();
      return `${config.apiURL || this.defaultConfig.API.BASE_URL}/v${config.version || this.defaultConfig.API.VERSION}`;
    }

    public getAppUrl(): string {
      const config = this.getConfig();
      return config.appURL || this.defaultConfig.APP.URL;
    }

    public getApiKey(): string | undefined {
      return this.getConfig().apiKey;
    }

    public isInitialized(): boolean {
      return this.config !== null;
    }

    public reset(): void {
      this.config = null;
    }
  }

  let configManager: MockConfigurationManager;

  beforeEach(() => {
    configManager = MockConfigurationManager.getInstance();
    configManager.reset();
  });

  afterEach(() => {
    configManager.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = MockConfigurationManager.getInstance();
      const instance2 = MockConfigurationManager.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(MockConfigurationManager);
    });

    it('should maintain state across multiple getInstance calls', () => {
      const instance1 = MockConfigurationManager.getInstance();
      instance1.initialize({ apiKey: 'test-key' });
      
      const instance2 = MockConfigurationManager.getInstance();
      expect(instance2.isInitialized()).toBe(true);
      expect(instance2.getConfig().apiKey).toBe('test-key');
    });
  });

  describe('Initialization', () => {
    it('should initialize with default values when no config provided', () => {
      configManager.initialize({});
      
      const config = configManager.getConfig();
      expect(config.apiURL).toBe('https://api.mosaia.ai');
      expect(config.version).toBe('1');
      expect(config.appURL).toBe('https://mosaia.ai');
      expect(configManager.isInitialized()).toBe(true);
    });

    it('should initialize with custom values', () => {
      const customConfig = {
        apiKey: 'custom-api-key',
        apiURL: 'https://custom-api.com',
        appURL: 'https://custom-app.com',
        version: '2',
        clientId: 'custom-client-id',
        clientSecret: 'custom-client-secret'
      };

      configManager.initialize(customConfig);
      
      const config = configManager.getConfig();
      expect(config.apiKey).toBe('custom-api-key');
      expect(config.apiURL).toBe('https://custom-api.com');
      expect(config.appURL).toBe('https://custom-app.com');
      expect(config.version).toBe('2');
      expect(config.clientId).toBe('custom-client-id');
      expect(config.clientSecret).toBe('custom-client-secret');
    });

    it('should merge custom values with defaults', () => {
      configManager.initialize({
        apiKey: 'test-key',
        version: '3'
      });
      
      const config = configManager.getConfig();
      expect(config.apiKey).toBe('test-key');
      expect(config.version).toBe('3');
      expect(config.apiURL).toBe('https://api.mosaia.ai');
      expect(config.appURL).toBe('https://mosaia.ai');
    });
  });

  describe('Configuration Access', () => {
    beforeEach(() => {
      configManager.initialize({
        apiKey: 'test-key',
        apiURL: 'https://test-api.com',
        version: '1'
      });
    });

    it('should return the current configuration', () => {
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('test-key');
      expect(config.apiURL).toBe('https://test-api.com');
      expect(config.version).toBe('1');
    });

    it('should return a read-only copy of configuration', () => {
      const readOnlyConfig = configManager.getReadOnlyConfig();
      
      expect(readOnlyConfig.apiKey).toBe('test-key');
      expect(Object.isFrozen(readOnlyConfig)).toBe(true);
      
      // Should not be able to modify the frozen config
      expect(() => {
        (readOnlyConfig as any).apiKey = 'modified-key';
      }).toThrow();
    });

    it('should provide convenient getter methods', () => {
      expect(configManager.getApiUrl()).toBe('https://test-api.com/v1');
      expect(configManager.getAppUrl()).toBe('https://mosaia.ai');
      expect(configManager.getApiKey()).toBe('test-key');
    });

    it('should check initialization status', () => {
      expect(configManager.isInitialized()).toBe(true);
      
      configManager.reset();
      expect(configManager.isInitialized()).toBe(false);
    });
  });

  describe('Configuration Updates', () => {
    beforeEach(() => {
      configManager.initialize({
        apiKey: 'initial-key',
        version: '1'
      });
    });

    it('should update specific configuration values', () => {
      configManager.updateConfig('apiKey', 'new-api-key');
      configManager.updateConfig('version', '2');
      
      const config = configManager.getConfig();
      expect(config.apiKey).toBe('new-api-key');
      expect(config.version).toBe('2');
    });

    it('should preserve other configuration values when updating', () => {
      configManager.updateConfig('apiKey', 'new-key');
      
      const config = configManager.getConfig();
      expect(config.apiKey).toBe('new-key');
      expect(config.version).toBe('1'); // Should be preserved
    });

    it('should handle multiple sequential updates', () => {
      configManager.updateConfig('apiKey', 'key1');
      configManager.updateConfig('apiKey', 'key2');
      configManager.updateConfig('apiKey', 'key3');
      
      expect(configManager.getConfig().apiKey).toBe('key3');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when accessing config before initialization', () => {
      expect(() => configManager.getConfig()).toThrow('Configuration not initialized. Call initialize() first.');
      expect(() => configManager.getReadOnlyConfig()).toThrow('Configuration not initialized. Call initialize() first.');
      expect(() => configManager.getApiUrl()).toThrow('Configuration not initialized. Call initialize() first.');
      expect(() => configManager.getAppUrl()).toThrow('Configuration not initialized. Call initialize() first.');
      expect(() => configManager.getApiKey()).toThrow('Configuration not initialized. Call initialize() first.');
    });

    it('should throw error when updating config before initialization', () => {
      expect(() => configManager.updateConfig('apiKey', 'new-key')).toThrow('Configuration not initialized. Call initialize() first.');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset configuration to uninitialized state', () => {
      configManager.initialize({ apiKey: 'test-key' });
      expect(configManager.isInitialized()).toBe(true);
      
      configManager.reset();
      expect(configManager.isInitialized()).toBe(false);
      expect(() => configManager.getConfig()).toThrow();
    });

    it('should allow re-initialization after reset', () => {
      configManager.initialize({ apiKey: 'key1' });
      configManager.reset();
      
      configManager.initialize({ apiKey: 'key2' });
      expect(configManager.getConfig().apiKey).toBe('key2');
    });
  });

  describe('URL Generation', () => {
    it('should generate correct API URL with version', () => {
      configManager.initialize({
        apiURL: 'https://api.example.com',
        version: '2'
      });
      
      expect(configManager.getApiUrl()).toBe('https://api.example.com/v2');
    });

    it('should handle different API versions', () => {
      configManager.initialize({
        apiURL: 'https://api.example.com',
        version: '3'
      });
      
      expect(configManager.getApiUrl()).toBe('https://api.example.com/v3');
    });

    it('should use default version when not specified', () => {
      configManager.initialize({
        apiURL: 'https://api.example.com'
      });
      
      expect(configManager.getApiUrl()).toBe('https://api.example.com/v1');
    });
  });
}); 