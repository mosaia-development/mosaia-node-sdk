import Meters from '../../collections/meters';
import { BaseCollection } from '../../collections/base-collection';
import { Meter } from '../../models';
import { GetMetersPayload, GetMeterPayload, MeterInterface } from '../../types';

// Mock the BaseAPI
jest.mock('../../collections/base-collection', () => ({
      BaseCollection: jest.fn()
}));
const { BaseCollection: MockBaseCollection } = require('../../collections/base-collection');

// Mock the Meter model
jest.mock('../../models');
const MockMeter = Meter as jest.MockedClass<typeof Meter>;

describe('Meters', () => {
  let meters: Meters;
  let mockBaseAPI: jest.Mocked<BaseCollection<MeterInterface, Meter, GetMetersPayload, GetMeterPayload>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock BaseAPI instance
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    } as any;

    // Setup mock returns
    MockBaseCollection.mockImplementation(() => mockBaseAPI);
    MockMeter.mockImplementation((data: any) => ({ data } as any));

    meters = new Meters();
  });

  describe('constructor', () => {
    it('should create Meters instance extending BaseCollection', () => {
      expect(meters).toBeDefined();
      expect(typeof meters.get).toBe('function');
      expect(typeof meters.create).toBe('function');
    });

    it('should initialize with correct URI and Meter model', () => {
      expect(MockBaseCollection).toHaveBeenCalledWith('/billing/usage', Meter);
    });

    it('should initialize with custom URI when provided', () => {
      const customMeters = new Meters('/org/org-id');
      expect(MockBaseCollection).toHaveBeenCalledWith('/org/org-id/billing/usage', Meter);
    });

    it('should initialize with user-scoped URI', () => {
      const userMeters = new Meters('/user/user-id');
      expect(MockBaseCollection).toHaveBeenCalledWith('/user/user-id/billing/usage', Meter);
    });
  });

  describe('get method', () => {
    it('should get all meters successfully', async () => {
      const mockMeters = [
        { id: '1', org: 'org-1', type: 'api_calls', value: 1000 },
        { id: '2', org: 'org-1', type: 'storage', value: 5000 }
      ];

      const mockResponse = {
        data: mockMeters.map(meter => new MockMeter(meter))
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await meters.get();

      expect(mockBaseAPI.get).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific meter by ID', async () => {
      const mockMeter = { id: '1', org: 'org-1', type: 'api_calls', value: 1000 };
      const mockResponse = new MockMeter(mockMeter);
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await meters.get({}, '1');

      expect(mockBaseAPI.get).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get meters with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        type: 'api_calls',
        org: 'org-123'
      };

      const mockMeters = [
        { id: '1', org: 'org-123', type: 'api_calls', value: 1000 }
      ];

      const mockResponse = {
        data: mockMeters.map(meter => new MockMeter(meter))
      };
      mockBaseAPI.get.mockResolvedValue(mockResponse as any);

      const result = await meters.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create method', () => {
    it('should create a new meter successfully', async () => {
      const meterData = {
        org: 'org-123',
        type: 'api_calls',
        value: 1000,
        metadata: {
          service: 'ai-completion',
          model: 'gpt-4'
        }
      };

      const mockMeter = { id: '3', ...meterData };
      const mockResponse = new MockMeter(mockMeter);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await meters.create(meterData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(meterData);
      expect(result).toEqual(mockResponse);
    });

    it('should create user-scoped meter', async () => {
      const meterData = {
        user: 'user-456',
        type: 'storage',
        value: 5000
      };

      const mockMeter = { id: '4', ...meterData };
      const mockResponse = new MockMeter(mockMeter);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await meters.create(meterData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(meterData);
      expect(result).toEqual(mockResponse);
    });
  });
});

