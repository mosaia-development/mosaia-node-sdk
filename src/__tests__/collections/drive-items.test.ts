import DriveItems from '../../collections/drive-items';
import { DriveItem, UploadJob } from '../../models';
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

// Mock the models
jest.mock('../../models');
const MockDriveItem = DriveItem as jest.MockedClass<typeof DriveItem>;
const MockUploadJob = UploadJob as jest.MockedClass<typeof UploadJob>;

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

    // Mock UploadJob constructor
    MockUploadJob.mockImplementation((data: any) => {
      return {
        data,
        id: data.id,
        filename: data.filename,
        presigned_url: data.presigned_url,
        mime_type: data.mime_type,
        size: data.size,
        path: data.path,
        status: data.status,
        failed_url: data.failed_url,
        status_url: data.status_url,
        presigned_url_expires_at: data.presigned_url_expires_at,
        markFailed: jest.fn(),
        isExpired: jest.fn().mockReturnValue(false),
        toJSON: jest.fn().mockReturnValue(data)
      } as any;
    });

    driveItems = new DriveItems('/drive/drive-123');
  });

  describe('constructor', () => {
    it('should create DriveItems instance extending BaseCollection', () => {
      expect(driveItems).toBeDefined();
      expect(typeof driveItems.get).toBe('function');
      expect(typeof driveItems.create).toBe('function');
      expect(typeof driveItems.uploadFiles).toBe('function');
    });

    it('should initialize with correct URI and DriveItem model', () => {
      expect(driveItems).toBeDefined();
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultItems = new DriveItems();
      expect(defaultItems).toBeDefined();
    });
  });

  describe('uploadFiles method', () => {
    it('should upload files and return UploadJob instances', async () => {
      const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        message: 'Batch upload initiated',
        files: [{
          upload_job_id: 'upload-123',
          filename: 'test.txt',
          presigned_url: 'https://s3.example.com/upload',
          mime_type: 'text/plain',
          size: 12,
          path: '/test.txt',
          expires_in: 300,
          expires_at: '2025-12-03T20:00:00Z',
          failed_url: '/v1/drive/drive-123/upload/upload-123/failed',
          status_url: '/v1/drive/drive-123/upload/upload-123'
        }],
        instructions: {
          step1: 'Upload to S3',
          step2: 'Confirmation is automatic',
          step3: 'Call failed_url on error'
        }
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles([mockFile]);

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result.uploadJobs).toBeDefined();
      expect(result.uploadJobs).toHaveLength(1);
      expect(result.uploadJobs[0].id).toBe('upload-123');
      expect(result.uploadJobs[0].filename).toBe('test.txt');
      expect(result.uploadJobs[0].presigned_url).toBe('https://s3.example.com/upload');
      expect(result.uploadJobs[0].failed_url).toBe('/v1/drive/drive-123/upload/upload-123/failed');
    });

    it('should upload files with path option', async () => {
      const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        message: 'Batch upload initiated',
        files: [{
          upload_job_id: 'upload-456',
          filename: 'test.txt',
          presigned_url: 'https://s3.example.com/upload',
          mime_type: 'text/plain',
          size: 12,
          path: '/documents/test.txt',
          expires_in: 300,
          expires_at: '2025-12-03T20:00:00Z',
          failed_url: '/v1/drive/drive-123/upload/upload-456/failed',
          status_url: '/v1/drive/drive-123/upload/upload-456'
        }],
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles([mockFile], { path: '/documents' });

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result.uploadJobs).toHaveLength(1);
      expect(result.uploadJobs[0].path).toBe('/documents/test.txt');
    });

    it('should upload multiple files successfully', async () => {
      const mockFiles = [
        new File(['file1'], 'file1.txt', { type: 'text/plain' }),
        new File(['file2'], 'file2.txt', { type: 'text/plain' })
      ];
      const mockResponse = {
        message: 'Batch upload initiated',
        files: [
          {
            upload_job_id: 'upload-1',
            filename: 'file1.txt',
            presigned_url: 'https://s3.example.com/upload1',
            mime_type: 'text/plain',
            size: 5,
            path: '/file1.txt',
            expires_in: 300,
            expires_at: '2025-12-03T20:00:00Z',
            failed_url: '/v1/drive/drive-123/upload/upload-1/failed',
            status_url: '/v1/drive/drive-123/upload/upload-1'
          },
          {
            upload_job_id: 'upload-2',
            filename: 'file2.txt',
            presigned_url: 'https://s3.example.com/upload2',
            mime_type: 'text/plain',
            size: 5,
            path: '/file2.txt',
            expires_in: 300,
            expires_at: '2025-12-03T20:00:00Z',
            failed_url: '/v1/drive/drive-123/upload/upload-2/failed',
            status_url: '/v1/drive/drive-123/upload/upload-2'
          }
        ],
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles(mockFiles);

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/drive/drive-123/item',
        expect.any(FormData)
      );
      expect(result.uploadJobs).toHaveLength(2);
      expect(result.uploadJobs[0].id).toBe('upload-1');
      expect(result.uploadJobs[1].id).toBe('upload-2');
    });

    it('should upload files with relativePaths for directory structure', async () => {
      const mockFiles = [
        new File(['file1'], 'file1.txt', { type: 'text/plain' }),
        new File(['file2'], 'file2.txt', { type: 'text/plain' })
      ];
      const mockResponse = {
        message: 'Batch upload initiated',
        files: [
          {
            upload_job_id: 'upload-1',
            filename: 'file1.txt',
            presigned_url: 'https://s3.example.com/upload1',
            mime_type: 'text/plain',
            size: 5,
            path: '/uploads/folder1/file1.txt',
            expires_in: 300,
            expires_at: '2025-12-03T20:00:00Z',
            failed_url: '/v1/drive/drive-123/upload/upload-1/failed',
            status_url: '/v1/drive/drive-123/upload/upload-1'
          },
          {
            upload_job_id: 'upload-2',
            filename: 'file2.txt',
            presigned_url: 'https://s3.example.com/upload2',
            mime_type: 'text/plain',
            size: 5,
            path: '/uploads/folder2/file2.txt',
            expires_in: 300,
            expires_at: '2025-12-03T20:00:00Z',
            failed_url: '/v1/drive/drive-123/upload/upload-2/failed',
            status_url: '/v1/drive/drive-123/upload/upload-2'
          }
        ],
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles(mockFiles, {
        path: '/uploads',
        relativePaths: ['folder1/file1.txt', 'folder2/file2.txt'],
        preserveStructure: true
      });

      expect(mockAPIClient.POST).toHaveBeenCalled();
      expect(result.uploadJobs).toHaveLength(2);
      expect(result.uploadJobs[0].path).toBe('/uploads/folder1/file1.txt');
      expect(result.uploadJobs[1].path).toBe('/uploads/folder2/file2.txt');
    });

    it('should handle upload errors', async () => {
      const mockFiles = [
        new File(['file1'], 'file1.txt', { type: 'text/plain' })
      ];
      const error = new Error('Quota exceeded');
      mockAPIClient.POST.mockRejectedValue(error);

      await expect(driveItems.uploadFiles(mockFiles)).rejects.toThrow('Quota exceeded');
    });

    it('should handle empty files array', async () => {
      const mockResponse = {
        message: 'Upload initiated',
        files: [],
        instructions: {}
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles([]);

      expect(mockAPIClient.POST).toHaveBeenCalled();
      expect(result.uploadJobs).toHaveLength(0);
    });

    it('should create UploadJob instances with all properties', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        message: 'Upload initiated',
        files: [{
          upload_job_id: 'upload-complete',
          filename: 'test.pdf',
          presigned_url: 'https://s3.example.com/presigned',
          mime_type: 'application/pdf',
          size: 7,
          path: '/documents/test.pdf',
          expires_in: 300,
          expires_at: '2025-12-03T20:00:00Z',
          failed_url: '/v1/drive/drive-123/upload/upload-complete/failed',
          status_url: '/v1/drive/drive-123/upload/upload-complete'
        }],
        instructions: {
          step1: 'Upload to S3',
          step2: 'Automatic confirmation',
          step3: 'Call failed_url on error'
        }
      };

      mockAPIClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await driveItems.uploadFiles([mockFile]);

      expect(result.uploadJobs[0].id).toBe('upload-complete');
      expect(result.uploadJobs[0].filename).toBe('test.pdf');
      expect(result.uploadJobs[0].presigned_url).toBe('https://s3.example.com/presigned');
      expect(result.uploadJobs[0].mime_type).toBe('application/pdf');
      expect(result.uploadJobs[0].failed_url).toBe('/v1/drive/drive-123/upload/upload-complete/failed');
      expect(result.uploadJobs[0].status_url).toBe('/v1/drive/drive-123/upload/upload-complete');
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

  describe('findByPath method', () => {
    beforeEach(() => {
      driveItems = new DriveItems('/drive/drive-123');
    });

    it('should find a file by path and return single DriveItem', async () => {
      const mockItemData: DriveItemInterface = {
        id: 'item-1',
        drive: 'drive-123',
        name: 'report.pdf',
        filename: 'report.pdf',
        path: '/documents',
        size: 1024,
        mime_type: 'application/pdf',
        file_type: 'FILE',
        active: true
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockItemData });

      const result = await driveItems.findByPath('/documents/report.pdf');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(false);
      expect((result as any).data).toEqual(mockItemData);
      expect(mockAPIClient.GET).toHaveBeenCalledWith(
        '/drive/drive-123/item/documents/report.pdf',
        {}
      );
    });

    it('should find a directory by path and return array of DriveItems', async () => {
      const mockItemsData: DriveItemInterface[] = [
        {
          id: 'item-1',
          drive: 'drive-123',
          name: 'file1.pdf',
          filename: 'file1.pdf',
          path: '/documents',
          size: 1024,
          mime_type: 'application/pdf',
          file_type: 'FILE',
          active: true
        },
        {
          id: 'item-2',
          drive: 'drive-123',
          name: 'file2.txt',
          filename: 'file2.txt',
          path: '/documents',
          size: 512,
          mime_type: 'text/plain',
          file_type: 'FILE',
          active: true
        }
      ];

      mockAPIClient.GET.mockResolvedValue({ data: mockItemsData });

      const result = await driveItems.findByPath('/documents');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect((result as DriveItem[]).length).toBe(2);
      expect(mockAPIClient.GET).toHaveBeenCalledWith(
        '/drive/drive-123/item/documents',
        {}
      );
    });

    it('should return null when path is not found', async () => {
      const error = new Error('Not found') as any;
      error.status = 404;
      mockAPIClient.GET.mockRejectedValue(error);

      const result = await driveItems.findByPath('/nonexistent/file.pdf');

      expect(result).toBeNull();
    });

    it('should handle empty directory (returns empty array)', async () => {
      mockAPIClient.GET.mockResolvedValue({ data: [] });

      const result = await driveItems.findByPath('/empty-folder');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect((result as DriveItem[]).length).toBe(0);
    });

    it('should pass caseSensitive option as query parameter', async () => {
      const mockItemData: DriveItemInterface = {
        id: 'item-1',
        drive: 'drive-123',
        name: 'report.pdf',
        filename: 'report.pdf',
        path: '/documents',
        size: 1024,
        mime_type: 'application/pdf',
        file_type: 'FILE',
        active: true
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockItemData });

      await driveItems.findByPath('/Report.PDF', { caseSensitive: false });

      expect(mockAPIClient.GET).toHaveBeenCalledWith(
        '/drive/drive-123/item/Report.PDF',
        { caseSensitive: 'false' }
      );
    });

    it('should normalize path by removing leading slash', async () => {
      const mockItemData: DriveItemInterface = {
        id: 'item-1',
        drive: 'drive-123',
        name: 'report.pdf',
        filename: 'report.pdf',
        path: '/documents',
        size: 1024,
        mime_type: 'application/pdf',
        file_type: 'FILE',
        active: true
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockItemData });

      await driveItems.findByPath('/documents/report.pdf');

      expect(mockAPIClient.GET).toHaveBeenCalledWith(
        '/drive/drive-123/item/documents/report.pdf',
        {}
      );
    });

    it('should throw error for empty path', async () => {
      await expect(driveItems.findByPath('')).rejects.toThrow('Path is required');
      await expect(driveItems.findByPath('   ')).rejects.toThrow('Path is required');
    });

    it('should throw error for non-404 API errors', async () => {
      const error = new Error('Server error') as any;
      error.status = 500;
      mockAPIClient.GET.mockRejectedValue(error);

      await expect(driveItems.findByPath('/documents/report.pdf')).rejects.toThrow('Server error');
    });
  });
});

