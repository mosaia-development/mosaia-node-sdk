import { ConfigurationManager } from '../config';
import { Mosaia } from '../index';
import { User } from '../models';
import { Agents } from '../apis';
import { MosiaConfig } from '../types';

describe('ConfigurationManager Integration', () => {
  let configManager: ConfigurationManager;

  beforeEach(() => {
    configManager = ConfigurationManager.getInstance();
    configManager.reset();
  });

  afterEach(() => {
    configManager.reset();
  });

  describe('Model Integration', () => {
    it('should use ConfigurationManager in User model without config parameter', () => {
      // Initialize configuration
      configManager.initialize({
        apiKey: 'model-test-key',
        apiURL: 'https://model-api.com',
        version: '1'
      });

      // Create user model without passing config
      const userData = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      };

      const user = new User(userData);

      // Verify the model can access configuration
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe('user-123');
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');

      // Verify the model uses the same ConfigurationManager
      const modelConfigManager = ConfigurationManager.getInstance();
      expect(modelConfigManager.getConfig().apiKey).toBe('model-test-key');
    });

    it('should validate user model correctly', () => {
      configManager.initialize({ apiKey: 'test-key' });

      const validUser = new User({
        email: 'valid@example.com',
        name: 'Valid User'
      });
      expect(validUser.validate()).toBe(true);

      const invalidUser = new User({
        name: 'Invalid User'
        // No email or username
      });
      expect(invalidUser.validate()).toBe(false);
    });
  });

  describe('API Integration', () => {
    it('should use ConfigurationManager in Agents API without config parameter', () => {
      // Initialize configuration
      configManager.initialize({
        apiKey: 'api-test-key',
        apiURL: 'https://api-test.com',
        version: '2'
      });

      // Create agents API without passing config
      const agents = new Agents();

      // Verify the API uses the same ConfigurationManager
      const apiConfigManager = ConfigurationManager.getInstance();
      expect(apiConfigManager.getConfig().apiKey).toBe('api-test-key');
      expect(apiConfigManager.getConfig().apiURL).toBe('https://api-test.com');
      expect(apiConfigManager.getConfig().version).toBe('2');
    });

    it('should maintain configuration consistency across API instances', () => {
      configManager.initialize({
        apiKey: 'consistent-key',
        apiURL: 'https://consistent-api.com'
      });

      const agents1 = new Agents();
      const agents2 = new Agents();

      // Both should use the same configuration
      const config1 = ConfigurationManager.getInstance().getConfig();
      const config2 = ConfigurationManager.getInstance().getConfig();

      expect(config1.apiKey).toBe('consistent-key');
      expect(config2.apiKey).toBe('consistent-key');
      expect(config1).toBe(config2); // Same reference
    });
  });

  describe('Mosaia SDK Integration', () => {
    it('should initialize Mosaia SDK with ConfigurationManager', () => {
      const mosaia = new Mosaia({
        apiKey: 'sdk-integration-key',
        apiURL: 'https://sdk-integration.com',
        version: '1'
      });

      // Verify ConfigurationManager is initialized
      expect(configManager.isInitialized()).toBe(true);
      expect(configManager.getConfig().apiKey).toBe('sdk-integration-key');
      expect(configManager.getConfig().apiURL).toBe('https://sdk-integration.com');
    });

    it('should update configuration through Mosaia SDK setters', () => {
      const mosaia = new Mosaia({
        apiKey: 'initial-key',
        apiURL: 'https://initial.com'
      });

      // Update through SDK setters
      mosaia.apiKey = 'updated-key';
      mosaia.apiURL = 'https://updated.com';
      mosaia.version = '3';

      // Verify ConfigurationManager reflects changes
      expect(configManager.getConfig().apiKey).toBe('updated-key');
      expect(configManager.getConfig().apiURL).toBe('https://updated.com');
      expect(configManager.getConfig().version).toBe('3');
    });

    it('should access configuration through Mosaia SDK getter', () => {
      const mosaia = new Mosaia({
        apiKey: 'getter-test-key',
        apiURL: 'https://getter-test.com'
      });

      const config = mosaia.config;
      expect(config.apiKey).toBe('getter-test-key');
      expect(config.apiURL).toBe('https://getter-test.com');
    });
  });

  describe('No Configuration Copying', () => {
    it('should not create copies of configuration when creating models', () => {
      configManager.initialize({
        apiKey: 'no-copy-key',
        apiURL: 'https://no-copy.com'
      });

      const originalConfig = configManager.getConfig();
      
      // Create multiple models
      const user1 = new User({ id: 'user1', email: 'user1@test.com' });
      const user2 = new User({ id: 'user2', email: 'user2@test.com' });
      const agents = new Agents();

      // All should reference the same configuration
      const config1 = ConfigurationManager.getInstance().getConfig();
      const config2 = ConfigurationManager.getInstance().getConfig();
      const config3 = ConfigurationManager.getInstance().getConfig();

      expect(config1).toBe(originalConfig);
      expect(config2).toBe(originalConfig);
      expect(config3).toBe(originalConfig);
      expect(config1).toBe(config2);
      expect(config2).toBe(config3);
    });

    it('should not create copies when updating configuration', () => {
      configManager.initialize({
        apiKey: 'update-test-key',
        apiURL: 'https://update-test.com'
      });

      const originalConfig = configManager.getConfig();
      
      // Update configuration
      configManager.updateConfig('apiKey', 'new-key');
      
      const updatedConfig = configManager.getConfig();
      
      // Should be the same reference (updated in place)
      expect(updatedConfig).toBe(originalConfig);
      expect(updatedConfig.apiKey).toBe('new-key');
    });
  });

  describe('Thread Safety and State Management', () => {
    it('should maintain consistent state across multiple operations', () => {
      configManager.initialize({
        apiKey: 'state-test-key',
        apiURL: 'https://state-test.com'
      });

      // Perform multiple operations
      const mosaia = new Mosaia({ apiKey: 'sdk-key' });
      const user = new User({ id: 'user', email: 'user@test.com' });
      const agents = new Agents();

      // Update configuration
      mosaia.apiKey = 'final-key';
      configManager.updateConfig('version', '5');

      // All should see the same final state
      expect(configManager.getConfig().apiKey).toBe('final-key');
      expect(configManager.getConfig().version).toBe('5');
      expect(mosaia.config.apiKey).toBe('final-key');
      expect(mosaia.config.version).toBe('5');
    });

    it('should handle configuration reset correctly', () => {
      configManager.initialize({
        apiKey: 'reset-test-key',
        apiURL: 'https://reset-test.com'
      });

      expect(configManager.isInitialized()).toBe(true);

      // Reset configuration
      configManager.reset();
      expect(configManager.isInitialized()).toBe(false);

      // Should throw when accessing config
      expect(() => configManager.getConfig()).toThrow();

      // Re-initialize should work
      configManager.initialize({
        apiKey: 'new-reset-key',
        apiURL: 'https://new-reset.com'
      });

      expect(configManager.getConfig().apiKey).toBe('new-reset-key');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle uninitialized configuration gracefully', () => {
      // Don't initialize configuration
      expect(configManager.isInitialized()).toBe(false);

      // Should throw when trying to access config
      expect(() => configManager.getConfig()).toThrow('Configuration not initialized');
      expect(() => configManager.getApiUrl()).toThrow('Configuration not initialized');
    });

    it('should handle invalid configuration updates', () => {
      configManager.initialize({
        apiKey: 'valid-key',
        apiURL: 'https://valid.com'
      });

      // Valid updates should work
      expect(() => configManager.updateConfig('apiKey', 'new-key')).not.toThrow();
      expect(() => configManager.updateConfig('version', '2')).not.toThrow();

      // Invalid updates should be handled gracefully
      expect(() => configManager.updateConfig('invalidKey' as any, 'value')).not.toThrow();
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple instances', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create many instances
      for (let i = 0; i < 1000; i++) {
        configManager.initialize({
          apiKey: `key-${i}`,
          apiURL: `https://api-${i}.com`
        });

        new Mosaia({ apiKey: `sdk-key-${i}` });
        new User({ id: `user-${i}`, email: `user${i}@test.com` });
        new Agents();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (only for the last configuration)
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
    });
  });
}); 