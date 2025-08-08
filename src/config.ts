/**
 * @fileoverview Global configuration management for the Mosaia SDK
 * 
 * This module provides a centralized configuration system for the Mosaia SDK,
 * including default configuration values and a singleton ConfigurationManager
 * class for managing runtime configuration.
 * 
 * @module config
 * @packageDocumentation
 */

import { MosaiaConfig } from './types';

/**
 * Default configuration values for the Mosaia SDK
 * 
 * These values are used as fallbacks when user configuration is not provided
 * or when specific configuration options are missing.
 * 
 * @example
 * ```typescript
 * import { DEFAULT_CONFIG } from '@mosaia/mosaia-node-sdk';
 * 
 * // Access default API configuration
 * console.log(DEFAULT_CONFIG.API.BASE_URL); // 'https://api.mosaia.ai'
 * console.log(DEFAULT_CONFIG.API.VERSION); // '1'
 * ```
 */
export const DEFAULT_CONFIG = {
    // API Configuration
    API: {
        /** Default base URL for API requests */
        BASE_URL: 'https://api.mosaia.ai',
        /** Default API version */
        VERSION: '1',
        /** Default content type for API requests */
        CONTENT_TYPE: 'application/json',
    },

    // App Configuration
    APP: {
        /** Default application URL */
        URL: 'https://mosaia.ai',
    },

    // Authentication
    AUTH: {
        /** Default token prefix for authentication headers */
        TOKEN_PREFIX: 'Bearer',
    },

    // Error Messages
    ERRORS: {
        /** Default error message for unknown errors */
        UNKNOWN_ERROR: 'Unknown Error',
        /** Default status for error responses */
        DEFAULT_STATUS: 'UNKNOWN',
        /** Default HTTP status code for errors */
        DEFAULT_STATUS_CODE: 400,
    }
} as const;

/**
 * Configuration Manager for the Mosaia SDK
 * 
 * Provides a single source of truth for configuration across the entire SDK.
 * This prevents configuration copies and mutations, ensuring consistency.
 * 
 * The ConfigurationManager implements the singleton pattern to ensure that
 * only one configuration instance exists throughout the application lifecycle.
 * 
 * @example
 * ```typescript
 * import { ConfigurationManager } from '@mosaia/mosaia-node-sdk';
 * 
 * // Get the singleton instance
 * const configManager = ConfigurationManager.getInstance();
 * 
 * // Initialize with user configuration
 * configManager.initialize({
 *   apiKey: 'your-api-key',
 *   apiURL: 'https://api.mosaia.ai'
 * });
 * 
 * // Access configuration anywhere in the SDK
 * const config = configManager.getConfig();
 * ```
 * 
 * @example
 * ```typescript
 * // Update specific configuration values
 * configManager.updateConfig('apiKey', 'new-api-key');
 * configManager.updateConfig('version', '2');
 * 
 * // Get read-only configuration
 * const readOnlyConfig = configManager.getReadOnlyConfig();
 * ```
 */
export class ConfigurationManager {
    /** Singleton instance of the ConfigurationManager */
    private static instance: ConfigurationManager;
    
    /** Current configuration object */
    private config: MosaiaConfig | null = null;
    
    /** Default configuration values */
    private readonly defaultConfig = DEFAULT_CONFIG;

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {}

