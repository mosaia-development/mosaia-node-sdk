import Wallets from '../../collections/wallets';
import { BaseCollection } from '../../collections/base-collection';
import { Wallet } from '../../models';
import { GetWalletsPayload, GetWalletPayload, WalletInterface } from '../../types';

// Mock the BaseAPI
jest.mock('../../collections/base-collection', () => ({
      BaseCollection: jest.fn()
}));
const { BaseCollection: MockBaseCollection } = require('../../collections/base-collection');

// Mock the Wallet model
jest.mock('../../models');
const MockWallet = Wallet as jest.MockedClass<typeof Wallet>;

describe('Wallets', () => {
  let wallets: Wallets;
  let mockBaseAPI: jest.Mocked<BaseCollection<WalletInterface, Wallet, GetWalletsPayload, GetWalletPayload>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock BaseAPI instance
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    } as any;

    // Setup mock returns
    MockBaseCollection.mockImplementation(() => mockBaseAPI);
    MockWallet.mockImplementation((data: any) => ({ data } as any));

    wallets = new Wallets();
  });

  describe('constructor', () => {
    it('should create Wallets instance extending BaseCollection', () => {
      expect(wallets).toBeDefined();
      expect(typeof wallets.get).toBe('function');
      expect(typeof wallets.create).toBe('function');
    });

    it('should initialize with correct URI and Wallet model', () => {
      expect(MockBaseCollection).toHaveBeenCalledWith('/billing/wallet', Wallet);
    });

    it('should initialize with custom URI when provided', () => {
      const customWallets = new Wallets('/org/org-id');
      expect(MockBaseCollection).toHaveBeenCalledWith('/org/org-id/billing/wallet', Wallet);
    });

    it('should initialize with user-scoped URI', () => {
      const userWallets = new Wallets('/user/user-id');
      expect(MockBaseCollection).toHaveBeenCalledWith('/user/user-id/billing/wallet', Wallet);
    });
  });

  describe('get method', () => {
    it('should get wallet successfully', async () => {
      const mockWallet = { id: '1', org: 'org-1', balance: 1000.00, currency: 'USD' };
      const mockResponse = new MockWallet(mockWallet);
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await wallets.get();

      expect(mockBaseAPI.get).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
    });

    it('should get wallet with query parameters', async () => {
      const params = {
        org: 'org-123'
      };

      const mockWallet = { id: '1', org: 'org-123', balance: 1000.00, currency: 'USD' };
      const mockResponse = new MockWallet(mockWallet);
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await wallets.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create method', () => {
    it('should create a new wallet successfully', async () => {
      const walletData = {
        org: 'org-123',
        balance: 1000.00,
        currency: 'USD'
      };

      const mockWallet = { id: '3', ...walletData };
      const mockResponse = new MockWallet(mockWallet);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await wallets.create(walletData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(walletData);
      expect(result).toEqual(mockResponse);
    });

    it('should create user-scoped wallet', async () => {
      const walletData = {
        user: 'user-456',
        balance: 500.00,
        currency: 'USD'
      };

      const mockWallet = { id: '4', ...walletData };
      const mockResponse = new MockWallet(mockWallet);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await wallets.create(walletData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(walletData);
      expect(result).toEqual(mockResponse);
    });
  });
});

