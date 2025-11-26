import { WalletInterface } from '../types';
import { BaseModel } from './base';

/**
 * Wallet class for managing digital wallets and payment balances
 * 
 * This class represents a digital wallet in the Mosaia platform, which manages
 * user and organization balances, payment methods, and financial transactions.
 * Wallets can be associated with either organizations or users.
 * 
 * Features:
 * - Balance management
 * - Payment method handling
 * - Transaction tracking
 * - Organization and user associations
 * - Currency support
 * 
 * @remarks
 * Digital wallets are crucial for:
 * - Payment processing
 * - Balance tracking
 * - Billing and invoicing
 * - Subscription management
 * - Financial transactions
 * 
 * @example
 * Basic wallet access:
 * ```typescript
 * import { Wallet } from 'mosaia-node-sdk';
 * 
 * // Get wallet for an organization
 * const wallet = new Wallet({
 *   org: 'org-id',
 *   balance: 100.00,
 *   currency: 'USD'
 * });
 * 
 * await wallet.save();
 * ```
 * 
 * @example
 * User wallet:
 * ```typescript
 * // Get wallet for a user
 * const userWallet = new Wallet({
 *   user: 'user-id',
 *   balance: 50.00,
 *   currency: 'USD'
 * });
 * 
 * await userWallet.save();
 * ```
 * 
 * @extends BaseModel<WalletInterface>
 * @category Models
 */
export default class Wallet extends BaseModel<WalletInterface> {
    /**
     * Creates a new Wallet instance
     * 
     * Initializes a digital wallet with the provided configuration data.
     * Wallets manage balances and payment methods for organizations or users.
     * 
     * @param data - Configuration data including:
     *               - org: Organization ID (optional, if org-scoped)
     *               - user: User ID (optional, if user-scoped)
     *               - balance: Current balance amount
     *               - currency: Currency code (e.g., 'USD', 'EUR')
     *               - external_id: External payment system ID
     * @param uri - Optional custom URI path for the wallet endpoint
     * 
     * @example
     * Organization wallet:
     * ```typescript
     * const wallet = new Wallet({
     *   org: 'org-123',
     *   balance: 1000.00,
     *   currency: 'USD'
     * });
     * ```
     * 
     * @example
     * User wallet with external ID:
     * ```typescript
     * const wallet = new Wallet({
     *   user: 'user-456',
     *   balance: 500.00,
     *   currency: 'USD',
     *   external_id: 'stripe_customer_123'
     * }, '/user/billing/wallet');
     * ```
     */
    constructor(data: Partial<WalletInterface>, uri?: string) {
        super(data, uri || '/billing/wallet');
    }
}

