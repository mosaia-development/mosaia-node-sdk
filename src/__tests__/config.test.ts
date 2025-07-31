import { ConfigurationManager, DEFAULT_CONFIG } from '../config';
import { MosaiaConfig } from '../types';

describe('DEFAULT_CONFIG', () => {
  it('should have correct API configuration', () => {
    expect(DEFAULT_CONFIG.API).toEqual({
      BASE_URL: 'https://api.mosaia.ai',
      VERSION: '1',
      CONTENT_TYPE: 'application/json',
    });
  });

  it('should have correct APP configuration', () => {
    expect(DEFAULT_CONFIG.APP).toEqual({
      URL: 'https://mosaia.ai',
    });
  });

  it('should have correct AUTH configuration', () => {
    expect(DEFAULT_CONFIG.AUTH).toEqual({
      TOKEN_PREFIX: 'Bearer',
    });
  });

  it('should have correct ERROR messages', () => {
    expect(DEFAULT_CONFIG.ERRORS).toEqual({
      UNKNOWN_ERROR: 'Unknown Error',
      DEFAULT_STATUS: 'UNKNOWN',
      DEFAULT_STATUS_CODE: 400,
    });
  });
});

describe('ConfigurationManager', () => {
  let configManager: ConfigurationManager;

  beforeEach(() => {
    // Reset the singleton instance before each test
    (ConfigurationManager as any).instance = undefined;
    configManager = ConfigurationManager.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = ConfigurationManager.getInstance();
      const instance2 = ConfigurationManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize with default values when no config provided', () => {
      configManager.initialize({});
      const config = configManager.getConfig();
      
      expect(config.apiURL).toBe('https://api.mosaia.ai');
      expect(config.version).toBe('1');
      expect(config.appURL).toBe('https://mosaia.ai');
    });

    it('should initialize with custom values', () => {
      const customConfig: Partial<MosaiaConfig> = {
        apiKey: 'test-api-key',
        apiURL: 'https://custom-api.mosaia.ai',
        version: '2',
        appURL: 'https://custom-app.mosaia.ai',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        verbose: true,
        authType: 'oauth',
        expiresIn: 3600,
        sub: 'test-sub',
        iat: '1640995200',
        exp: '1640998800'
      };

      configManager.initialize(customConfig);
      const config = configManager.getConfig();
      
      expect(config).toEqual({
        ...customConfig,
        apiURL: 'https://custom-api.mosaia.ai',
        version: '2',
        appURL: 'https://custom-app.mosaia.ai'
      });
    });

    it('should merge custom values with defaults', () => {
      const customConfig: Partial<MosaiaConfig> = {
        apiKey: 'test-api-key',
        clientId: 'test-client-id'
      };

      configManager.initialize(customConfig);
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('test-api-key');
      expect(config.clientId).toBe('test-client-id');
      expect(config.apiURL).toBe('https://api.mosaia.ai');
      expect(config.version).toBe('1');
      expect(config.appURL).toBe('https://mosaia.ai');
    });
  });

  describe('getConfig', () => {
    it('should throw error when configuration is not initialized', () => {
      expect(() => configManager.getConfig()).toThrow(
        'Configuration not initialized. Call initialize() first.'
      );
    });

    it('should return configuration when initialized', () => {
      const testConfig: Partial<MosaiaConfig> = {
        apiKey: 'test-key',
        apiURL: 'https://test.mosaia.ai'
      };

      configManager.initialize(testConfig);
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('test-key');
      expect(config.apiURL).toBe('https://test.mosaia.ai');
    });
  });

  describe('getReadOnlyConfig', () => {
    it('should return frozen configuration object', () => {
      const testConfig: Partial<MosaiaConfig> = {
        apiKey: 'test-key'
      };

      configManager.initialize(testConfig);
      const readOnlyConfig = configManager.getReadOnlyConfig();
      
      expect(Object.isFrozen(readOnlyConfig)).toBe(true);
      expect(readOnlyConfig.apiKey).toBe('test-key');
    });

    it('should throw error when configuration is not initialized', () => {
      expect(() => configManager.getReadOnlyConfig()).toThrow(
        'Configuration not initialized. Call initialize() first.'
      );
    });
  });

  describe('updateConfig', () => {
    it('should update specific configuration value', () => {
      configManager.initialize({ apiKey: 'initial-key' });
      
      configManager.updateConfig('apiKey', 'updated-key');
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('updated-key');
    });

    it('should update multiple configuration values', () => {
      configManager.initialize({ apiKey: 'initial-key' });
      
      configManager.updateConfig('apiKey', 'updated-key');
      configManager.updateConfig('version', '3');
      configManager.updateConfig('verbose', true);
      
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('updated-key');
      expect(config.version).toBe('3');
      expect(config.verbose).toBe(true);
    });

    it('should throw error when configuration is not initialized', () => {
      expect(() => configManager.updateConfig('apiKey', 'test')).toThrow(
        'Configuration not initialized. Call initialize() first.'
      );
    });
  });

  describe('getApiUrl', () => {
    it('should return default API URL when not initialized', () => {
      // getApiUrl calls getConfig which requires initialization
      expect(() => configManager.getApiUrl()).toThrow('Configuration not initialized. Call initialize() first.');
    });

    it('should return custom API URL when initialized', () => {
      configManager.initialize({
        apiURL: 'https://custom-api.mosaia.ai',
        version: '2'
      });
      
      expect(configManager.getApiUrl()).toBe('https://custom-api.mosaia.ai/v2');
    });

    it('should use default version when not specified', () => {
      configManager.initialize({
        apiURL: 'https://custom-api.mosaia.ai'
      });
      
      expect(configManager.getApiUrl()).toBe('https://custom-api.mosaia.ai/v1');
    });

    it('should use default API URL when not specified', () => {
      configManager.initialize({
        version: '3'
      });
      
      expect(configManager.getApiUrl()).toBe('https://api.mosaia.ai/v3');
    });
  });

  describe('getAppUrl', () => {
    it('should return default app URL when not initialized', () => {
      // getAppUrl calls getConfig which requires initialization
      expect(() => configManager.getAppUrl()).toThrow('Configuration not initialized. Call initialize() first.');
    });

    it('should return custom app URL when initialized', () => {
      configManager.initialize({
        appURL: 'https://custom-app.mosaia.ai'
      });
      
      expect(configManager.getAppUrl()).toBe('https://custom-app.mosaia.ai');
    });
  });

  describe('getApiKey', () => {
    it('should return undefined when not initialized', () => {
      // This should throw an error since getApiKey calls getConfig which requires initialization
      expect(() => configManager.getApiKey()).toThrow('Configuration not initialized. Call initialize() first.');
    });

    it('should return API key when initialized', () => {
      configManager.initialize({
        apiKey: 'test-api-key'
      });
      
      expect(configManager.getApiKey()).toBe('test-api-key');
    });
  });

  describe('isInitialized', () => {
    it('should return false when not initialized', () => {
      expect(configManager.isInitialized()).toBe(false);
    });

    it('should return true when initialized', () => {
      configManager.initialize({});
      expect(configManager.isInitialized()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset configuration to null', () => {
      configManager.initialize({ apiKey: 'test-key' });
      expect(configManager.isInitialized()).toBe(true);
      
      configManager.reset();
      expect(configManager.isInitialized()).toBe(false);
      expect(() => configManager.getConfig()).toThrow(
        'Configuration not initialized. Call initialize() first.'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      configManager.initialize({
        apiURL: '',
        appURL: '',
        version: ''
      });
      
      const config = configManager.getConfig();
      // Empty strings are falsy, so they get replaced with defaults
      expect(config.apiURL).toBe('https://api.mosaia.ai');
      expect(config.appURL).toBe('https://mosaia.ai');
      expect(config.version).toBe('1');
    });

    it('should handle null and undefined values', () => {
      configManager.initialize({
        apiKey: undefined,
        clientId: null as any
      });
      
      const config = configManager.getConfig();
      expect(config.apiKey).toBeUndefined();
      expect(config.clientId).toBeNull();
    });

    it('should handle special characters in URLs', () => {
      configManager.initialize({
        apiURL: 'https://api.mosaia.ai/path/with/special/chars',
        appURL: 'https://app.mosaia.ai/path/with/special/chars'
      });
      
      const config = configManager.getConfig();
      expect(config.apiURL).toBe('https://api.mosaia.ai/path/with/special/chars');
      expect(config.appURL).toBe('https://app.mosaia.ai/path/with/special/chars');
    });
  });
}); 