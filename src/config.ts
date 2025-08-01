import { MosaiaConfig } from './types';

/**
 * Global configuration file for the Mosaia SDK
 */

export const DEFAULT_CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'https://api.mosaia.ai',
        VERSION: '1',
        CONTENT_TYPE: 'application/json',
    },

    // App Configuration
    APP: {
        URL: 'https://mosaia.ai',
    },

    // Authentication
    AUTH: {
        TOKEN_PREFIX: 'Bearer',
    },

    // Error Messages
    ERRORS: {
        UNKNOWN_ERROR: 'Unknown Error',
        DEFAULT_STATUS: 'UNKNOWN',
        DEFAULT_STATUS_CODE: 400,
    }
} as const;

/**
 * Configuration Manager for the Mosaia SDK
 * 
 * Provides a single source of truth for configuration across the entire SDK.
 * This prevents configuration copies and mutations, ensuring consistency.
 * 
 * @example
 * ```typescript
 * const configManager = ConfigurationManager.getInstance();
 * configManager.initialize({
 *   apiKey: 'your-api-key',
 *   apiURL: 'https://api.mosaia.ai'
 * });
 * 
 * // Access configuration anywhere in the SDK
 * const config = configManager.getConfig();
 * ```
 */
export class ConfigurationManager {
    private static instance: ConfigurationManager;
    private config: MosaiaConfig | null = null;
    private readonly defaultConfig = DEFAULT_CONFIG;

    private constructor() {}

    /**
     * Get the singleton instance of ConfigurationManager
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
     * @param userConfig - User-provided configuration
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
     * @returns The current configuration object
     * @throws Error if configuration hasn't been initialized
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
     * @param config - The new configuration object
     */
    public setConfig(config: MosaiaConfig): void {
        this.config = config;
    }

    /**
     * Get a read-only copy of the configuration
     * 
     * @returns A frozen copy of the configuration
     */
    public getReadOnlyConfig(): Readonly<MosaiaConfig> {
        return Object.freeze({ ...this.getConfig() });
    }

    /**
     * Update a specific configuration value
     * 
     * @param key - The configuration key to update
     * @param value - The new value
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
     * @returns The full API URL with version
     */
    public getApiUrl(): string {
        const config = this.getConfig();
        return `${config.apiURL || this.defaultConfig.API.BASE_URL}/v${config.version || this.defaultConfig.API.VERSION}`;
    }

    /**
     * Get the API key
     * 
     * @returns The API key
     */
    public getApiKey(): string | undefined {
        return this.getConfig().apiKey;
    }

    /**
     * Check if configuration is initialized
     * 
     * @returns True if configuration has been initialized
     */
    public isInitialized(): boolean {
        return this.config !== null;
    }

    /**
     * Reset configuration to default
     */
    public reset(): void {
        this.config = null;
    }
} 