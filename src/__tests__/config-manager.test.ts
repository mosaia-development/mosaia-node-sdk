import { ConfigurationManager, DEFAULT_CONFIG } from '../config';
import { MosiaConfig } from '../types';

describe('ConfigurationManager', () => {
  let configManager: ConfigurationManager;

  beforeEach(() => {
    // Reset the singleton instance before each test
    configManager = ConfigurationManager.getInstance();
    configManager.reset();
  });

  afterEach(() => {
    // Clean up after each test
    configManager.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = ConfigurationManager.getInstance();
      const instance2 = ConfigurationManager.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(ConfigurationManager);
    });

    it('should maintain state across multiple getInstance calls', () => {
      const instance1 = ConfigurationManager.getInstance();
      instance1.initialize({ apiKey: 'test-key' });
      
      const instance2 = ConfigurationManager.getInstance();
      expect(instance2.isInitialized()).toBe(true);
      expect(instance2.getConfig().apiKey).toBe('test-key');
    });
  });

  describe('Initialization', () => {
    it('should initialize with default values when no config provided', () => {
      configManager.initialize({});
      
      const config = configManager.getConfig();
      expect(config.API.BASE_URL).toBe(DEFAULT_CONFIG.API.BASE_URL);
      expect(config.API.VERSION).toBe(DEFAULT_CONFIG.API.VERSION);
      expect(config.APP.URL).toBe(DEFAULT_CONFIG.APP.URL);
      expect(config.isInitialized()).toBe(true);
    });

    it('should initialize with custom values', () => {
      const customConfig: Partial<MosiaConfig> = {
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
      expect(config.API.BASE_URL).toBe(DEFAULT_CONFIG.API.BASE_URL);
      expect(config.APP.URL).toBe(DEFAULT_CONFIG.APP.URL);
    });

    it('should handle partial configuration updates', () => {
      configManager.initialize({ apiKey: 'initial-key' });
      configManager.initialize({ version: '2' });
      
      const config = configManager.getConfig();
      expect(config.apiKey).toBe('initial-key'); // Should be preserved
      expect(config.version).toBe('2'); // Should be updated
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
      expect(configManager.getAppUrl()).toBe(DEFAULT_CONFIG.APP.URL);
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

    it('should handle invalid configuration updates gracefully', () => {
      configManager.initialize({ apiKey: 'test-key' });
      
      // Should not throw for valid updates
      expect(() => configManager.updateConfig('apiKey', 'new-key')).not.toThrow();
      expect(() => configManager.updateConfig('version', '2')).not.toThrow();
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
      
      expect(configManager.getApiUrl()).toBe(`https://api.example.com/v${DEFAULT_CONFIG.API.VERSION}`);
    });
  });

  describe('Integration with Mosaia SDK', () => {
    it('should work with Mosaia SDK initialization', () => {
      const { Mosaia } = require('../index');
      
      const mosaia = new Mosaia({
        apiKey: 'sdk-test-key',
        apiURL: 'https://sdk-api.com',
        version: '1'
      });
      
      // The Mosaia instance should use the same ConfigurationManager
      const sdkConfigManager = ConfigurationManager.getInstance();
      expect(sdkConfigManager.isInitialized()).toBe(true);
      expect(sdkConfigManager.getConfig().apiKey).toBe('sdk-test-key');
      expect(sdkConfigManager.getConfig().apiURL).toBe('https://sdk-api.com');
    });

    it('should maintain configuration across SDK operations', () => {
      const { Mosaia } = require('../index');
      
      const mosaia = new Mosaia({
        apiKey: 'initial-key',
        apiURL: 'https://initial-api.com'
      });
      
      // Update configuration through SDK
      mosaia.apiKey = 'updated-key';
      mosaia.apiURL = 'https://updated-api.com';
      
      // Verify ConfigurationManager reflects the changes
      const configManager = ConfigurationManager.getInstance();
      expect(configManager.getConfig().apiKey).toBe('updated-key');
      expect(configManager.getConfig().apiURL).toBe('https://updated-api.com');
    });
  });
}); 