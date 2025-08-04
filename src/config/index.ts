/**
 * Configuration module exports for the Mosaia SDK
 * 
 * This module exports all configuration-related classes and constants
 * for managing SDK configuration and settings.
 * 
 * ## Available Exports
 * 
 * - **ConfigurationManager**: Singleton class for managing SDK configuration
 * - **DEFAULT_CONFIG**: Default configuration constants
 * 
 * @example
 * ```typescript
 * import { Config } from '@mosaia/mosaia-node-sdk';
 * 
 * // Initialize configuration
 * const configManager = Config.ConfigurationManager.getInstance();
 * configManager.initialize({
 *   apiKey: 'your-api-key',
 *   apiURL: 'https://api.mosaia.ai'
 * });
 * 
 * // Access default config
 * console.log(Config.DEFAULT_CONFIG.API.BASE_URL);
 * ```
 */

export { ConfigurationManager, DEFAULT_CONFIG } from '../config'; 