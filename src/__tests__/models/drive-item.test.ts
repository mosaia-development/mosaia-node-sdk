import { DriveItem } from '../../models';
import { DriveItemInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/item';
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
    this.getUri = jest.fn().mockReturnValue('/drive/drive-123/item/item-456');
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

describe('DriveItem Model', () => {
  let driveItem: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const itemData: Partial<DriveItemInterface> = {
      id: '456',
      drive: 'drive-123',
      name: 'document.pdf',
      filename: 'document.pdf',
      path: '/documents',
      size: 1024,
      mime_type: 'application/pdf',
      active: true
    };

    driveItem = new DriveItem(itemData);
  });

  describe('constructor', () => {
    it('should create DriveItem instance with default URI', () => {
      const itemData: Partial<DriveItemInterface> = {
        id: '456',
        drive: 'drive-123',
        name: 'document.pdf'
      };

      const item = new DriveItem(itemData);
      expect(item).toBeDefined();
      expect((item as any).uri).toBe('/item');
    });

    it('should create DriveItem instance with custom URI', () => {
      const itemData: Partial<DriveItemInterface> = {
        id: '456',
        drive: 'drive-123',
        name: 'document.pdf'
      };

      const item = new DriveItem(itemData, '/custom/item');
      expect(item).toBeDefined();
      expect((item as any).uri).toBe('/custom/item');
    });

    it('should set drive item properties from data', () => {
      expect((driveItem as any).name).toBe('document.pdf');
      expect((driveItem as any).filename).toBe('document.pdf');
      expect((driveItem as any).path).toBe('/documents');
      expect((driveItem as any).size).toBe(1024);
      expect((driveItem as any).mime_type).toBe('application/pdf');
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(driveItem.save).toBeDefined();
      expect(typeof driveItem.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(driveItem.delete).toBeDefined();
      expect(typeof driveItem.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(driveItem.update).toBeDefined();
      expect(typeof driveItem.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(driveItem.isActive).toBeDefined();
      expect(typeof driveItem.isActive).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access drive item data properties', () => {
      expect((driveItem as any).name).toBe('document.pdf');
      expect((driveItem as any).filename).toBe('document.pdf');
      expect((driveItem as any).path).toBe('/documents');
      expect((driveItem as any).size).toBe(1024);
      expect((driveItem as any).mime_type).toBe('application/pdf');
    });

    it('should return drive item data via toJSON', () => {
      const jsonData = driveItem.toJSON();
      expect(jsonData).toEqual({
        id: '456',
        drive: 'drive-123',
        name: 'document.pdf',
        filename: 'document.pdf',
        path: '/documents',
        size: 1024,
        mime_type: 'application/pdf',
        active: true
      });
    });
  });

  describe('drive item-specific functionality', () => {
    it('should handle drive item updates', () => {
      const updates = {
        name: 'updated-document.pdf',
        path: '/updated-documents'
      };

      driveItem.update(updates);

      expect((driveItem as any).name).toBe('updated-document.pdf');
      expect((driveItem as any).path).toBe('/updated-documents');
    });

    it('should check if drive item is active', () => {
      expect(driveItem.isActive()).toBe(true);

      const inactiveItem = new DriveItem({
        id: '789',
        drive: 'drive-123',
        name: 'inactive.pdf',
        active: false
      });

      expect(inactiveItem.isActive()).toBe(false);
    });

    it('should handle different file types', () => {
      const imageItem = new DriveItem({
        id: '101',
        drive: 'drive-123',
        name: 'image.jpg',
        mime_type: 'image/jpeg',
        size: 2048
      });

      expect((imageItem as any).mime_type).toBe('image/jpeg');
      expect((imageItem as any).size).toBe(2048);
    });

    it('should handle drive item with metadata', () => {
      const itemWithMetadata = new DriveItem({
        id: '102',
        drive: 'drive-123',
        name: 'document.pdf',
        metadata: {
          author: 'John Doe',
          tags: ['important', 'draft']
        }
      });

      expect((itemWithMetadata as any).metadata).toEqual({
        author: 'John Doe',
        tags: ['important', 'draft']
      });
    });
  });

  describe('downloadUrl method', () => {
    it('should return download URL with default expiration', async () => {
      const url = await driveItem.downloadUrl();
      
      expect(url).toBe('https://api.mosaia.ai/drive/drive-123/item/item-456/download');
    });

    it('should return download URL with custom expiration', async () => {
      const url = await driveItem.downloadUrl(7200);
      
      expect(url).toBe('https://api.mosaia.ai/drive/drive-123/item/item-456/download?expires_in=7200');
    });

    it('should throw error for unsaved drive item', async () => {
      const unsavedItem = new DriveItem({
        drive: 'drive-123',
        name: 'document.pdf'
      });

      await expect(unsavedItem.downloadUrl()).rejects.toThrow('Cannot get download URL for unsaved drive item');
    });

    it('should construct correct URL for different items', async () => {
      const item1 = new DriveItem({
        id: 'item-111',
        drive: 'drive-123',
        name: 'file1.pdf'
      });
      
      // Mock getUri for this item
      (item1 as any).getUri = jest.fn().mockReturnValue('/drive/drive-123/item/item-111');
      
      const url1 = await item1.downloadUrl();
      expect(url1).toBe('https://api.mosaia.ai/drive/drive-123/item/item-111/download');
    });

    it('should handle folders (ZIP download)', async () => {
      const folder = new DriveItem({
        id: 'folder-789',
        drive: 'drive-123',
        name: 'Documents'
      });

      (folder as any).getUri = jest.fn().mockReturnValue('/drive/drive-123/item/folder-789');
      
      const url = await folder.downloadUrl(3600);
      expect(url).toBe('https://api.mosaia.ai/drive/drive-123/item/folder-789/download?expires_in=3600');
    });
  });

  describe('access getter', () => {
    const Access = require('../../functions/access').Access;

    it('should return Access function instance', () => {
      const access = driveItem.access;
      expect(Access).toHaveBeenCalledWith('/drive/drive-123/item/item-456/456');
      expect(access).toBeDefined();
      expect(typeof access.grant).toBe('function');
      expect(typeof access.revoke).toBe('function');
    });

    it('should allow managing access permissions', () => {
      const access = driveItem.access;
      expect(access).toBeDefined();
      expect(access.uri).toBe('/drive/drive-123/item/item-456/456');
    });

    it('should throw error for unsaved drive item', () => {
      const unsavedItem = new DriveItem({
        drive: 'drive-123',
        name: 'document.pdf'
      });

      expect(() => unsavedItem.access).toThrow('Cannot access permissions for unsaved drive item');
    });

    it('should create access instance with correct URI', () => {
      const item = new DriveItem({
        id: 'item-999',
        drive: 'drive-123',
        name: 'test.pdf'
      });
      
      (item as any).getUri = jest.fn().mockReturnValue('/drive/drive-123/item/item-999');
      
      const access = item.access;
      expect(Access).toHaveBeenCalledWith('/drive/drive-123/item/item-999/item-999');
      expect(access).toBeDefined();
    });
  });
});