    /**
     * Get the singleton instance of ConfigurationManager
     * 
     * Creates a new instance if one doesn't exist, otherwise returns
     * the existing instance.
     * 
     * @returns The singleton ConfigurationManager instance
     * 
     * @example
     * ```typescript
     * const configManager = ConfigurationManager.getInstance();
     * ```
     */
    public static getInstance(): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }

    /**
     * Initialize the configuration manager with user settings
     * 
     * Merges user-provided configuration with default values to create
     * a complete configuration object. This method should be called
     * before using any other ConfigurationManager methods.
     * 
     * @param userConfig - User-provided configuration options
     * 
     * @example
     * ```typescript
     * const configManager = ConfigurationManager.getInstance();
     * 
     * configManager.initialize({
     *   apiKey: 'your-api-key',
     *   apiURL: 'https://api.mosaia.ai',
     *   version: '1',
     *   clientId: 'your-client-id'
     * });
     * ```
     */
    public initialize(userConfig: Partial<MosaiaConfig>): void {
        const apiURL = userConfig.apiURL || this.defaultConfig.API.BASE_URL;
        const version = userConfig.version || this.defaultConfig.API.VERSION;

        this.config = {
            ...userConfig,
            apiURL,
            version
        } as MosaiaConfig;
    }

    /**
     * Get the current configuration
     * 
     * Returns the current configuration object. Throws an error if
     * configuration hasn't been initialized.
     * 
     * @returns The current configuration object
     * @throws {Error} When configuration hasn't been initialized
     * 
     * @example
     * ```typescript
     * const config = configManager.getConfig();
     * console.log(config.apiKey); // 'your-api-key'
     * console.log(config.apiURL); // 'https://api.mosaia.ai'
     * ```
     */
    public getConfig(): MosaiaConfig {
        if (!this.config) {
            throw new Error('Configuration not initialized. Call initialize() first.');
        }
        return this.config;
    }

    /**
     * Set the current configuration
     * 
     * Replaces the entire configuration object with a new one.
     * This method completely overwrites the existing configuration.
     * 
     * @param config - The new configuration object
     * 
     * @example
     * ```typescript
     * configManager.setConfig({
     *   apiKey: 'new-api-key',
     *   apiURL: 'https://api-staging.mosaia.ai',
     *   version: '2'
     * });
     * ```
     */
    public setConfig(config: MosaiaConfig): void {
        this.config = config;
    }

    /**
     * Get a read-only copy of the configuration
     * 
     * Returns a frozen copy of the configuration object to prevent
     * accidental modifications.
     * 
     * @returns A frozen copy of the configuration
     * 
     * @example
     * ```typescript
     * const readOnlyConfig = configManager.getReadOnlyConfig();
     * 
     * // This will throw an error in strict mode
     * // readOnlyConfig.apiKey = 'new-key'; // Error!
     * ```
     */
    public getReadOnlyConfig(): Readonly<MosaiaConfig> {
        return Object.freeze({ ...this.getConfig() });
    }

    /**
     * Update a specific configuration value
     * 
     * Updates a single configuration property while preserving all
     * other configuration values.
     * 
     * @param key - The configuration key to update
     * @param value - The new value for the configuration key
     * @throws {Error} When configuration hasn't been initialized
     * 
     * @example
     * ```typescript
     * // Update API key
     * configManager.updateConfig('apiKey', 'new-api-key');
     * 
     * // Update API URL
     * configManager.updateConfig('apiURL', 'https://api-staging.mosaia.ai');
     * 
     * // Update version
     * configManager.updateConfig('version', '2');
     * ```
     */
    public updateConfig<K extends keyof MosaiaConfig>(key: K, value: MosaiaConfig[K]): void {
        if (!this.config) {
            throw new Error('Configuration not initialized. Call initialize() first.');
        }
        this.config = { ...this.config, [key]: value };
    }

    /**
     * Get the API base URL with version
     * 
     * Constructs the full API URL by combining the base URL and version.
     * Falls back to default values if configuration is not set.
     * 
     * @returns The full API URL with version
     * 
     * @example
     * ```typescript
     * const apiUrl = configManager.getApiUrl();
     * console.log(apiUrl); // 'https://api.mosaia.ai/v1'
     * ```
     */
    public getApiUrl(): string {
        const config = this.getConfig();
        return `${config.apiURL || this.defaultConfig.API.BASE_URL}/v${config.version || this.defaultConfig.API.VERSION}`;
    }

    /**
     * Get the API key
     * 
     * Returns the current API key used for authentication.
     * 
     * @returns The API key, or undefined if not set
     * 
     * @example
     * ```typescript
     * const apiKey = configManager.getApiKey();
     * if (apiKey) {
     *   console.log('API key is configured');
     * } else {
     *   console.log('No API key configured');
     * }
     * ```
     */
    public getApiKey(): string | undefined {
        return this.getConfig().apiKey;
    }

    /**
     * Check if configuration is initialized
     * 
     * Returns true if the configuration has been initialized with
     * user settings, false otherwise.
     * 
     * @returns True if configuration has been initialized
     * 
     * @example
     * ```typescript
     * if (!configManager.isInitialized()) {
     *   configManager.initialize({
     *     apiKey: 'your-api-key'
     *   });
     * }
     * ```
     */
    public isInitialized(): boolean {
        return this.config !== null;
    }

    /**
     * Reset configuration to default
     * 
     * Clears the current configuration and resets the manager to
     * its uninitialized state.
     * 
     * @example
     * ```typescript
     * // Clear all configuration
     * configManager.reset();
     * 
     * // Configuration must be re-initialized
     * configManager.initialize({
     *   apiKey: 'new-api-key'
     * });
     * ```
     */
    public reset(): void {
        this.config = null;
    }
} 