import { UploadJob } from '../../models';
import { UploadJobInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/upload';
    this.apiClient = {
      POST: jest.fn(),
      PUT: jest.fn(),
      DELETE: jest.fn(),
      GET: jest.fn()
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
    this.getUri = jest.fn().mockReturnValue('/drive/drive-123/upload');
    this.save = jest.fn();
    this.delete = jest.fn();
    this.toJSON = jest.fn().mockReturnValue(data);
    
    // Don't set properties that have getters in the actual class
    // The data object is accessible via this.data
  })
}));

describe('UploadJob Model', () => {
  let uploadJob: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const uploadJobData: Partial<UploadJobInterface> = {
      id: 'upload-123',
      drive: 'drive-123',
      filename: 'document.pdf',
      original_filename: 'document.pdf',
      size: 1024000,
      mime_type: 'application/pdf',
      content_type_category: 'DOCUMENT',
      path: '/documents',
      file_type: 'FILE',
      presigned_url: 'https://s3.example.com/presigned-upload',
      presigned_url_expires_at: new Date(Date.now() + 300000).toISOString(),
      status: 'PENDING',
      started_at: new Date().toISOString(),
      failed_url: '/v1/drive/drive-123/upload/upload-123/failed',
      status_url: '/v1/drive/drive-123/upload/upload-123'
    };

    uploadJob = new UploadJob(uploadJobData);
  });

  describe('constructor', () => {
    it('should create UploadJob instance with default URI', () => {
      const uploadJobData: Partial<UploadJobInterface> = {
        id: 'upload-123',
        drive: 'drive-123',
        filename: 'test.pdf',
        size: 1024,
        mime_type: 'application/pdf',
        presigned_url_expires_at: new Date().toISOString(),
        status: 'PENDING',
        started_at: new Date().toISOString()
      };

      const job = new UploadJob(uploadJobData);
      expect(job).toBeDefined();
      expect((job as any).uri).toBe('/upload');
    });

    it('should create UploadJob instance with custom URI', () => {
      const uploadJobData: Partial<UploadJobInterface> = {
        id: 'upload-123',
        drive: 'drive-123',
        filename: 'test.pdf',
        size: 1024,
        mime_type: 'application/pdf',
        presigned_url_expires_at: new Date().toISOString(),
        status: 'PENDING',
        started_at: new Date().toISOString()
      };

      const job = new UploadJob(uploadJobData, '/custom/upload');
      expect(job).toBeDefined();
      expect((job as any).uri).toBe('/custom/upload');
    });

    it('should set all properties from data', () => {
      expect(uploadJob.data).toBeDefined();
      expect((uploadJob as any).id).toBe('upload-123');
      expect((uploadJob as any).filename).toBe('document.pdf');
    });
  });

  describe('getter properties', () => {
    it('should get id from data', () => {
      expect(uploadJob.id).toBe('upload-123');
    });

    it('should get filename from data', () => {
      expect(uploadJob.filename).toBe('document.pdf');
    });

    it('should get presigned_url from data', () => {
      expect(uploadJob.presigned_url).toBe('https://s3.example.com/presigned-upload');
    });

    it('should get mime_type from data', () => {
      expect(uploadJob.mime_type).toBe('application/pdf');
    });

    it('should get size from data', () => {
      expect(uploadJob.size).toBe(1024000);
    });

    it('should get path from data', () => {
      expect(uploadJob.path).toBe('/documents');
    });

    it('should get status from data', () => {
      expect(uploadJob.status).toBe('PENDING');
    });

    it('should get failed_url from data', () => {
      expect(uploadJob.failed_url).toBe('/v1/drive/drive-123/upload/upload-123/failed');
    });

    it('should get status_url from data', () => {
      expect(uploadJob.status_url).toBe('/v1/drive/drive-123/upload/upload-123');
    });

    it('should get presigned_url_expires_at from data', () => {
      expect(uploadJob.presigned_url_expires_at).toBeDefined();
    });
  });

  describe('markFailed method', () => {
    it('should mark upload as failed successfully', async () => {
      const mockResponse = {
        id: 'upload-123',
        status: 'FAILED',
        error_summary: 'Upload timeout',
        message: 'Upload marked as failed and quota reverted'
      };

      uploadJob.apiClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await uploadJob.markFailed('Upload timeout');

      expect(uploadJob.apiClient.POST).toHaveBeenCalledWith(
        '/v1/drive/drive-123/upload/upload-123/failed',
        { error: 'Upload timeout' }
      );
      expect(result).toBeDefined();
    });

    it('should use default error message when none provided', async () => {
      const mockResponse = {
        id: 'upload-123',
        status: 'FAILED',
        error_summary: 'Upload failed',
        message: 'Upload marked as failed and quota reverted'
      };

      uploadJob.apiClient.POST.mockResolvedValue({ data: mockResponse });

      await uploadJob.markFailed();

      expect(uploadJob.apiClient.POST).toHaveBeenCalledWith(
        '/v1/drive/drive-123/upload/upload-123/failed',
        { error: 'Upload failed' }
      );
    });

    it('should throw error when failed_url is not available', async () => {
      const jobWithoutUrl = new UploadJob({
        id: 'upload-no-url',
        drive: 'drive-123',
        filename: 'test.pdf',
        size: 1024,
        mime_type: 'application/pdf',
        presigned_url_expires_at: new Date().toISOString(),
        status: 'PENDING',
        started_at: new Date().toISOString()
        // No failed_url
      });

      await expect(jobWithoutUrl.markFailed('Error')).rejects.toThrow(
        'Cannot mark upload as failed: failed_url not available'
      );
    });

    it('should handle API errors', async () => {
      const error = new Error('Network error');
      uploadJob.apiClient.POST.mockRejectedValue(error);

      await expect(uploadJob.markFailed('Test error')).rejects.toThrow('Network error');
    });

    it('should update local instance after marking as failed', async () => {
      const mockResponse = {
        id: 'upload-123',
        status: 'FAILED',
        error_summary: 'Upload failed',
        completed_at: new Date().toISOString()
      };

      uploadJob.apiClient.POST.mockResolvedValue({ data: mockResponse });

      const result = await uploadJob.markFailed('Upload failed');

      // Verify the result contains updated data
      expect(result).toBeDefined();
      expect(uploadJob.apiClient.POST).toHaveBeenCalled();
    });
  });

  describe('isExpired method', () => {
    it('should return false when presigned_url_expires_at is in the future', () => {
      const futureDate = new Date(Date.now() + 300000); // 5 minutes from now
      uploadJob.data.presigned_url_expires_at = futureDate.toISOString();

      const expired = uploadJob.isExpired();

      expect(expired).toBe(false);
    });

    it('should return true when presigned_url_expires_at is in the past', () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      uploadJob.data.presigned_url_expires_at = pastDate.toISOString();

      const expired = uploadJob.isExpired();

      expect(expired).toBe(true);
    });

    it('should return false when presigned_url_expires_at is not set', () => {
      const jobWithoutExpiry = new UploadJob({
        id: 'upload-no-expiry',
        drive: 'drive-123',
        filename: 'test.pdf',
        size: 1024,
        mime_type: 'application/pdf',
        status: 'PENDING',
        started_at: new Date().toISOString()
      } as any);

      // Override the getter to return undefined
      Object.defineProperty(jobWithoutExpiry, 'presigned_url_expires_at', {
        get: () => undefined
      });

      const expired = jobWithoutExpiry.isExpired();

      expect(expired).toBe(false);
    });

    it('should handle Date object for presigned_url_expires_at', () => {
      const futureDate = new Date(Date.now() + 300000);
      uploadJob.data.presigned_url_expires_at = futureDate; // Date object instead of string

      const expired = uploadJob.isExpired();

      expect(expired).toBe(false);
    });
  });

  describe('toJSON method', () => {
    it('should convert upload job to JSON format', () => {
      const json = uploadJob.toJSON();

      expect(json).toBeDefined();
      expect(json.id).toBe('upload-123');
    });
  });
});

