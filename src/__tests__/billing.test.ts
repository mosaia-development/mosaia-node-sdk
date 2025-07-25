import Billing from '../apis/billing';
import { MosiaConfig, WalletInterface, MeterInterface } from '../types';

// Mock the APIClient
jest.mock('../apis/api-client');

describe('Billing API', () => {
  let billing: Billing;
  const mockConfig: MosiaConfig = {
    apiKey: 'test-api-key',
    apiURL: 'https://api.test.com/v1',
    version: '1'
  };

  beforeEach(() => {
    billing = new Billing(mockConfig);
  });

  describe('Constructor', () => {
    it('should create a Billing instance', () => {
      expect(billing).toBeInstanceOf(Billing);
    });
  });

  describe('Wallet operations', () => {
    describe('getWallets', () => {
      it('should call GET with wallet parameters', async () => {
        const mockResponse = {
          data: {
            data: [
              { id: '1', balance: 100.00, currency: 'USD', org: 'org-id' }
            ],
            paging: { limit: 10, offset: 0, total: 1 }
          },
          status: 200
        };

        const mockClient = {
          GET: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const params = { limit: 10, offset: 0, org: 'org-id', user: 'user-id' };
        const result = await billing.getWallets(params);

        expect(mockClient.GET).toHaveBeenCalledWith('/billing/wallet', params);
        expect(result).toEqual(mockResponse);
      });

      it('should call GET without parameters', async () => {
        const mockResponse = {
          data: {
            data: [
              { id: '1', balance: 100.00, currency: 'USD', org: 'org-id' }
            ],
            paging: { limit: 10, offset: 0, total: 1 }
          },
          status: 200
        };

        const mockClient = {
          GET: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const result = await billing.getWallets();

        expect(mockClient.GET).toHaveBeenCalledWith('/billing/wallet', undefined);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getWallet', () => {
      it('should call GET with wallet ID', async () => {
        const mockResponse = {
          data: {
            data: { id: '1', balance: 100.00, currency: 'USD', org: 'org-id' }
          },
          status: 200
        };

        const mockClient = {
          GET: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const result = await billing.getWallet('1');

        expect(mockClient.GET).toHaveBeenCalledWith('/billing/wallet/1');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('createWallet', () => {
      it('should call POST with wallet data', async () => {
        const walletData: Omit<WalletInterface, 'id'> = {
          balance: 100.00,
          currency: 'USD',
          org: 'org-id'
        };

        const mockResponse = {
          data: {
            data: { id: '2', ...walletData }
          },
          status: 201
        };

        const mockClient = {
          POST: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const result = await billing.createWallet(walletData);

        expect(mockClient.POST).toHaveBeenCalledWith('/billing/wallet', walletData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateWallet', () => {
      it('should call PUT with wallet ID and update data', async () => {
        const updateData = {
          balance: 150.00
        };

        const mockResponse = {
          data: {
            data: { id: '1', balance: 150.00, currency: 'USD', org: 'org-id' }
          },
          status: 200
        };

        const mockClient = {
          PUT: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const result = await billing.updateWallet('1', updateData);

        expect(mockClient.PUT).toHaveBeenCalledWith('/billing/wallet/1', updateData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteWallet', () => {
      it('should call DELETE with wallet ID', async () => {
        const mockResponse = {
          data: null,
          status: 204
        };

        const mockClient = {
          DELETE: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const result = await billing.deleteWallet('1');

        expect(mockClient.DELETE).toHaveBeenCalledWith('/billing/wallet/1');
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Meter operations', () => {
    describe('getMeters', () => {
      it('should call GET with meter parameters', async () => {
        const mockResponse = {
          data: {
            data: [
              { id: '1', type: 'api_calls', value: 1000, org: 'org-id' }
            ],
            paging: { limit: 10, offset: 0, total: 1 }
          },
          status: 200
        };

        const mockClient = {
          GET: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const params = { limit: 10, offset: 0, org: 'org-id', user: 'user-id', type: 'api_calls' };
        const result = await billing.getMeters(params);

        expect(mockClient.GET).toHaveBeenCalledWith('/billing/meter', params);
        expect(result).toEqual(mockResponse);
      });

      it('should call GET without parameters', async () => {
        const mockResponse = {
          data: {
            data: [
              { id: '1', type: 'api_calls', value: 1000, org: 'org-id' }
            ],
            paging: { limit: 10, offset: 0, total: 1 }
          },
          status: 200
        };

        const mockClient = {
          GET: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const result = await billing.getMeters();

        expect(mockClient.GET).toHaveBeenCalledWith('/billing/meter', undefined);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getMeter', () => {
      it('should call GET with meter ID', async () => {
        const mockResponse = {
          data: {
            data: { id: '1', type: 'api_calls', value: 1000, org: 'org-id' }
          },
          status: 200
        };

        const mockClient = {
          GET: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const result = await billing.getMeter('1');

        expect(mockClient.GET).toHaveBeenCalledWith('/billing/meter/1');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('createMeter', () => {
      it('should call POST with meter data', async () => {
        const meterData: Omit<MeterInterface, 'id'> = {
          type: 'api_calls',
          value: 1000,
          org: 'org-id',
          metadata: { endpoint: '/v1/chat/completions' }
        };

        const mockResponse = {
          data: {
            data: { id: '2', ...meterData }
          },
          status: 201
        };

        const mockClient = {
          POST: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const result = await billing.createMeter(meterData);

        expect(mockClient.POST).toHaveBeenCalledWith('/billing/meter', meterData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateMeter', () => {
      it('should call PUT with meter ID and update data', async () => {
        const updateData = {
          value: 1500
        };

        const mockResponse = {
          data: {
            data: { id: '1', type: 'api_calls', value: 1500, org: 'org-id' }
          },
          status: 200
        };

        const mockClient = {
          PUT: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const result = await billing.updateMeter('1', updateData);

        expect(mockClient.PUT).toHaveBeenCalledWith('/billing/meter/1', updateData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteMeter', () => {
      it('should call DELETE with meter ID', async () => {
        const mockResponse = {
          data: null,
          status: 204
        };

        const mockClient = {
          DELETE: jest.fn().mockResolvedValue(mockResponse)
        };

        (billing as any).client = mockClient;

        const result = await billing.deleteMeter('1');

        expect(mockClient.DELETE).toHaveBeenCalledWith('/billing/meter/1');
        expect(result).toEqual(mockResponse);
      });
    });
  });
}); 