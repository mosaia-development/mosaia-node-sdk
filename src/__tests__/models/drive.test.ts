import { Drive } from '../../models';
import { DriveInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/drive';
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
    this.getUri = jest.fn().mockReturnValue('/drive/123');
    this.save = jest.fn();
    this.delete = jest.fn();
    this.isActive = jest.fn().mockReturnValue(data.active === true);
    this.toJSON = jest.fn().mockReturnValue(data);
    
    // Set properties from data
    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
  })
}));

// Mock the DriveItems collection
jest.mock('../../collections/drive-items', () => {
  const mockDriveItems = jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn(),
    uploadFiles: jest.fn(),
    findByPath: jest.fn()
  }));
  return {
    __esModule: true,
    default: mockDriveItems,
    DriveItems: mockDriveItems
  };
});

// Mock the UploadJobs collection
jest.mock('../../collections/upload-jobs', () => {
  const mockUploadJobs = jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  }));
  return {
    __esModule: true,
    default: mockUploadJobs,
    UploadJobs: mockUploadJobs
  };
});

// Mock the Access function
jest.mock('../../functions/access', () => {
  const mockAccess = jest.fn().mockImplementation((uri: string) => ({
    uri,
    grant: jest.fn(),
    revoke: jest.fn()
  }));
  return {
    __esModule: true,
    Access: mockAccess
  };
});

