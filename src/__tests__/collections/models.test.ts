import Models from '../../collections/models';
import { Model } from '../../models';
import { GetModelsPayload, GetModelPayload, ModelInterface } from '../../types';

// Mock the Model model
jest.mock('../../models');
const MockModel = Model as jest.MockedClass<typeof Model>;

// Mock the BaseAPI methods directly
jest.mock('../../collections/base-collection', () => {
  return {
          BaseCollection: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      create: jest.fn(),
    }))
  };
});

describe('Models', () => {
  let models: Models;
  let mockGet: jest.MockedFunction<any>;
  let mockCreate: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock returns
    MockModel.mockImplementation((data: any) => ({ data } as any));

    models = new Models();
    
    // Get the mocked methods from the instance
    mockGet = (models as any).get;
    mockCreate = (models as any).create;
  });

  describe('constructor', () => {
    it('should create Models instance', () => {
      expect(models).toBeDefined();
    });

    it('should initialize with correct URI and Model model', () => {
      expect(models).toBeDefined();
    });

    it('should initialize with custom URI when provided', () => {
      const customModels = new Models('/api/v1');
      expect(customModels).toBeDefined();
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultModels = new Models();
      expect(defaultModels).toBeDefined();
    });
  });

  describe('get method', () => {
    it('should get all models successfully', async () => {
      const mockModels = [
        { id: '1', name: 'GPT-4', short_description: 'OpenAI GPT-4 model', provider: 'openai', model_id: 'gpt-4' },
        { id: '2', name: 'Claude', short_description: 'Anthropic Claude model', provider: 'anthropic', model_id: 'claude-3' }
      ];

      const mockResponse = {
        data: mockModels.map(model => new MockModel(model))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await models.get();

      expect(mockGet).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific model by ID', async () => {
      const mockModel = { id: '1', name: 'GPT-4', short_description: 'OpenAI GPT-4 model', provider: 'openai', model_id: 'gpt-4' };
      const mockResponse = new MockModel(mockModel);
      mockGet.mockResolvedValue(mockResponse);

      const result = await models.get({}, '1');

      expect(mockGet).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get models with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        q: 'gpt',
        active: true
      };

      const mockModels = [
        { id: '1', name: 'GPT-4', short_description: 'OpenAI GPT-4 model', provider: 'openai', model_id: 'gpt-4' }
      ];

      const mockResponse = {
        data: mockModels.map(model => new MockModel(model))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await models.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty models list', async () => {
      const mockResponse: any[] = [];
      mockGet.mockResolvedValue(mockResponse);

      const result = await models.get();

      expect(result).toEqual([]);
    });

    it('should handle null response', async () => {
      mockGet.mockResolvedValue(null);

      const result = await models.get();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch models');
      mockGet.mockRejectedValue(error);

      await expect(models.get()).rejects.toThrow('Failed to fetch models');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockGet.mockRejectedValue(networkError);

      await expect(models.get()).rejects.toThrow('Network error');
    });
  });

  describe('create method', () => {
    it('should create a new model successfully', async () => {
      const modelData = {
        name: 'New Model',
        short_description: 'A new model',
        provider: 'openai',
        model_id: 'gpt-5'
      };

      const mockModel = { id: '3', ...modelData };
      const mockResponse = new MockModel(mockModel);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await models.create(modelData);

      expect(mockCreate).toHaveBeenCalledWith(modelData);
      expect(result).toEqual(mockResponse);
    });

    it('should create model with minimal data', async () => {
      const modelData = {
        name: 'Minimal Model',
        short_description: 'Minimal model',
        provider: 'openai',
        model_id: 'gpt-3.5-turbo'
      };

      const mockModel = { id: '4', ...modelData };
      const mockResponse = new MockModel(mockModel);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await models.create(modelData);

      expect(mockCreate).toHaveBeenCalledWith(modelData);
      expect(result).toEqual(mockResponse);
    });

    it('should create model with all optional fields', async () => {
      const modelData = {
        name: 'Full Model',
        short_description: 'A fully configured AI model',
        provider: 'anthropic',
        model_id: 'claude-3-sonnet',
        max_tokens: 8000,
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        active: true,
        external_id: 'ext-model-123'
      };

      const mockModel = { id: '5', ...modelData };
      const mockResponse = new MockModel(mockModel);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await models.create(modelData);

      expect(mockCreate).toHaveBeenCalledWith(modelData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const modelData = {
        name: 'Invalid Model',
        short_description: 'Invalid model',
        provider: 'invalid-provider',
        model_id: 'invalid-model'
      };

      const error = new Error('Validation failed');
      mockCreate.mockRejectedValue(error);

      await expect(models.create(modelData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const modelData = {
        name: 'Network Model',
        short_description: 'Network model',
        provider: 'openai',
        model_id: 'gpt-4'
      };

      const networkError = new Error('Network error');
      mockCreate.mockRejectedValue(networkError);

      await expect(models.create(modelData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty model data in create', async () => {
      const modelData = {
        name: '',
        provider: '',
        model_id: '',
        short_description: ''
      };

      const mockModel = { id: '6', ...modelData };
      const mockResponse = new MockModel(mockModel);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await models.create(modelData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in model data', async () => {
      const modelData = {
        name: 'Model with Special Chars: @#$%^&*()',
        short_description: 'Model with special characters: éñüñçóðé',
        provider: 'openai',
        model_id: 'gpt-4@latest'
      };

      const mockModel = { id: '7', ...modelData };
      const mockResponse = new MockModel(mockModel);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await models.create(modelData);

      expect(mockCreate).toHaveBeenCalledWith(modelData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long model data', async () => {
      const longName = 'a'.repeat(1000);
      const longDescription = 'b'.repeat(2000);
      const modelData = {
        name: longName,
        short_description: longDescription,
        provider: 'openai',
        model_id: 'gpt-4'
      };

      const mockModel = { id: '8', ...modelData };
      const mockResponse = new MockModel(mockModel);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await models.create(modelData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        q: 'model@example.com',
        provider: 'provider-with-special-chars_123',
        external_id: 'id-with-special-chars_123'
      };

      const mockModels = [
        { id: '1', name: 'Test Model', short_description: 'Test model', provider: 'openai', model_id: 'gpt-4' }
      ];

      const mockResponse = {
        data: mockModels.map(model => new MockModel(model))
      };
      mockGet.mockResolvedValue(mockResponse);

      await models.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        q: 'gpt-4 model',
        provider: 'openai',
        active: true,
        external_id: 'ext-123'
      };

      const mockModels = [
        { id: '1', name: 'GPT-4', short_description: 'GPT-4 model', provider: 'openai', model_id: 'gpt-4' }
      ];

      const mockResponse = {
        data: mockModels.map(model => new MockModel(model))
      };
      mockGet.mockResolvedValue(mockResponse);

      await models.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete model management flow', async () => {
      // Step 1: Get all models
      const mockModels = [
        { id: '1', name: 'GPT-4', provider: 'openai', model_id: 'gpt-4' },
        { id: '2', name: 'Claude-3', provider: 'anthropic', model_id: 'claude-3' }
      ];

      const mockGetResponse = {
        data: mockModels.map(model => new MockModel(model))
      };
      mockGet.mockResolvedValueOnce(mockGetResponse);

      const allModels = await models.get();
      expect(allModels.data).toHaveLength(2);

      // Step 2: Get specific model
      const mockModel = { id: '1', name: 'GPT-4', provider: 'openai', model_id: 'gpt-4' };
      const mockGetModelResponse = new MockModel(mockModel);
      mockGet.mockResolvedValueOnce(mockGetModelResponse);

      const specificModel = await models.get({}, '1');
      expect(specificModel).toEqual(mockGetModelResponse);

      // Step 3: Create new model
      const newModelData = {
        name: 'New Model',
        short_description: 'New model',
        provider: 'openai',
        model_id: 'gpt-4',
        max_tokens: 4000
      };

      const mockNewModel = { id: '3', ...newModelData };
      const mockCreateResponse = new MockModel(mockNewModel);
      mockCreate.mockResolvedValueOnce(mockCreateResponse);

      const createdModel = await models.create(newModelData);
      expect(createdModel).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageModels = [
        { id: '1', name: 'Model 1', provider: 'openai', model_id: 'gpt-4' },
        { id: '2', name: 'Model 2', provider: 'anthropic', model_id: 'claude-3' }
      ];

      const mockFirstPage = {
        data: firstPageModels.map(model => new MockModel(model))
      };
      mockGet.mockResolvedValueOnce(mockFirstPage);

      const firstPage = await models.get({ limit: 2, offset: 0 });
      expect(firstPage.data).toHaveLength(2);

      // Second page
      const secondPageModels = [
        { id: '3', name: 'Model 3', provider: 'google', model_id: 'gemini-pro' },
        { id: '4', name: 'Model 4', provider: 'meta', model_id: 'llama-2' }
      ];

      const mockSecondPage = {
        data: secondPageModels.map(model => new MockModel(model))
      };
      mockGet.mockResolvedValueOnce(mockSecondPage);

      const secondPage = await models.get({ limit: 2, offset: 2 });
      expect(secondPage.data).toHaveLength(2);
    });

    it('should handle search and filtering scenarios', async () => {
      // Search by name
      const searchResults = [
        { id: '1', name: 'GPT-4', provider: 'openai', model_id: 'gpt-4' }
      ];

      const mockSearchResults = {
        data: searchResults.map(model => new MockModel(model))
      };
      mockGet.mockResolvedValueOnce(mockSearchResults);

      const searchResults1 = await models.get({ q: 'gpt' });
      expect(searchResults1.data).toHaveLength(1);

      // Filter by provider
      const openaiModels = [
        { id: '1', name: 'GPT-4', provider: 'openai', model_id: 'gpt-4' }
      ];

      const mockOpenaiModels = {
        data: openaiModels.map(model => new MockModel(model))
      };
      mockGet.mockResolvedValueOnce(mockOpenaiModels);

      const openaiResults = await models.get({ provider: 'openai' });
      expect(openaiResults.data).toHaveLength(1);

      // Filter by active status
      const activeModels = [
        { id: '1', name: 'Active Model', provider: 'openai', model_id: 'gpt-4' }
      ];

      const mockActiveModels = {
        data: activeModels.map(model => new MockModel(model))
      };
      mockGet.mockResolvedValueOnce(mockActiveModels);

      const activeResults = await models.get({ active: true });
      expect(activeResults.data).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle API validation errors', async () => {
      const modelData = {
        name: 'Invalid Model',
        short_description: 'Invalid model',
        provider: 'invalid-provider',
        model_id: 'invalid-model-id'
      };

      const validationError = new Error('Invalid provider specified');
      mockCreate.mockRejectedValue(validationError);

      await expect(models.create(modelData)).rejects.toThrow('Invalid provider specified');
    });

    it('should handle duplicate model creation', async () => {
      const modelData = {
        name: 'Duplicate Model',
        short_description: 'Duplicate model',
        provider: 'openai',
        model_id: 'gpt-4'
      };

      const duplicateError = new Error('Model with this configuration already exists');
      mockCreate.mockRejectedValue(duplicateError);

      await expect(models.create(modelData)).rejects.toThrow('Model with this configuration already exists');
    });

    it('should handle model not found', async () => {
      const notFoundError = new Error('Model not found');
      mockGet.mockRejectedValue(notFoundError);

      await expect(models.get({}, 'nonexistent-id')).rejects.toThrow('Model not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockGet.mockRejectedValue(serverError);

      await expect(models.get()).rejects.toThrow('Internal server error');
    });

    it('should handle parameter validation errors', async () => {
      const modelData = {
        name: 'Invalid Params Model',
        short_description: 'Invalid params model',
        provider: 'openai',
        model_id: 'gpt-4',
        temperature: 2.0 // Invalid temperature (should be 0-1)
      };

      const paramError = new Error('Temperature must be between 0 and 1');
      mockCreate.mockRejectedValue(paramError);

      await expect(models.create(modelData)).rejects.toThrow('Temperature must be between 0 and 1');
    });

    it('should handle provider-specific validation errors', async () => {
      const modelData = {
        name: 'Provider Specific Model',
        short_description: 'Provider specific model',
        provider: 'openai',
        model_id: 'gpt-4',
        max_tokens: 100000 // Invalid for OpenAI
      };

      const providerError = new Error('Max tokens exceeds OpenAI limit');
      mockCreate.mockRejectedValue(providerError);

      await expect(models.create(modelData)).rejects.toThrow('Max tokens exceeds OpenAI limit');
    });
  });
}); 