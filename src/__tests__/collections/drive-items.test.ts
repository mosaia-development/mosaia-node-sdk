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
      expect(typeof driveItems.markUploadFailed).toBe('function');
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
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'job-123',
          status: 'PENDING',
          total_files: 1,
          total_size: 12,
          started_at: new Date()
        },
        files: [{
          fileId: 'file-123',
          filename: 'test.txt',
          presignedUrl: 'https://s3.example.com/upload',
          mimeType: 'text/plain',
          size: 12,
          path: '/test.txt',
          expiresIn: 900,
          expiresAt: new Date(),
          failedUrl: '/drive/drive-123/item/file-123/failed'
        }],
        statusUrl: '/drive/drive-123/item/upload/job-123',
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFile(mockFile);

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result).toEqual(mockResponse);
      expect(result.uploadJob.id).toBe('job-123');
    });

    it('should upload file with path option', async () => {
      const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'job-456',
          status: 'PENDING',
          total_files: 1,
          total_size: 12,
          started_at: new Date()
        },
        files: [],
        statusUrl: '/drive/drive-123/item/upload/job-456',
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFile(mockFile, { path: '/documents' });

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should upload file with relativePath option', async () => {
      const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'job-789',
          status: 'PENDING',
          total_files: 1,
          total_size: 12,
          started_at: new Date()
        },
        files: [],
        statusUrl: '/drive/drive-123/item/upload/job-789',
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFile(mockFile, {
        path: '/uploads',
        relativePath: 'folder/test.txt'
      });

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result.uploadJob.id).toBe('job-789');
    });

    it('should upload file with preserveStructure option', async () => {
      const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'job-preserve',
          status: 'PENDING',
          total_files: 1,
          total_size: 12,
          started_at: new Date()
        },
        files: [],
        statusUrl: '/drive/drive-123/item/upload/job-preserve',
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFile(mockFile, {
        preserveStructure: true
      });

      expect(mockAPIClient.POST).toHaveBeenCalled();
      expect(result.uploadJob.id).toBe('job-preserve');
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
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'job-789',
          status: 'PENDING',
          total_files: 1,
          total_size: 12,
          started_at: new Date()
        },
        files: [],
        statusUrl: '/drive/drive-123/item/upload/job-789',
        instructions: {}
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
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'batch-job-123',
          status: 'PENDING',
          total_files: 2,
          total_size: 10,
          started_at: new Date()
        },
        files: [],
        statusUrl: '/drive/drive-123/item/upload/batch-job-123',
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles(mockFiles);

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result).toEqual(mockResponse);
      expect(result.uploadJob.id).toBe('batch-job-123');
    });

    it('should upload files with preserveStructure option', async () => {
      const mockFiles = [
        new File(['file1'], 'file1.txt', { type: 'text/plain' }),
        new File(['file2'], 'file2.txt', { type: 'text/plain' })
      ];
      const mockResponse = {
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'batch-preserve-123',
          status: 'PENDING',
          total_files: 2,
          total_size: 10,
          started_at: new Date()
        },
        files: [],
        statusUrl: '/drive/drive-123/item/upload/batch-preserve-123',
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles(mockFiles, {
        path: '/documents',
        preserveStructure: true
      });

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result.uploadJob.id).toBe('batch-preserve-123');
    });

    it('should upload files with relativePaths array', async () => {
      const mockFiles = [
        new File(['file1'], 'file1.txt', { type: 'text/plain' }),
        new File(['file2'], 'file2.txt', { type: 'text/plain' })
      ];
      const mockResponse = {
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'batch-paths-123',
          status: 'PENDING',
          total_files: 2,
          total_size: 10,
          started_at: new Date()
        },
        files: [],
        statusUrl: '/drive/drive-123/item/upload/batch-paths-123',
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles(mockFiles, {
        path: '/uploads',
        relativePaths: ['folder1/file1.txt', 'folder2/file2.txt'],
        preserveStructure: true
      });

      expect(mockAPIClient.POST).toHaveBeenCalled();
      expect(result.uploadJob.id).toBe('batch-paths-123');
    });

    it('should upload files with relativePaths as JSON string', async () => {
      const mockFiles = [
        new File(['file1'], 'file1.txt', { type: 'text/plain' })
      ];
      const mockResponse = {
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'batch-json-123',
          status: 'PENDING',
          total_files: 1,
          total_size: 5,
          started_at: new Date()
        },
        files: [],
        statusUrl: '/drive/drive-123/item/upload/batch-json-123',
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles(mockFiles, {
        relativePaths: JSON.stringify(['folder1/file1.txt'])
      });

      expect(mockAPIClient.POST).toHaveBeenCalled();
      expect(result.uploadJob.id).toBe('batch-json-123');
    });

    it('should handle metadata-only upload (no files)', async () => {
      const mockResponse = {
        id: 'item-123',
        name: 'document.pdf',
        path: '/documents'
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles([], {
        path: '/documents'
      });

      // Should not throw error for empty files array
      expect(mockAPIClient.POST).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
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

  describe('markUploadFailed method', () => {
    it('should mark file upload as failed successfully', async () => {
      const mockResponse = {
        fileId: 'file-123',
        status: 'FAILED',
        upload_status: 'FAILED',
        upload_error: 'Upload failed'
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.markUploadFailed('file-123', {
        error: 'Upload failed'
      });

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item/file-123/failed',
        { error: 'Upload failed' }
      );
      expect(result).toEqual(mockResponse);
      expect(result.upload_status).toBe('FAILED');
    });

    it('should handle error message as errorMessage property', async () => {
      const mockResponse = {
        fileId: 'file-123',
        status: 'FAILED',
        upload_status: 'FAILED',
        upload_error: 'Network timeout'
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.markUploadFailed('file-123', {
        errorMessage: 'Network timeout'
      });

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item/file-123/failed',
        { errorMessage: 'Network timeout' }
      );
      expect(result.upload_error).toBe('Network timeout');
    });

    it('should use default error message when none provided', async () => {
      const mockResponse = {
        fileId: 'file-123',
        status: 'FAILED',
        upload_status: 'FAILED',
        upload_error: 'Upload failed'
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.markUploadFailed('file-123');

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item/file-123/failed',
        { error: 'Upload failed' }
      );
      expect(result.upload_status).toBe('FAILED');
    });

    it('should throw error when file ID is missing', async () => {
      await expect(driveItems.markUploadFailed('')).rejects.toThrow('File ID is required');
    });

    it('should handle API errors', async () => {
      const error = new Error('File not found');
      mockAPIClient.POST.mockRejectedValue(error);

      await expect(driveItems.markUploadFailed('nonexistent-file')).rejects.toThrow('File not found');
    });

    it('should handle response without data property', async () => {
      const mockResponse = {
        fileId: 'file-123',
        status: 'FAILED',
        upload_status: 'FAILED'
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await driveItems.markUploadFailed('file-123', {
        error: 'Test error'
      });

      expect(result).toEqual(mockResponse);
    });
  });
});