describe('Drive Model', () => {
  let drive: any;
  const DriveItems = require('../../collections/drive-items').default;

  beforeEach(() => {
    jest.clearAllMocks();

    const driveData: Partial<DriveInterface> = {
      id: '123',
      name: 'Test Drive',
      description: 'A test drive',
      active: true
    };

    drive = new Drive(driveData);
  });

  describe('constructor', () => {
    it('should create Drive instance with default URI', () => {
      const driveData: Partial<DriveInterface> = {
        id: '123',
        name: 'Test Drive',
        description: 'A test drive'
      };

      const drive = new Drive(driveData);
      expect(drive).toBeDefined();
      expect((drive as any).uri).toBe('/drive');
    });

    it('should create Drive instance with custom URI', () => {
      const driveData: Partial<DriveInterface> = {
        id: '123',
        name: 'Test Drive',
        description: 'A test drive'
      };

      const drive = new Drive(driveData, '/custom/drive');
      expect(drive).toBeDefined();
      expect((drive as any).uri).toBe('/custom/drive');
    });

    it('should set drive properties from data', () => {
      expect((drive as any).name).toBe('Test Drive');
      expect((drive as any).description).toBe('A test drive');
      expect((drive as any).active).toBe(true);
    });
  });

  describe('items getter', () => {
    it('should return DriveItems collection', () => {
      const items = drive.items;
      expect(DriveItems).toHaveBeenCalledWith('/drive/123');
      expect(items).toBeDefined();
      expect(typeof items.get).toBe('function');
      expect(typeof items.create).toBe('function');
      expect(typeof items.uploadFiles).toBe('function');
    });

    it('should allow accessing drive items', () => {
      const items = drive.items;
      expect(items).toBeDefined();
      expect(items.uri).toBe('/drive/123');
    });
  });

  describe('uploads getter', () => {
    const UploadJobs = require('../../collections/upload-jobs').default;

    it('should return UploadJobs collection', () => {
      const uploads = drive.uploads;
      expect(UploadJobs).toHaveBeenCalledWith('/drive/123');
      expect(uploads).toBeDefined();
      expect(typeof uploads.get).toBe('function');
      expect(typeof uploads.create).toBe('function');
    });

    it('should allow accessing upload jobs', () => {
      const uploads = drive.uploads;
      expect(uploads).toBeDefined();
      expect(uploads.uri).toBe('/drive/123');
    });

    it('should create separate instances for items and uploads', () => {
      const items = drive.items;
      const uploads = drive.uploads;
      
      expect(items).toBeDefined();
      expect(uploads).toBeDefined();
      // They should be different collections
      expect(DriveItems).toHaveBeenCalled();
      expect(UploadJobs).toHaveBeenCalled();
    });
  });

  describe('access getter', () => {
    const Access = require('../../functions/access').Access;
    const UploadJobs = require('../../collections/upload-jobs').default;

    it('should return Access function instance', () => {
      const access = drive.access;
      expect(Access).toHaveBeenCalledWith('/drive/123');
      expect(access).toBeDefined();
      expect(typeof access.grant).toBe('function');
      expect(typeof access.revoke).toBe('function');
    });

    it('should allow managing access permissions', () => {
      const access = drive.access;
      expect(access).toBeDefined();
      expect(access.uri).toBe('/drive/123');
    });

    it('should create separate instances for items, uploads, and access', () => {
      const items = drive.items;
      const uploads = drive.uploads;
      const access = drive.access;
      
      expect(items).toBeDefined();
      expect(uploads).toBeDefined();
      expect(access).toBeDefined();
      // They should be different instances
      expect(DriveItems).toHaveBeenCalled();
      expect(UploadJobs).toHaveBeenCalled();
      expect(Access).toHaveBeenCalled();
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(drive.save).toBeDefined();
      expect(typeof drive.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(drive.delete).toBeDefined();
      expect(typeof drive.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(drive.update).toBeDefined();
      expect(typeof drive.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(drive.isActive).toBeDefined();
      expect(typeof drive.isActive).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access drive data properties', () => {
      expect((drive as any).name).toBe('Test Drive');
      expect((drive as any).description).toBe('A test drive');
      expect((drive as any).active).toBe(true);
    });

    it('should return drive data via toJSON', () => {
      const jsonData = drive.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        name: 'Test Drive',
        description: 'A test drive',
        active: true
      });
    });
  });

  describe('drive-specific functionality', () => {
    it('should handle drive updates', () => {
      const updates = {
        name: 'Updated Drive',
        description: 'An updated drive'
      };

      drive.update(updates);

      expect((drive as any).name).toBe('Updated Drive');
      expect((drive as any).description).toBe('An updated drive');
    });

    it('should check if drive is active', () => {
      expect(drive.isActive()).toBe(true);

      const inactiveDrive = new Drive({
        id: '456',
        name: 'Inactive Drive',
        description: 'An inactive drive',
        active: false
      });

      expect(inactiveDrive.isActive()).toBe(false);
    });
  });

  describe('findItemByPath method', () => {
    it('should call items.findByPath with correct parameters', async () => {
      const mockItem = { id: 'item-1', name: 'report.pdf' };
      const mockFindByPath = jest.fn().mockResolvedValue(mockItem);
      
      // Mock the items getter to return an object with findByPath
      jest.spyOn(drive, 'items', 'get').mockReturnValue({
        findByPath: mockFindByPath
      } as any);

      const result = await drive.findItemByPath('/documents/report.pdf');

      expect(mockFindByPath).toHaveBeenCalledWith('/documents/report.pdf', undefined);
      expect(result).toEqual(mockItem);
    });

    it('should pass options to items.findByPath', async () => {
      const mockItem = { id: 'item-1', name: 'report.pdf' };
      const mockFindByPath = jest.fn().mockResolvedValue(mockItem);
      
      jest.spyOn(drive, 'items', 'get').mockReturnValue({
        findByPath: mockFindByPath
      } as any);

      const options = { caseSensitive: false };
      await drive.findItemByPath('/Report.PDF', options);

      expect(mockFindByPath).toHaveBeenCalledWith('/Report.PDF', options);
    });

    it('should throw error for unsaved drive', async () => {
      const unsavedDrive = new Drive({ name: 'Test Drive' });
      
      await expect(unsavedDrive.findItemByPath('/test')).rejects.toThrow(
        'Cannot find item by path for unsaved drive'
      );
    });

    it('should return array for directory paths', async () => {
      const mockItemsArray = [
        { id: 'item-1', name: 'file1.pdf' },
        { id: 'item-2', name: 'file2.txt' }
      ];
      const mockFindByPath = jest.fn().mockResolvedValue(mockItemsArray);
      
      jest.spyOn(drive, 'items', 'get').mockReturnValue({
        findByPath: mockFindByPath
      } as any);

      const result = await drive.findItemByPath('/documents');

      expect(mockFindByPath).toHaveBeenCalledWith('/documents', undefined);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockItemsArray);
    });
  });
});

