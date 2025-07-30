import Models from '../apis/models';
import { MosiaConfig, ModelInterface, ChatCompletionRequest, ChatCompletionResponse } from '../types';

// Mock the APIClient
jest.mock('../apis/api-client');

describe('Models API', () => {
  let models: Models;
  const mockConfig: MosiaConfig = {
    apiKey: 'test-api-key',
    apiURL: 'https://api.test.com/v1',
    version: '1'
  };

  beforeEach(() => {
    models = new Models();
  });

  describe('Constructor', () => {
    it('should create a Models instance', () => {
      expect(models).toBeInstanceOf(Models);
    });
  });

  describe('getAll', () => {
    it('should call GET with search parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            { 
              id: '1', 
              name: 'GPT-4', 
              short_description: 'Advanced language model',
              provider: 'openai',
              model_id: 'gpt-4',
              active: true,
              public: true
            }
          ],
          paging: { limit: 10, offset: 0, total: 1 }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const params = {
        limit: 10,
        offset: 0,
        search: 'gpt',
        search_type: 'name',
        q: 'advanced language model',
        active: true,
        public: true,
        provider: 'openai'
      };

      const result = await models.getAll(params);

      expect(mockClient.GET).toHaveBeenCalledWith('/model', params);
      expect(result).toEqual(mockResponse);
    });

    it('should call GET without parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            { 
              id: '1', 
              name: 'GPT-4', 
              short_description: 'Advanced language model',
              provider: 'openai',
              model_id: 'gpt-4'
            }
          ],
          paging: { limit: 5, offset: 0, total: 1 }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const result = await models.getAll();

      expect(mockClient.GET).toHaveBeenCalledWith('/model', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should handle provider filtering', async () => {
      const mockResponse = {
        data: {
          data: [
            { 
              id: '1', 
              name: 'Claude-3', 
              short_description: 'Anthropic language model',
              provider: 'anthropic',
              model_id: 'claude-3-sonnet'
            }
          ],
          paging: { limit: 10, offset: 0, total: 1 }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const result = await models.getAll({ provider: 'anthropic' });

      expect(mockClient.GET).toHaveBeenCalledWith('/model', { provider: 'anthropic' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should call GET with model ID', async () => {
      const mockResponse = {
        data: {
          data: { 
            id: '1', 
            name: 'GPT-4', 
            short_description: 'Advanced language model',
            provider: 'openai',
            model_id: 'gpt-4',
            max_tokens: 8192,
            temperature: 0.7
          }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const result = await models.getById('1');

      expect(mockClient.GET).toHaveBeenCalledWith('/model/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle model not found', async () => {
      const mockError = {
        data: null,
        meta: {
          status: 404,
          message: 'Model not found'
        },
        error: {
          message: 'Model not found',
          code: 'MODEL_NOT_FOUND',
          status: 404
        }
      };

      const mockClient = {
        GET: jest.fn().mockRejectedValue(mockError)
      };

      (models as any).client = mockClient;

      await expect(models.getById('nonexistent')).rejects.toEqual(mockError);
    });
  });

  describe('create', () => {
    it('should call POST with model data', async () => {
      const mockResponse = {
        data: {
          data: { 
            id: '2', 
            name: 'Custom GPT-4', 
            short_description: 'Custom GPT-4 model',
            provider: 'openai',
            model_id: 'gpt-4-turbo',
            max_tokens: 4096,
            temperature: 0.5,
            public: true,
            active: true
          }
        },
        status: 201
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const newModel: Omit<ModelInterface, 'id'> = {
        name: 'Custom GPT-4',
        short_description: 'Custom GPT-4 model',
        provider: 'openai',
        model_id: 'gpt-4-turbo',
        max_tokens: 4096,
        temperature: 0.5,
        public: true,
        active: true,
        tags: ['gpt-4', 'turbo', 'custom']
      };

      const result = await models.create(newModel);

      expect(mockClient.POST).toHaveBeenCalledWith('/model', newModel);
      expect(result).toEqual(mockResponse);
    });

    it('should handle required fields validation', async () => {
      const mockError = {
        data: null,
        meta: {
          status: 400,
          message: 'Validation error'
        },
        error: {
          message: 'Name is required',
          code: 'VALIDATION_ERROR',
          status: 400
        }
      };

      const mockClient = {
        POST: jest.fn().mockRejectedValue(mockError)
      };

      (models as any).client = mockClient;

      const invalidModel = {
        short_description: 'Missing name',
        provider: 'openai',
        model_id: 'gpt-4'
      };

      await expect(models.create(invalidModel as any)).rejects.toEqual(mockError);
    });
  });

  describe('update', () => {
    it('should call PUT with model ID and update data', async () => {
      const mockResponse = {
        data: {
          data: { 
            id: '1', 
            name: 'Updated GPT-4', 
            short_description: 'Updated description',
            provider: 'openai',
            model_id: 'gpt-4',
            max_tokens: 8192,
            temperature: 0.8
          }
        },
        status: 200
      };

      const mockClient = {
        PUT: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const updateData = {
        name: 'Updated GPT-4',
        short_description: 'Updated description',
        temperature: 0.8
      };

      const result = await models.update('1', updateData);

      expect(mockClient.PUT).toHaveBeenCalledWith('/model/1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle partial updates', async () => {
      const mockResponse = {
        data: {
          data: { 
            id: '1', 
            name: 'GPT-4', 
            short_description: 'Advanced language model',
            provider: 'openai',
            model_id: 'gpt-4',
            max_tokens: 16384, // Updated
            temperature: 0.7
          }
        },
        status: 200
      };

      const mockClient = {
        PUT: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const result = await models.update('1', { max_tokens: 16384 });

      expect(mockClient.PUT).toHaveBeenCalledWith('/model/1', { max_tokens: 16384 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call DELETE with model ID for soft delete', async () => {
      const mockResponse = {
        data: null,
        meta: {
          status: 200,
          message: 'Model deleted successfully'
        },
        error: null
      };

      const mockClient = {
        DELETE: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const result = await models.delete('1');

      expect(mockClient.DELETE).toHaveBeenCalledWith('/model/1', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call DELETE with force parameter for hard delete', async () => {
      const mockResponse = {
        data: null,
        meta: {
          status: 200,
          message: 'Model permanently deleted'
        },
        error: null
      };

      const mockClient = {
        DELETE: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const result = await models.delete('1', { force: true });

      expect(mockClient.DELETE).toHaveBeenCalledWith('/model/1', { force: true });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('chatCompletion', () => {
    it('should call POST with chat completion request', async () => {
      const mockResponse = {
        data: {
          id: 'chatcmpl-123',
          object: 'chat.completion',
          created: 1677652288,
          model: 'gpt-4',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'The capital of France is Paris.'
              },
              finish_reason: 'stop'
            }
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 8,
            total_tokens: 18
          }
        },
        meta: {
          status: 200,
          message: 'Success'
        },
        error: null
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const request: ChatCompletionRequest = {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is the capital of France?' }
        ],
        max_tokens: 100,
        temperature: 0.7,
        logging: true,
        log_id: 'conversation-123'
      };

      const result = await models.chatCompletion(request);

      expect(mockClient.POST).toHaveBeenCalledWith('/model/chat/completions', request);
      expect(result).toEqual(mockResponse);
    });

    it('should handle streaming chat completion', async () => {
      const mockResponse = {
        data: {
          id: 'chatcmpl-123',
          object: 'chat.completion.chunk',
          created: 1677652288,
          model: 'gpt-4',
          choices: [
            {
              index: 0,
              delta: {
                role: 'assistant',
                content: 'The'
              },
              finish_reason: null
            }
          ]
        },
        meta: {
          status: 200,
          message: 'Success'
        },
        error: null
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue(mockResponse)
      };

      (models as any).client = mockClient;

      const request: ChatCompletionRequest = {
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'What is the capital of France?' }
        ],
        stream: true
      };

      const result = await models.chatCompletion(request);

      expect(mockClient.POST).toHaveBeenCalledWith('/model/chat/completions', request);
      expect(result).toEqual(mockResponse);
    });

    it('should handle chat completion errors', async () => {
      const mockError = {
        data: null,
        meta: {
          status: 400,
          message: 'Invalid request'
        },
        error: {
          message: 'Model not found',
          code: 'MODEL_NOT_FOUND',
          status: 400
        }
      };

      const mockClient = {
        POST: jest.fn().mockRejectedValue(mockError)
      };

      (models as any).client = mockClient;

      const request: ChatCompletionRequest = {
        model: 'nonexistent-model',
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      };

      await expect(models.chatCompletion(request)).rejects.toEqual(mockError);
    });
  });

  describe('Model interface validation', () => {
    it('should validate required fields for model creation', () => {
      const validModel: Omit<ModelInterface, 'id'> = {
        name: 'Test Model',
        short_description: 'Test description',
        provider: 'openai',
        model_id: 'gpt-4'
      };

      expect(validModel.name).toBeDefined();
      expect(validModel.short_description).toBeDefined();
      expect(validModel.provider).toBeDefined();
      expect(validModel.model_id).toBeDefined();
    });

    it('should handle optional fields', () => {
      const modelWithOptionalFields: Omit<ModelInterface, 'id'> = {
        name: 'Test Model',
        short_description: 'Test description',
        provider: 'openai',
        model_id: 'gpt-4',
        long_description: 'Detailed description',
        max_tokens: 4096,
        temperature: 0.7,
        public: true,
        active: true,
        tags: ['test', 'gpt-4'],
        keywords: ['language', 'model'],
        external_id: 'ext-123',
        extensors: {
          custom_field: 'custom_value'
        }
      };

      expect(modelWithOptionalFields.long_description).toBeDefined();
      expect(modelWithOptionalFields.max_tokens).toBeDefined();
      expect(modelWithOptionalFields.temperature).toBeDefined();
      expect(modelWithOptionalFields.public).toBeDefined();
      expect(modelWithOptionalFields.active).toBeDefined();
      expect(modelWithOptionalFields.tags).toBeDefined();
      expect(modelWithOptionalFields.keywords).toBeDefined();
      expect(modelWithOptionalFields.external_id).toBeDefined();
      expect(modelWithOptionalFields.extensors).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      const mockClient = {
        GET: jest.fn().mockRejectedValue(networkError)
      };

      (models as any).client = mockClient;

      await expect(models.getAll()).rejects.toThrow('Network error');
    });

    it('should handle API errors with proper structure', async () => {
      const apiError = {
        data: null,
        meta: {
          status: 500,
          message: 'Internal server error'
        },
        error: {
          message: 'Something went wrong',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };

      const mockClient = {
        GET: jest.fn().mockRejectedValue(apiError)
      };

      (models as any).client = mockClient;

      await expect(models.getAll()).rejects.toEqual(apiError);
    });
  });
}); 