import {
    WalletInterface,
    GetWalletsPayload,
    GetWalletPayload
} from '../types';
import { Wallet } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Wallets API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing digital wallets in the Mosaia platform.
 * Wallets manage user and organization balances, payment methods, and financial
 * transactions. Wallets can be associated with either organizations or users.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve wallets with filtering and pagination
 * - Create new wallets
 * - Update existing wallet configurations
 * - Delete wallets
 * - Manage organization and user associations
 * - Handle balance and payment operations
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const wallets = mosaia.wallets;
 * 
 * // Get wallet (typically returns single wallet for org/user)
 * const wallet = await wallets.get();
 * 
 * // Update wallet balance
 * const updatedWallet = await wallets.create({
 *   org: 'org-id',
 *   balance: 1000.00,
 *   currency: 'USD'
 * });
 * ```
 * 
 * @extends BaseCollection<WalletInterface, Wallet, GetWalletsPayload, GetWalletPayload>
 */
export default class Wallets extends BaseCollection<
    WalletInterface,
    Wallet,
    GetWalletsPayload,
    GetWalletPayload
> {
    /**
     * Creates a new Wallets API client instance
     * 
     * Initializes the wallets client with the appropriate endpoint URI
     * and model class for handling wallet operations.
     * 
     * The constructor sets up the API endpoint to `/billing/wallet` (or `${uri}/billing/wallet` if a base URI is provided),
     * which corresponds to the Mosaia API's wallets endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/billing/wallet`.
     *              If not provided, defaults to `/billing/wallet`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/billing/wallet)
     * const wallets = new Wallets();
     * 
     * // Create with custom base URI (e.g., for org-scoped access)
     * const wallets = new Wallets('/org/org-id');
     * // This will use endpoint: /org/org-id/billing/wallet
     * 
     * // Create for user-scoped access
     * const userWallets = new Wallets('/user/user-id');
     * // This will use endpoint: /user/user-id/billing/wallet
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/billing/wallet`, Wallet);
    }
}

