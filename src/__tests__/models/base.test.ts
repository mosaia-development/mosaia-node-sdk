import { BaseModel } from '../../models/base';
import { MosaiaConfig } from '../../types';

// Mock APIClient
const mockAPIClient = {
  PUT: jest.fn(),
  DELETE: jest.fn()
};

// Mock the APIClient constructor
jest.mock('../../utils/api-client', () => {
  return jest.fn().mockImplementation(() => mockAPIClient);
});

// Mock the ConfigurationManager
jest.mock('../../config', () => ({
  ConfigurationManager: {
    getInstance: jest.fn().mockReturnValue({
      getConfig: jest.fn().mockReturnValue({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1'
      })
    })
  }
}));

// Create a concrete implementation of BaseModel for testing
class TestModel extends BaseModel<{ id?: string; name: string; email: string; active?: boolean }> {
  constructor(data: { id?: string; name: string; email: string; active?: boolean }, uri?: string) {
    super(data, uri);
  }

  // Expose protected methods for testing
  public testHasId(): boolean {
    return this.hasId();
  }

  public testGetId(): string | undefined {
    return this.getId();
  }

  public testGetUri(): string {
    return this.getUri();
  }

  public testClearData(): void {
    this.clearData();
  }

  public testHandleError(error: any): Error {
    return this.handleError(error);
  }
}

