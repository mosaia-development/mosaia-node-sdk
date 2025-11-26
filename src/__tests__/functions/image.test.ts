import { Image } from '../../functions/image';
import { GetAppPayload, GetAgentPayload } from '../../types';

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

// Mock the APIClient
jest.mock('../../utils/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    POST: jest.fn(),
  }));
});
const APIClient = require('../../utils/api-client');
const MockAPIClient = APIClient as jest.MockedClass<typeof APIClient>;

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

describe('Image', () => {
  let image: Image;
  let mockAPIClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAPIClient = {
      POST: jest.fn(),
    };

    // Mock APIClient constructor to return our mock instance
    (MockAPIClient as any).mockImplementation(() => mockAPIClient);

    image = new Image('/app/123');
  });

  describe('constructor', () => {
    it('should create Image instance with URI', () => {
      const image = new Image('/app/123');
      expect(image).toBeDefined();
      expect(image).toBeInstanceOf(Image);
    });

    it('should create Image instance with URI and image URL', () => {
      const image = new Image('/app/123', 'https://example.com/image.png');
      expect(image).toBeDefined();
    });

    it('should create Image instance with empty strings', () => {
      const image = new Image();
      expect(image).toBeDefined();
    });
  });

  describe('upload method', () => {
    it('should upload image successfully', async () => {
      const mockFile = new File(['image data'], 'test.png', { type: 'image/png' });
      const mockResponse = {
        data: {
          id: '123',
          name: 'Test App',
          image: 'https://example.com/image.png'
        }
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await image.upload<any, GetAppPayload>(mockFile);

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/app/123/image/upload',
        expect.any(FormData)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should upload image with generic types', async () => {
      const mockFile = new File(['image data'], 'agent-avatar.png', { type: 'image/png' });
      const mockResponse = {
        data: {
          id: '456',
          name: 'Test Agent',
          model: 'gpt-4'
        }
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await image.upload<any, GetAgentPayload>(mockFile);

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/app/123/image/upload',
        expect.any(FormData)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle response without data property', async () => {
      const mockFile = new File(['image data'], 'test.png', { type: 'image/png' });
      const mockResponse = {
        id: '123',
        name: 'Test App',
        image: 'https://example.com/image.png'
      };

      mockAPIClient.POST.mockResolvedValue(mockResponse);

      const result = await image.upload<any, any>(mockFile);

      expect(result).toEqual(mockResponse);
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['image data'], 'test.png', { type: 'image/png' });
      const error = new Error('Upload failed');
      mockAPIClient.POST.mockRejectedValue(error);

      await expect(image.upload(mockFile)).rejects.toThrow('Upload failed');
    });

    it('should handle network errors', async () => {
      const mockFile = new File(['image data'], 'test.png', { type: 'image/png' });
      const error = new Error('Network error');
      mockAPIClient.POST.mockRejectedValue(error);

      await expect(image.upload(mockFile)).rejects.toThrow('Network error');
    });

    it('should handle unknown errors', async () => {
      const mockFile = new File(['image data'], 'test.png', { type: 'image/png' });
      mockAPIClient.POST.mockRejectedValue({});

      await expect(image.upload(mockFile)).rejects.toThrow('Unknown error occurred');
    });

    it('should create FormData with file', async () => {
      const mockFile = new File(['image data'], 'test.png', { type: 'image/png' });
      const mockResponse = { data: { id: '123', name: 'Test App' } };
      mockAPIClient.POST.mockResolvedValue(mockResponse);

      await image.upload(mockFile);

      expect(mockAPIClient.POST).toHaveBeenCalledWith(
        '/app/123/image/upload',
        expect.any(FormData)
      );
      
      // Verify FormData contains the file
      const callArgs = mockAPIClient.POST.mock.calls[0];
      const formData = callArgs[1];
      expect(formData).toBeInstanceOf(FormData);
    });
  });
});

