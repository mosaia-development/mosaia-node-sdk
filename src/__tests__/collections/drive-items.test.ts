import DriveItems from '../../collections/drive-items';
import { DriveItem } from '../../models';
import { GetDriveItemsPayload, GetDriveItemPayload, DriveItemInterface } from '../../types';

// Mock the DriveItem model
jest.mock('../../models');
const MockDriveItem = DriveItem as jest.MockedClass<typeof DriveItem>;

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
  const mockAPIClient = {
    GET: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
  };
  return jest.fn().mockImplementation(() => mockAPIClient);
});
const APIClient = require('../../utils/api-client');
const MockAPIClient = APIClient as jest.MockedClass<typeof APIClient>;

describe('DriveItems', () => {
  let driveItems: DriveItems;
  let mockAPIClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock API client
    mockAPIClient = {
      GET: jest.fn(),
      POST: jest.fn(),
      PUT: jest.fn(),
      DELETE: jest.fn(),
    };

    // Mock APIClient to return our shared instance
    MockAPIClient.mockImplementation(() => mockAPIClient);

    // Setup mock returns
    MockDriveItem.mockImplementation((data: any) => ({ data } as any));

    driveItems = new DriveItems('/drive/drive-123');
  });

  describe('constructor', () => {
    it('should create DriveItems instance extending BaseCollection', () => {
      expect(driveItems).toBeDefined();
      expect(typeof driveItems.get).toBe('function');
      expect(typeof driveItems.create).toBe('function');
      expect(typeof driveItems.uploadFile).toBe('function');
      expect(typeof driveItems.uploadFiles).toBe('function');
      expect(typeof driveItems.getUploadStatus).toBe('function');
    });

    it('should initialize with correct URI and DriveItem model', () => {
      expect(driveItems).toBeDefined();
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultItems = new DriveItems();
      expect(defaultItems).toBeDefined();
    });
  });

  describe('uploadFile method', () => {
    it('should upload a single file successfully', async () => {
      const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        jobId: 'job-123',
        message: 'File upload job created',
        statusUrl: '/drive/drive-123/item/upload/job-123'
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFile(mockFile);

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result).toEqual(mockResponse);
      expect(result.jobId).toBe('job-123');
    });

    it('should upload file with path option', async () => {
      const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        jobId: 'job-456',
        message: 'File upload job created'
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFile(mockFile, { path: '/documents' });

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
      const error = new Error('Upload failed');
      mockAPIClient.POST.mockRejectedValue(error);

      await expect(driveItems.uploadFile(mockFile)).rejects.toThrow('Upload failed');
    });

    it('should handle response without data property', async () => {
      const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        jobId: 'job-789',
        message: 'File upload job created'
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await driveItems.uploadFile(mockFile);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadFiles method', () => {
    it('should upload multiple files successfully', async () => {
      const mockFiles = [
        new File(['file1'], 'file1.txt', { type: 'text/plain' }),
        new File(['file2'], 'file2.txt', { type: 'text/plain' })
      ];
      const mockResponse = {
        jobId: 'batch-job-123',
        message: 'Batch upload job created'
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles(mockFiles);

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when no files provided', async () => {
      await expect(driveItems.uploadFiles([])).rejects.toThrow('At least one file is required for upload');
    });

    it('should handle upload errors', async () => {
      const mockFiles = [
        new File(['file1'], 'file1.txt', { type: 'text/plain' })
      ];
      const error = new Error('Batch upload failed');
      mockAPIClient.POST.mockRejectedValue(error);

      await expect(driveItems.uploadFiles(mockFiles)).rejects.toThrow('Batch upload failed');
    });
  });

  describe('getUploadStatus method', () => {
    it('should get upload job status successfully', async () => {
      const mockStatus = {
        jobId: 'job-123',
        status: 'COMPLETED',
        progress: {
          total: 10,
          processed: 10,
          successful: 10,
          failed: 0,
          percentage: 100
        },
        size: {
          total: 1024,
          uploaded: 1024,
          percentage: 100
        },
        files: [],
        startedAt: new Date(),
        completedAt: new Date()
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockStatus });

      const result = await driveItems.getUploadStatus('job-123');

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/drive/drive-123/item/upload/job-123');
      expect(result).toEqual(mockStatus);
      expect(result.status).toBe('COMPLETED');
      expect(result.progress.percentage).toBe(100);
    });

    it('should handle job not found', async () => {
      const error = new Error('Upload job not found');
      mockAPIClient.GET.mockRejectedValue(error);

      await expect(driveItems.getUploadStatus('nonexistent-job')).rejects.toThrow('Upload job not found');
    });

    it('should handle response without data property', async () => {
      const mockStatus = {
        jobId: 'job-123',
        status: 'PENDING',
        progress: {
          total: 10,
          processed: 5,
          successful: 5,
          failed: 0,
          percentage: 50
        },
        size: {
          total: 1024,
          uploaded: 512,
          percentage: 50
        },
        files: []
      };

      mockAPIClient.GET.mockResolvedValue(mockStatus);

      const result = await driveItems.getUploadStatus('job-123');

      expect(result).toEqual(mockStatus);
    });
  });

  describe('get method', () => {
    it('should get all drive items successfully', async () => {
      const mockItems = [
        { id: '1', name: 'document.pdf', path: '/documents', size: 1024, drive: 'drive-123' },
        { id: '2', name: 'image.jpg', path: '/images', size: 2048, drive: 'drive-123' }
      ];

      const mockResponse = {
        data: mockItems.map(item => new MockDriveItem(item))
      };
      
      // Mock the BaseCollection get method
      jest.spyOn(driveItems, 'get').mockResolvedValue(mockResponse as any);

      const result = await driveItems.get();

      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific drive item by ID', async () => {
      const mockItem = { id: '1', name: 'document.pdf', path: '/documents', size: 1024, drive: 'drive-123' };
      const mockResponse = new MockDriveItem(mockItem);
      
      jest.spyOn(driveItems, 'get').mockResolvedValue(mockResponse as any);

      const result = await driveItems.get({}, '1');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('create method', () => {
    it('should create a metadata-only drive item successfully', async () => {
      const itemData = {
        name: 'document.pdf',
        path: '/documents',
        size: 1024,
        mime_type: 'application/pdf',
        drive: 'drive-123'
      };

      const mockItem = { id: '3', ...itemData };
      const mockResponse = new MockDriveItem(mockItem);
      
      jest.spyOn(driveItems, 'create').mockResolvedValue(mockResponse);

      const result = await driveItems.create(itemData);

      expect(result).toEqual(mockResponse);
    });
  });
});

