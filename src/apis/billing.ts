import APIClient from './api-client';
import { MosiaConfig, WalletInterface, MeterInterface, GetWalletsPayload, GetWalletPayload, GetMetersPayload, GetMeterPayload, APIResponse } from '../types';

/**
 * Billing API client for managing wallets and usage meters
 * 
 * This class provides methods for managing billing-related resources including
 * wallets (for tracking balances) and meters (for tracking usage). Supports
 * both organization and user-scoped billing operations.
 * 
 * @example
 * ```typescript
 * const billing = new Billing(config);
 * 
 * // Get all wallets
 * const wallets = await billing.getWallets();
 * 
 * // Get specific wallet
 * const wallet = await billing.getWallet('wallet-id');
 * 
 * // Create new wallet
 * const newWallet = await billing.createWallet({
 *   balance: 100.00,
 *   currency: 'USD',
 *   org: 'org-123'
 * });
 * 
 * // Get usage meters
 * const meters = await billing.getMeters({ type: 'api_calls' });
 * ```
 */
export default class Billing {
    private client: APIClient;

    /**
     * Creates a new Billing API client instance
     * 
     * @param config - Configuration object containing API settings
     */
    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Get all wallets with optional filtering and pagination
     * 
     * Retrieves a list of wallets from the platform with support for
     * filtering by organization or user, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of wallets to return
     * @param params.offset - Number of wallets to skip for pagination
     * @param params.org - Filter wallets by organization ID
     * @param params.user - Filter wallets by user ID
     * @returns Promise that resolves to a paginated list of wallets
     * 
     * @example
     * ```typescript
     * // Get all wallets
     * const allWallets = await billing.getWallets();
     * 
     * // Get wallets for specific organization
     * const orgWallets = await billing.getWallets({ 
     *   org: 'org-123',
     *   limit: 10 
     * });
     * 
     * // Get wallets for specific user
     * const userWallets = await billing.getWallets({ 
     *   user: 'user-456' 
     * });
     * ```
     */
    async getWallets(params?: {
        limit?: number;
        offset?: number;
        org?: string;
        user?: string;
    }): Promise<APIResponse<GetWalletsPayload>> {
        return this.client.GET<GetWalletsPayload>('/billing/wallet', params);
    }

    /**
     * Get a specific wallet by its ID
     * 
     * Retrieves detailed information about a single wallet from the platform.
     * 
     * @param id - The unique identifier of the wallet
     * @returns Promise that resolves to the wallet data
     * 
     * @example
     * ```typescript
     * const wallet = await billing.getWallet('wallet-123');
     * console.log('Balance:', wallet.data.balance);
     * console.log('Currency:', wallet.data.currency);
     * ```
     */
    async getWallet(id: string): Promise<APIResponse<GetWalletPayload>> {
        return this.client.GET<GetWalletPayload>(`/billing/wallet/${id}`);
    }

    /**
     * Create a new wallet
     * 
     * Creates a new wallet on the platform for tracking balances.
     * 
     * @param wallet - Wallet data for the new wallet (ID will be generated)
     * @param wallet.balance - Initial balance amount (required)
     * @param wallet.currency - Currency code (e.g., 'USD', 'EUR') (required)
     * @param wallet.org - Organization ID the wallet belongs to (optional)
     * @param wallet.user - User ID the wallet belongs to (optional)
     * @returns Promise that resolves to the created wallet data
     * 
     * @example
     * ```typescript
     * const newWallet = await billing.createWallet({
     *   balance: 100.00,
     *   currency: 'USD',
     *   org: 'org-123'
     * });
     * 
     * console.log('Created wallet ID:', newWallet.data.id);
     * ```
     */
    async createWallet(wallet: Omit<WalletInterface, 'id'>): Promise<APIResponse<GetWalletPayload>> {
        return this.client.POST<GetWalletPayload>('/billing/wallet', wallet);
    }

    /**
     * Update an existing wallet
     * 
     * Updates a wallet with the provided data. Only the provided fields
     * will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the wallet to update
     * @param wallet - Partial wallet data containing only the fields to update
     * @returns Promise that resolves to the updated wallet data
     * 
     * @example
     * ```typescript
     * // Update wallet balance
     * const updatedWallet = await billing.updateWallet('wallet-123', {
     *   balance: 150.00
     * });
     * 
     * // Update wallet currency
     * const updatedWallet = await billing.updateWallet('wallet-123', {
     *   currency: 'EUR'
     * });
     * ```
     */
    async updateWallet(id: string, wallet: Partial<WalletInterface>): Promise<APIResponse<GetWalletPayload>> {
        return this.client.PUT<GetWalletPayload>(`/billing/wallet/${id}`, wallet);
    }

