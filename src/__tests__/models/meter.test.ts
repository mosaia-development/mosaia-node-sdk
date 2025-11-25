import { Meter } from '../../models';
import { MeterInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/billing/usage';
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
    this.getUri = jest.fn().mockReturnValue('/billing/usage/123');
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

describe('Meter Model', () => {
  let meter: any;
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const meterData: Partial<MeterInterface> = {
      id: '123',
      org: 'org-123',
      type: 'api_calls',
      value: 1000,
      metadata: {
        service: 'ai-completion',
        model: 'gpt-4'
      },
      active: true
    };

    meter = new Meter(meterData);
    mockApiClient = meter.apiClient;
  });

  describe('constructor', () => {
    it('should create Meter instance with default URI', () => {
      const meterData: Partial<MeterInterface> = {
        org: 'org-123',
        type: 'api_calls',
        value: 1000
      };

      const meter = new Meter(meterData);
      expect(meter).toBeDefined();
      expect((meter as any).uri).toBe('/billing/usage');
    });

    it('should create Meter instance with custom URI', () => {
      const meterData: Partial<MeterInterface> = {
        user: 'user-456',
        type: 'storage',
        value: 5000
      };

      const meter = new Meter(meterData, '/user/user-id/billing/usage');
      expect(meter).toBeDefined();
      expect((meter as any).uri).toBe('/user/user-id/billing/usage');
    });

    it('should set meter properties from data', () => {
      const meterData: Partial<MeterInterface> = {
        org: 'org-123',
        type: 'api_calls',
        value: 1000
      };

      const meter = new Meter(meterData);
      expect((meter as any).org).toBe('org-123');
      expect((meter as any).type).toBe('api_calls');
      expect((meter as any).value).toBe(1000);
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(meter.save).toBeDefined();
      expect(typeof meter.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(meter.delete).toBeDefined();
      expect(typeof meter.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(meter.update).toBeDefined();
      expect(typeof meter.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(meter.isActive).toBeDefined();
      expect(typeof meter.isActive).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access meter data properties', () => {
      expect((meter as any).org).toBe('org-123');
      expect((meter as any).type).toBe('api_calls');
      expect((meter as any).value).toBe(1000);
      expect((meter as any).metadata).toEqual({
        service: 'ai-completion',
        model: 'gpt-4'
      });
    });

    it('should handle user-scoped meter', () => {
      const userMeter = new Meter({
        user: 'user-456',
        type: 'storage',
        value: 5000
      });

      expect((userMeter as any).user).toBe('user-456');
      expect((userMeter as any).type).toBe('storage');
      expect((userMeter as any).value).toBe(5000);
    });

    it('should handle meter with metadata', () => {
      const meterWithMetadata = new Meter({
        org: 'org-123',
        type: 'compute',
        value: 2000,
        metadata: {
          unit: 'hours',
          period: 'monthly',
          service: 'gpu-compute'
        }
      });

      expect((meterWithMetadata as any).metadata).toEqual({
        unit: 'hours',
        period: 'monthly',
        service: 'gpu-compute'
      });
    });
  });
});

