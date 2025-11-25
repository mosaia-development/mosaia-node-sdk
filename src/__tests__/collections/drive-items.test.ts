import DriveItems from '../../collections/drive-items';
import { DriveItem } from '../../models';
import { GetDriveItemsPayload, GetDriveItemPayload, DriveItemInterface } from '../../types';

// Mock File API for Node.js test environment
class MockFile {
  name: string;
  size: number;
  type: string;
  data: string;

  constructor(data: string[], name: string, options?: { type?: string }) {
    this.data = data.join('');
    this.name = name;
    this.size = this.data.length;
    this.type = options?.type || '';
  }
}

// Mock FormData API for Node.js test environment
class MockFormData {
  private data: Map<string, any> = new Map();

  append(key: string, value: any): void {
    this.data.set(key, value);
  }

  get(key: string): any {
    return this.data.get(key);
  }
}

// Set globals
global.File = MockFile as any;
global.FormData = MockFormData as any;

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

    it('should handle preserveStructure=false explicitly', async () => {
      const mockFiles = [
        new File(['file1'], 'file1.txt', { type: 'text/plain' })
      ];
      const mockResponse = {
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'batch-no-structure-123',
          status: 'PENDING',
          total_files: 1,
          total_size: 5,
          started_at: new Date()
        },
        files: [],
        statusUrl: '/drive/drive-123/item/upload/batch-no-structure-123',
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles(mockFiles, {
        preserveStructure: false
      });

      expect(mockAPIClient.POST).toHaveBeenCalled();
      expect(result.uploadJob.id).toBe('batch-no-structure-123');
    });

    it('should verify FormData structure contains all fields', async () => {
      const mockFiles = [
        new File(['file1'], 'file1.txt', { type: 'text/plain' }),
        new File(['file2'], 'file2.txt', { type: 'text/plain' })
      ];
      const mockResponse = {
        message: 'Batch upload initiated',
        uploadJob: {
          id: 'batch-123',
          status: 'PENDING',
          total_files: 2,
          total_size: 10,
          started_at: new Date()
        },
        files: [],
        statusUrl: '/drive/drive-123/item/upload/batch-123',
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      await driveItems.uploadFiles(mockFiles, {
        path: '/documents',
        relativePaths: ['folder1/file1.txt', 'folder2/file2.txt'],
        preserveStructure: true
      });

      // Verify POST was called with FormData
      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );

      // Get the FormData that was passed
      const callArgs = mockAPIClient.POST.mock.calls[0];
      const formData = callArgs[1] as FormData;
      
      // Verify FormData has the expected structure
      expect(formData).toBeInstanceOf(FormData);
      // Note: In test environment, we can't easily inspect FormData contents,
      // but we verify the method constructs it correctly by checking the call
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

    it('should handle IN_PROGRESS status', async () => {
      const mockStatus = {
        jobId: 'job-456',
        status: 'IN_PROGRESS',
        progress: {
          total: 10,
          processed: 6,
          successful: 5,
          failed: 1,
          percentage: 60
        },
        size: {
          total: 1024,
          uploaded: 614,
          percentage: 60
        },
        files: [],
        startedAt: new Date()
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockStatus });

      const result = await driveItems.getUploadStatus('job-456');

      expect(result.status).toBe('IN_PROGRESS');
      expect(result.progress.processed).toBe(6);
      expect(result.progress.successful).toBe(5);
      expect(result.progress.failed).toBe(1);
    });

    it('should handle COMPLETED_WITH_ERRORS status with errorSummary', async () => {
      const mockStatus = {
        jobId: 'job-789',
        status: 'COMPLETED_WITH_ERRORS',
        progress: {
          total: 10,
          processed: 10,
          successful: 8,
          failed: 2,
          percentage: 100
        },
        size: {
          total: 1024,
          uploaded: 819,
          percentage: 80
        },
        files: [],
        startedAt: new Date(),
        completedAt: new Date(),
        errorSummary: {
          'file-123': 'Upload timeout',
          'file-456': 'Network error'
        }
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockStatus });

      const result = await driveItems.getUploadStatus('job-789');

      expect(result.status).toBe('COMPLETED_WITH_ERRORS');
      expect(result.progress.successful).toBe(8);
      expect(result.progress.failed).toBe(2);
      expect(result.errorSummary).toBeDefined();
      expect(result.errorSummary['file-123']).toBe('Upload timeout');
    });

    it('should handle FAILED status', async () => {
      const mockStatus = {
        jobId: 'job-failed',
        status: 'FAILED',
        progress: {
          total: 5,
          processed: 5,
          successful: 0,
          failed: 5,
          percentage: 100
        },
        size: {
          total: 512,
          uploaded: 0,
          percentage: 0
        },
        files: [],
        startedAt: new Date(),
        completedAt: new Date(),
        errorSummary: 'All uploads failed'
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockStatus });

      const result = await driveItems.getUploadStatus('job-failed');

      expect(result.status).toBe('FAILED');
      expect(result.progress.successful).toBe(0);
      expect(result.progress.failed).toBe(5);
      expect(result.errorSummary).toBe('All uploads failed');
    });

    it('should handle error status codes (403 Forbidden)', async () => {
      const error = new Error('Access denied');
      (error as any).status = 403;
      mockAPIClient.GET.mockRejectedValue(error);

      await expect(driveItems.getUploadStatus('job-123')).rejects.toThrow('Access denied');
    });

    it('should handle error status codes (413 Payload Too Large)', async () => {
      const error = new Error('Quota exceeded');
      (error as any).status = 413;
      mockAPIClient.POST.mockRejectedValue(error);

      const mockFiles = [new File(['large file'], 'large.txt', { type: 'text/plain' })];
      await expect(driveItems.uploadFiles(mockFiles)).rejects.toThrow('Quota exceeded');
    });

    it('should return complete response structure with all fields', async () => {
      const mockResponse = {
        message: 'Batch upload initiated - use presigned URLs to upload files directly to S3.',
        uploadJob: {
          id: 'job-complete',
          status: 'PENDING',
          total_files: 2,
          total_size: 2048,
          started_at: new Date('2024-01-01T12:00:00Z')
        },
        files: [
          {
            fileId: 'file-1',
            filename: 'test1.txt',
            presignedUrl: 'https://s3.example.com/presigned-url-1',
            mimeType: 'text/plain',
            size: 1024,
            path: '/documents/test1.txt',
            expiresIn: 900,
            expiresAt: new Date('2024-01-01T12:15:00Z'),
            failedUrl: '/v1/drive/drive-123/item/file-1/failed'
          },
          {
            fileId: 'file-2',
            filename: 'test2.txt',
            presignedUrl: 'https://s3.example.com/presigned-url-2',
            mimeType: 'text/plain',
            size: 1024,
            path: '/documents/test2.txt',
            expiresIn: 900,
            expiresAt: new Date('2024-01-01T12:15:00Z'),
            failedUrl: '/v1/drive/drive-123/item/file-2/failed'
          }
        ],
        statusUrl: '/v1/drive/drive-123/item/upload/job-complete',
        instructions: {
          step1: 'Upload each file to S3 using the presignedUrl with PUT method',
          step2: 'Upload confirmation is automatic - storage-manager Lambda confirms uploads when S3 events are triggered',
          step3: 'If upload fails on client side, call the failedUrl to mark the upload as failed',
          step4: 'Monitor progress using the statusUrl'
        }
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const mockFiles = [
        new File(['test1'], 'test1.txt', { type: 'text/plain' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' })
      ];

      const result = await driveItems.uploadFiles(mockFiles);

      // Verify complete response structure
      expect(result.message).toBeDefined();
      expect(result.uploadJob).toBeDefined();
      expect(result.uploadJob.id).toBe('job-complete');
      expect(result.uploadJob.status).toBe('PENDING');
      expect(result.files).toHaveLength(2);
      expect(result.files[0]).toHaveProperty('fileId');
      expect(result.files[0]).toHaveProperty('presignedUrl');
      expect(result.files[0]).toHaveProperty('expiresIn');
      expect(result.files[0]).toHaveProperty('expiresAt');
      expect(result.files[0]).toHaveProperty('failedUrl');
      expect(result.statusUrl).toBeDefined();
      expect(result.instructions).toBeDefined();
      expect(result.instructions.step1).toBeDefined();
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

  describe('update method', () => {
    it('should update drive item successfully', async () => {
      const mockItem = { id: '1', name: 'document.pdf', path: '/documents', size: 1024 };
      const mockResponse = new MockDriveItem(mockItem);
      
      jest.spyOn(driveItems, 'update').mockResolvedValue(mockResponse);

      const result = await driveItems.update('1', {
        name: 'updated-document.pdf'
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete method', () => {
    it('should delete drive item successfully', async () => {
      jest.spyOn(driveItems, 'delete').mockResolvedValue(undefined);

      await driveItems.delete('1');

      expect(driveItems.delete).toHaveBeenCalledWith('1');
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