    /**
     * Delete a wallet
     * 
     * Removes a wallet from the platform.
     * 
     * @param id - The unique identifier of the wallet to delete
     * @returns Promise that resolves when the wallet is successfully deleted
     * 
     * @example
     * ```typescript
     * await billing.deleteWallet('wallet-123');
     * console.log('Wallet deleted successfully');
     * ```
     */
    async deleteWallet(id: string): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/billing/wallet/${id}`);
    }

    /**
     * Get all meters with optional filtering and pagination
     * 
     * Retrieves a list of usage meters from the platform with support for
     * filtering by organization, user, or meter type, and pagination.
     * 
     * @param params - Optional parameters for filtering and pagination
     * @param params.limit - Maximum number of meters to return
     * @param params.offset - Number of meters to skip for pagination
     * @param params.org - Filter meters by organization ID
     * @param params.user - Filter meters by user ID
     * @param params.type - Filter meters by type (e.g., 'api_calls', 'storage')
     * @returns Promise that resolves to a paginated list of meters
     * 
     * @example
     * ```typescript
     * // Get all meters
     * const allMeters = await billing.getMeters();
     * 
     * // Get API call meters for specific organization
     * const apiMeters = await billing.getMeters({ 
     *   org: 'org-123',
     *   type: 'api_calls',
     *   limit: 20 
     * });
     * 
     * // Get storage meters for specific user
     * const storageMeters = await billing.getMeters({ 
     *   user: 'user-456',
     *   type: 'storage' 
     * });
     * ```
     */
    async getMeters(params?: {
        limit?: number;
        offset?: number;
        org?: string;
        user?: string;
        type?: string;
    }): Promise<APIResponse<GetMetersPayload>> {
        return this.client.GET<GetMetersPayload>('/billing/meter', params);
    }

    /**
     * Get a specific meter by its ID
     * 
     * Retrieves detailed information about a single usage meter from the platform.
     * 
     * @param id - The unique identifier of the meter
     * @returns Promise that resolves to the meter data
     * 
     * @example
     * ```typescript
     * const meter = await billing.getMeter('meter-123');
     * console.log('Meter type:', meter.data.type);
     * console.log('Value:', meter.data.value);
     * console.log('Metadata:', meter.data.metadata);
     * ```
     */
    async getMeter(id: string): Promise<APIResponse<GetMeterPayload>> {
        return this.client.GET<GetMeterPayload>(`/billing/meter/${id}`);
    }

    /**
     * Create a new meter
     * 
     * Creates a new usage meter on the platform for tracking consumption.
     * 
     * @param meter - Meter data for the new meter (ID will be generated)
     * @param meter.type - Type of meter (e.g., 'api_calls', 'storage') (required)
     * @param meter.value - Current value of the meter (required)
     * @param meter.org - Organization ID the meter belongs to (optional)
     * @param meter.user - User ID the meter belongs to (optional)
     * @param meter.metadata - Additional metadata for the meter (optional)
     * @returns Promise that resolves to the created meter data
     * 
     * @example
     * ```typescript
     * const newMeter = await billing.createMeter({
     *   type: 'api_calls',
     *   value: 1000,
     *   org: 'org-123',
     *   metadata: {
     *     endpoint: '/api/chat',
     *     model: 'gpt-4'
     *   }
     * });
     * 
     * console.log('Created meter ID:', newMeter.data.id);
     * ```
     */
    async createMeter(meter: Omit<MeterInterface, 'id'>): Promise<APIResponse<GetMeterPayload>> {
        return this.client.POST<GetMeterPayload>('/billing/meter', meter);
    }

    /**
     * Update an existing meter
     * 
     * Updates a meter with the provided data. Only the provided fields
     * will be updated; other fields remain unchanged.
     * 
     * @param id - The unique identifier of the meter to update
     * @param meter - Partial meter data containing only the fields to update
     * @returns Promise that resolves to the updated meter data
     * 
     * @example
     * ```typescript
     * // Update meter value
     * const updatedMeter = await billing.updateMeter('meter-123', {
     *   value: 1500
     * });
     * 
     * // Update meter metadata
     * const updatedMeter = await billing.updateMeter('meter-123', {
     *   metadata: {
     *     endpoint: '/api/chat',
     *     model: 'gpt-4',
     *     timestamp: new Date().toISOString()
     *   }
     * });
     * ```
     */
    async updateMeter(id: string, meter: Partial<MeterInterface>): Promise<APIResponse<GetMeterPayload>> {
        return this.client.PUT<GetMeterPayload>(`/billing/meter/${id}`, meter);
    }

    /**
     * Delete a meter
     * 
     * Removes a usage meter from the platform.
     * 
     * @param id - The unique identifier of the meter to delete
     * @returns Promise that resolves when the meter is successfully deleted
     * 
     * @example
     * ```typescript
     * await billing.deleteMeter('meter-123');
     * console.log('Meter deleted successfully');
     * ```
     */
    async deleteMeter(id: string): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/billing/meter/${id}`);
    }
} 