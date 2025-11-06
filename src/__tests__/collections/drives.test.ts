import Drives from '../../collections/drives';
import { Drive } from '../../models';
import { GetDrivesPayload, GetDrivePayload, DriveInterface } from '../../types';

// Mock the Drive model
jest.mock('../../models');
const MockDrive = Drive as jest.MockedClass<typeof Drive>;

// Mock the BaseCollection
jest.mock('../../collections/base-collection');
const { BaseCollection } = require('../../collections/base-collection');
const MockBaseCollection = BaseCollection as jest.MockedClass<typeof BaseCollection>;

// Mock the ConfigurationManager
jest.mock('../../config', () => ({
  ConfigurationManager: {
    getInstance: jest.fn().mockReturnValue({
      getConfig: jest.fn().mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1',
      })
    })
  }
}));

// Mock the APIClient
jest.mock('../../utils/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
  }));
});

describe('Drives', () => {
  let drives: any;
  let mockGet: jest.MockedFunction<any>;
  let mockCreate: jest.MockedFunction<any>;
  let mockBaseAPI: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock returns
    MockDrive.mockImplementation((data: any) => ({ data } as any));

    // Setup BaseAPI mock
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    MockBaseCollection.mockImplementation(() => mockBaseAPI);

    drives = new Drives();
    
    // Get the mocked methods from the instance
    mockGet = drives.get;
    mockCreate = drives.create;
  });

  describe('constructor', () => {
    it('should create Drives instance extending BaseCollection', () => {
      expect(drives).toBeDefined();
      expect(typeof drives.get).toBe('function');
      expect(typeof drives.create).toBe('function');
    });

    it('should initialize with correct URI and Drive model', () => {
      expect(MockBaseCollection).toHaveBeenCalledWith('/drive', Drive);
    });

    it('should initialize with custom URI when provided', () => {
      const customDrives = new Drives('/api/v1');
      expect(MockBaseCollection).toHaveBeenCalledWith('/api/v1/drive', Drive);
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultDrives = new Drives();
      expect(MockBaseCollection).toHaveBeenCalledWith('/drive', Drive);
    });
  });

  describe('get method', () => {
    it('should get all drives successfully', async () => {
      const mockDrives = [
        { id: '1', name: 'Documents Drive', description: 'Personal documents' },
        { id: '2', name: 'Projects Drive', description: 'Project files' }
      ];

      const mockResponse = {
        data: mockDrives.map(drive => new MockDrive(drive))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await drives.get();

      expect(mockGet).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific drive by ID', async () => {
      const mockDrive = { id: '1', name: 'Documents Drive', description: 'Personal documents' };
      const mockResponse = new MockDrive(mockDrive);
      mockGet.mockResolvedValue(mockResponse);

      const result = await drives.get({}, '1');

      expect(mockGet).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get drives with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        q: 'documents',
        active: true,
        org: 'org-123'
      };

      const mockDrives = [
        { id: '1', name: 'Documents Drive', description: 'Personal documents' }
      ];

      const mockResponse = {
        data: mockDrives.map(drive => new MockDrive(drive))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await drives.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty drives list', async () => {
      const mockResponse = { data: [] };
      mockGet.mockResolvedValue(mockResponse);

      const result = await drives.get();

      expect(result).toEqual({ data: [] });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch drives');
      mockBaseAPI.get.mockRejectedValue(error);

      await expect(drives.get()).rejects.toThrow('Failed to fetch drives');
    });
  });

  describe('create method', () => {
    it('should create a new drive successfully', async () => {
      const driveData = {
        name: 'New Drive',
        description: 'A new drive for storage'
      };

      const mockDrive = { id: '3', ...driveData };
      const mockResponse = new MockDrive(mockDrive);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await drives.create(driveData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(driveData);
      expect(result).toEqual(mockResponse);
    });

    it('should create drive with minimal data', async () => {
      const driveData = {
        name: 'Minimal Drive'
      };

      const mockDrive = { id: '4', ...driveData };
      const mockResponse = new MockDrive(mockDrive);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await drives.create(driveData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(driveData);
      expect(result).toEqual(mockResponse);
    });

    it('should create drive with all optional fields', async () => {
      const driveData = {
        name: 'Full Drive',
        description: 'A fully configured drive',
        active: true,
        external_id: 'ext-drive-123'
      };

      const mockDrive = { id: '5', ...driveData };
      const mockResponse = new MockDrive(mockDrive);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await drives.create(driveData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(driveData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const driveData = {
        name: 'Invalid Drive'
      };

      const error = new Error('Validation failed');
      mockBaseAPI.create.mockRejectedValue(error);

      await expect(drives.create(driveData)).rejects.toThrow('Validation failed');
    });
  });

  describe('update method', () => {
    it('should update a drive successfully', async () => {
      const updates = {
        name: 'Updated Drive',
        description: 'Updated description'
      };

      const mockDrive = { id: '1', ...updates };
      const mockResponse = new MockDrive(mockDrive);
      mockBaseAPI.update.mockResolvedValue(mockResponse);

      const result = await drives.update('1', updates);

      expect(mockBaseAPI.update).toHaveBeenCalledWith('1', updates);
      expect(result).toEqual(mockResponse);
    });

    it('should handle update errors', async () => {
      const updates = { name: 'Updated Drive' };
      const error = new Error('Update failed');
      mockBaseAPI.update.mockRejectedValue(error);

      await expect(drives.update('1', updates)).rejects.toThrow('Update failed');
    });
  });

  describe('delete method', () => {
    it('should delete a drive successfully', async () => {
      mockBaseAPI.delete.mockResolvedValue(undefined);

      await drives.delete('1');

      expect(mockBaseAPI.delete).toHaveBeenCalledWith('1');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockBaseAPI.delete.mockRejectedValue(error);

      await expect(drives.delete('1')).rejects.toThrow('Delete failed');
    });
  });
});