describe('BaseModel', () => {
  let testModel: TestModel;

  beforeEach(() => {
    jest.clearAllMocks();

    const testData = {
      id: 'test-123',
      name: 'Test User',
      email: 'test@example.com',
      active: true
    };

    testModel = new TestModel(testData, '/test');
  });

  describe('constructor', () => {
    it('should create BaseModel instance with data and URI', () => {
      const data = { name: 'Test', email: 'test@example.com' };
      const model = new TestModel(data, '/custom-uri');

      expect(model).toBeInstanceOf(BaseModel);
      expect((model as any).data).toEqual(data);
      expect((model as any).uri).toBe('/custom-uri');
    });

    it('should create BaseModel instance with default URI', () => {
      const data = { name: 'Test', email: 'test@example.com' };
      const model = new TestModel(data);

      expect(model).toBeInstanceOf(BaseModel);
      expect((model as any).data).toEqual(data);
      expect((model as any).uri).toBe('');
    });

    it('should set instance properties from data', () => {
      const data = { name: 'Test', email: 'test@example.com' };
      const model = new TestModel(data);

      expect((model as any).name).toBe('Test');
      expect((model as any).email).toBe('test@example.com');
    });
  });

  describe('isActive', () => {
    it('should return true when active is true', () => {
      const data = { name: 'Test', email: 'test@example.com', active: true };
      const model = new TestModel(data);

      expect(model.isActive()).toBe(true);
    });

    it('should return false when active is false', () => {
      const data = { name: 'Test', email: 'test@example.com', active: false };
      const model = new TestModel(data);

      expect(model.isActive()).toBe(false);
    });

    it('should return false when active is undefined', () => {
      const data = { name: 'Test', email: 'test@example.com' };
      const model = new TestModel(data);

      expect(model.isActive()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return the model data as interface type', () => {
      const data = { id: '123', name: 'Test', email: 'test@example.com' };
      const model = new TestModel(data);

      const result = model.toJSON();

      expect(result).toEqual(data);
    });
  });

  describe('toAPIPayload', () => {
    it('should return data without read-only fields', () => {
      const data = { id: '123', name: 'Test', email: 'test@example.com' };
      const model = new TestModel(data);

      const result = model.toAPIPayload();

      expect(result).toEqual({ name: 'Test', email: 'test@example.com' });
      expect(result.id).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update model data and instance properties', () => {
      const data = { name: 'Original', email: 'original@example.com' };
      const model = new TestModel(data);

      const updates = { name: 'Updated', email: 'updated@example.com' };
      model.update(updates);

      expect((model as any).data).toEqual(updates);
      expect((model as any).name).toBe('Updated');
      expect((model as any).email).toBe('updated@example.com');
    });

    it('should merge updates with existing data', () => {
      const data = { name: 'Original', email: 'original@example.com' };
      const model = new TestModel(data);

      const updates = { name: 'Updated' };
      model.update(updates);

      expect((model as any).data).toEqual({ name: 'Updated', email: 'original@example.com' });
    });
  });

  describe('save', () => {
    it('should save model data successfully', async () => {
      const responseData = { id: '123', name: 'Updated', email: 'test@example.com' };
      mockAPIClient.PUT.mockResolvedValue({ data: responseData });

      const result = await testModel.save();

      expect(mockAPIClient.PUT).toHaveBeenCalledWith('/test/test-123', {
        id: 'test-123',
        name: 'Test User',
        email: 'test@example.com',
        active: true
      });
      expect(result).toEqual(responseData);
    });

    it('should throw error when model has no ID', async () => {
      const modelWithoutId = new TestModel({ name: 'Test', email: 'test@example.com' });

      await expect(modelWithoutId.save()).rejects.toThrow('Entity ID is required for update');
    });

    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      mockAPIClient.PUT.mockRejectedValue(apiError);

      await expect(testModel.save()).rejects.toThrow('API Error');
    });
  });

  describe('delete', () => {
    it('should delete model successfully', async () => {
      mockAPIClient.DELETE.mockResolvedValue(undefined);

      await testModel.delete();

      expect(mockAPIClient.DELETE).toHaveBeenCalledWith('/test/test-123');
    });

    it('should throw error when model has no ID', async () => {
      const modelWithoutId = new TestModel({ name: 'Test', email: 'test@example.com' });

      await expect(modelWithoutId.delete()).rejects.toThrow('Entity ID is required for deletion');
    });

    it('should clear data after successful deletion', async () => {
      mockAPIClient.DELETE.mockResolvedValue(undefined);

      await testModel.delete();

      expect((testModel as any).data).toEqual({});
    });

    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      mockAPIClient.DELETE.mockRejectedValue(apiError);

      await expect(testModel.delete()).rejects.toThrow('API Error');
    });
  });

  describe('hasId', () => {
    it('should return true when model has ID', () => {
      expect(testModel.testHasId()).toBe(true);
    });

    it('should return false when model has no ID', () => {
      const modelWithoutId = new TestModel({ name: 'Test', email: 'test@example.com' });
      expect(modelWithoutId.testHasId()).toBe(false);
    });
  });

  describe('getId', () => {
    it('should return ID when model has ID', () => {
      expect(testModel.testGetId()).toBe('test-123');
    });

    it('should throw error when model has no ID', () => {
      const modelWithoutId = new TestModel({ name: 'Test', email: 'test@example.com' });
      expect(() => modelWithoutId.testGetId()).toThrow('Entity ID is required');
    });
  });

  describe('getUri', () => {
    it('should return URI with ID when model has ID', () => {
      expect(testModel.testGetUri()).toBe('/test/test-123');
    });

    it('should throw error when model has no ID', () => {
      const modelWithoutId = new TestModel({ name: 'Test', email: 'test@example.com' });
      expect(() => modelWithoutId.testGetUri()).toThrow('Entity ID is required');
    });
  });

  describe('clearData', () => {
    it('should clear model data', () => {
      testModel.testClearData();

      expect((testModel as any).data).toEqual({});
    });
  });

  describe('handleError', () => {
    it('should return error with message when error has message', () => {
      const error = new Error('Test error');
      const result = testModel.testHandleError(error);

      expect(result).toBe(error);
    });

    it('should return original error when error is object with message', () => {
      const error = { message: 'Object error' };
      const result = testModel.testHandleError(error);

      expect(result).toBe(error);
      expect(result.message).toBe('Object error');
    });

    it('should return generic error for unknown error types', () => {
      const error = 'String error';
      const result = testModel.testHandleError(error);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Unknown error occurred');
    });
  });

  describe('config getter', () => {
    it('should return configuration from config manager', () => {
      const config = (testModel as any).config;

      expect(config).toEqual({
        apiKey: 'test-api-key',
        apiURL: 'https://api.test.com',
        version: '1'
      });
    });
  });
});
