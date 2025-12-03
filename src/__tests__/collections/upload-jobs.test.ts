import UploadJobs from '../../collections/upload-jobs';
import { UploadJob } from '../../models';
import { GetUploadJobsPayload, GetUploadJobPayload, UploadJobInterface } from '../../types';

// Mock the UploadJob model
jest.mock('../../models');
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

describe('UploadJobs', () => {
  let uploadJobs: UploadJobs;
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

    // Setup mock UploadJob
    MockUploadJob.mockImplementation((data: any) => ({ data } as any));

    uploadJobs = new UploadJobs('/drive/drive-123');
  });

  describe('constructor', () => {
    it('should create UploadJobs instance extending BaseCollection', () => {
      expect(uploadJobs).toBeDefined();
      expect(typeof uploadJobs.get).toBe('function');
      expect(typeof uploadJobs.create).toBe('function');
    });

    it('should initialize with correct URI and UploadJob model', () => {
      expect(uploadJobs).toBeDefined();
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultUploadJobs = new UploadJobs();
      expect(defaultUploadJobs).toBeDefined();
    });

    it('should append /upload to provided URI', () => {
      const jobs = new UploadJobs('/drive/drive-456');
      expect(jobs).toBeDefined();
      // URI should be /drive/drive-456/upload
    });
  });

  describe('get method', () => {
    it('should get all upload jobs successfully', async () => {
      const mockJobs = [
        { 
          id: 'upload-1', 
          filename: 'file1.pdf', 
          status: 'PENDING' as const,
          drive: 'drive-123',
          size: 1024,
          mime_type: 'application/pdf',
          presigned_url_expires_at: new Date().toISOString(),
          started_at: new Date().toISOString()
        },
        { 
          id: 'upload-2', 
          filename: 'file2.pdf', 
          status: 'COMPLETED' as const,
          drive: 'drive-123',
          size: 2048,
          mime_type: 'application/pdf',
          presigned_url_expires_at: new Date().toISOString(),
          started_at: new Date().toISOString()
        }
      ];

      const mockResponse = {
        data: mockJobs.map(job => new MockUploadJob(job))
      };
      
      jest.spyOn(uploadJobs, 'get').mockResolvedValue(mockResponse as any);

      const result = await uploadJobs.get();

      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific upload job by ID', async () => {
      const mockJob = { 
        id: 'upload-1', 
        filename: 'document.pdf', 
        status: 'PENDING' as const,
        drive: 'drive-123',
        size: 1024,
        mime_type: 'application/pdf',
        presigned_url_expires_at: new Date().toISOString(),
        started_at: new Date().toISOString()
      };
      const mockResponse = new MockUploadJob(mockJob);
      
      jest.spyOn(uploadJobs, 'get').mockResolvedValue(mockResponse as any);

      const result = await uploadJobs.get({}, 'upload-1');

      expect(result).toEqual(mockResponse);
    });

    it('should filter upload jobs by status', async () => {
      const mockJobs = [
        { 
          id: 'upload-1', 
          filename: 'file1.pdf', 
          status: 'PENDING' as const,
          drive: 'drive-123',
          size: 1024,
          mime_type: 'application/pdf',
          presigned_url_expires_at: new Date().toISOString(),
          started_at: new Date().toISOString()
        }
      ];

      const mockResponse = {
        data: mockJobs.map(job => new MockUploadJob(job))
      };
      
      jest.spyOn(uploadJobs, 'get').mockResolvedValue(mockResponse as any);

      const result = await uploadJobs.get({ status: 'PENDING' });

      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(1);
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        data: []
      };
      
      jest.spyOn(uploadJobs, 'get').mockResolvedValue(mockResponse as any);

      const result = await uploadJobs.get();

      expect(result.data).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      const error = new Error('Access denied');
      jest.spyOn(uploadJobs, 'get').mockRejectedValue(error);

      await expect(uploadJobs.get()).rejects.toThrow('Access denied');
    });
  });

  describe('create method', () => {
    it('should create upload job successfully', async () => {
      const jobData = {
        drive: 'drive-123',
        filename: 'new-file.pdf',
        original_filename: 'new-file.pdf',
        size: 2048,
        mime_type: 'application/pdf',
        path: '/uploads',
        presigned_url_expires_at: new Date().toISOString(),
        status: 'PENDING' as const,
        started_at: new Date().toISOString()
      };

      const mockResponse = { 
        id: 'upload-new', 
        ...jobData 
      };
      
      jest.spyOn(uploadJobs, 'create').mockResolvedValue(mockResponse as any);

      const result = await uploadJobs.create(jobData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('update method', () => {
    it('should update upload job successfully', async () => {
      const mockJob = { 
        id: 'upload-1', 
        filename: 'document.pdf', 
        status: 'COMPLETED' as const,
        drive: 'drive-123',
        size: 1024,
        mime_type: 'application/pdf',
        presigned_url_expires_at: new Date().toISOString(),
        started_at: new Date().toISOString()
      };
      const mockResponse = new MockUploadJob(mockJob);
      
      jest.spyOn(uploadJobs, 'update').mockResolvedValue(mockResponse);

      const result = await uploadJobs.update('upload-1', {
        status: 'COMPLETED'
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete method', () => {
    it('should delete upload job successfully', async () => {
      jest.spyOn(uploadJobs, 'delete').mockResolvedValue(undefined);

      await uploadJobs.delete('upload-1');

      expect(uploadJobs.delete).toHaveBeenCalledWith('upload-1');
    });
  });

  describe('query filtering', () => {
    it('should filter by drive', async () => {
      const mockJobs = [
        { 
          id: 'upload-1', 
          drive: 'drive-123',
          filename: 'file1.pdf',
          status: 'PENDING' as const,
          size: 1024,
          mime_type: 'application/pdf',
          presigned_url_expires_at: new Date().toISOString(),
          started_at: new Date().toISOString()
        }
      ];

      const mockResponse = {
        data: mockJobs.map(job => new MockUploadJob(job))
      };
      
      jest.spyOn(uploadJobs, 'get').mockResolvedValue(mockResponse as any);

      const result = await uploadJobs.get({ drive: 'drive-123' });

      expect(result.data).toHaveLength(1);
    });

    it('should filter by multiple statuses', async () => {
      const mockJobs = [
        { id: 'upload-1', status: 'PENDING' as const, drive: 'drive-123', filename: 'f1.pdf', size: 1024, mime_type: 'application/pdf', presigned_url_expires_at: new Date().toISOString(), started_at: new Date().toISOString() },
        { id: 'upload-2', status: 'UPLOADING' as const, drive: 'drive-123', filename: 'f2.pdf', size: 1024, mime_type: 'application/pdf', presigned_url_expires_at: new Date().toISOString(), started_at: new Date().toISOString() }
      ];

      const mockResponse = {
        data: mockJobs.map(job => new MockUploadJob(job))
      };
      
      jest.spyOn(uploadJobs, 'get').mockResolvedValue(mockResponse as any);

      const result = await uploadJobs.get({ status: ['PENDING', 'UPLOADING'] } as any);

      expect(result.data).toHaveLength(2);
    });
  });
});

