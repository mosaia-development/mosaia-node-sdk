import { Wallet } from '../../models';
import { WalletInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/billing/wallet';
    this.apiClient = {
      POST: jest.fn(),
      PUT: jest.fn(),
      DELETE: jest.fn()
    };
    this.config = {
      apiKey: 'test-api-key',
      apiURL: 'https://api.mosaia.ai',
      version: '1'
    };
    this.update = jest.fn().mockImplementation((updates: any) => {
      this.data = { ...this.data, ...updates };
      Object.assign(this, updates);
    });
    this.getUri = jest.fn().mockReturnValue('/billing/wallet/123');
    this.save = jest.fn();
    this.delete = jest.fn();
    this.isActive = jest.fn().mockReturnValue(data.active !== false);
    this.toJSON = jest.fn().mockReturnValue(data);
    this.toAPIPayload = jest.fn().mockImplementation(() => {
      const payload = { ...this.data };
      delete payload.id;
      return payload;
    });
    
    // Set properties from data
    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
  })
}));

describe('Wallet Model', () => {
  let wallet: any;
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const walletData: Partial<WalletInterface> = {
      id: '123',
      org: 'org-123',
      balance: 1000.00,
      currency: 'USD',
      active: true
    };

    wallet = new Wallet(walletData);
    mockApiClient = wallet.apiClient;
  });

  describe('constructor', () => {
    it('should create Wallet instance with default URI', () => {
      const walletData: Partial<WalletInterface> = {
        org: 'org-123',
        balance: 1000.00,
        currency: 'USD'
      };

      const wallet = new Wallet(walletData);
      expect(wallet).toBeDefined();
      expect((wallet as any).uri).toBe('/billing/wallet');
    });

    it('should create Wallet instance with custom URI', () => {
      const walletData: Partial<WalletInterface> = {
        user: 'user-456',
        balance: 500.00,
        currency: 'USD'
      };

      const wallet = new Wallet(walletData, '/user/user-id/billing/wallet');
      expect(wallet).toBeDefined();
      expect((wallet as any).uri).toBe('/user/user-id/billing/wallet');
    });

    it('should set wallet properties from data', () => {
      const walletData: Partial<WalletInterface> = {
        org: 'org-123',
        balance: 1000.00,
        currency: 'USD'
      };

      const wallet = new Wallet(walletData);
      expect((wallet as any).org).toBe('org-123');
      expect((wallet as any).balance).toBe(1000.00);
      expect((wallet as any).currency).toBe('USD');
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(wallet.save).toBeDefined();
      expect(typeof wallet.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(wallet.delete).toBeDefined();
      expect(typeof wallet.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(wallet.update).toBeDefined();
      expect(typeof wallet.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(wallet.isActive).toBeDefined();
      expect(typeof wallet.isActive).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access wallet data properties', () => {
      expect((wallet as any).org).toBe('org-123');
      expect((wallet as any).balance).toBe(1000.00);
      expect((wallet as any).currency).toBe('USD');
    });

    it('should handle user-scoped wallet', () => {
      const userWallet = new Wallet({
        user: 'user-456',
        balance: 500.00,
        currency: 'USD'
      });

      expect((userWallet as any).user).toBe('user-456');
      expect((userWallet as any).balance).toBe(500.00);
      expect((userWallet as any).currency).toBe('USD');
    });

    it('should handle wallet with external_id', () => {
      const walletWithExternalId = new Wallet({
        org: 'org-123',
        balance: 1000.00,
        currency: 'USD',
        external_id: 'stripe_customer_123'
      });

      expect((walletWithExternalId as any).external_id).toBe('stripe_customer_123');
    });

    it('should handle wallet with extensors', () => {
      const walletWithExtensors = new Wallet({
        org: 'org-123',
        balance: 1000.00,
        currency: 'USD',
        extensors: {
          payment_method: 'credit_card',
          auto_reload: 'true'
        }
      });

      expect((walletWithExtensors as any).extensors).toEqual({
        payment_method: 'credit_card',
        auto_reload: 'true'
      });
    });
  });
});

