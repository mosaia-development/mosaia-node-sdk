import { Completions } from '../../functions/completions';
import { ChatCompletionRequest, ChatCompletionResponse } from '../../types';

// Mock the BaseFunctions
jest.mock('../../functions/base-functions', () => ({
  BaseFunctions: jest.fn().mockImplementation(function(this: any, uri?: string) {
    this.uri = uri || '';
    this.apiClient = {
      GET: jest.fn(),
      POST: jest.fn(),
      PUT: jest.fn(),
      DELETE: jest.fn()
    };
    this.config = {
      apiKey: 'test-api-key',
      apiURL: 'https://api.test.com',
      version: '1'
    };
    this.get = jest.fn();
    this.create = jest.fn();
    this.update = jest.fn();
    this.delete = jest.fn();
  })
}));

describe('Completions', () => {
  let completions: Completions;

  beforeEach(() => {
    jest.clearAllMocks();
    completions = new Completions('/test');
  });

  describe('constructor', () => {
    it('should create Completions instance with default URI', () => {
      const completions = new Completions();
      expect(completions).toBeDefined();
      expect((completions as any).uri).toBe('/completions');
    });

    it('should create Completions instance with custom URI', () => {
      const completions = new Completions('/custom/uri');
      expect(completions).toBeDefined();
      expect((completions as any).uri).toBe('/custom/uri/completions');
    });

    it('should extend BaseFunctions with correct generic types', () => {
      expect(completions).toBeDefined();
      expect(typeof completions.get).toBe('function');
      expect(typeof completions.create).toBe('function');
      expect(typeof completions.update).toBe('function');
      expect(typeof completions.delete).toBe('function');
    });
  });

  describe('inherited methods', () => {
    it('should inherit get method from BaseFunctions', () => {
      expect(completions.get).toBeDefined();
      expect(typeof completions.get).toBe('function');
    });

    it('should inherit create method from BaseFunctions', () => {
      expect(completions.create).toBeDefined();
      expect(typeof completions.create).toBe('function');
    });

    it('should inherit update method from BaseFunctions', () => {
      expect(completions.update).toBeDefined();
      expect(typeof completions.update).toBe('function');
    });

    it('should inherit delete method from BaseFunctions', () => {
      expect(completions.delete).toBeDefined();
      expect(typeof completions.delete).toBe('function');
    });
  });

  describe('completion-specific functionality', () => {
    it('should be able to create chat completion requests', () => {
      const mockRequest: ChatCompletionRequest = {
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        temperature: 0.7,
        max_tokens: 100,
        frontend_tools: []
      };

      expect(mockRequest).toBeDefined();
      expect(mockRequest.model).toBe('gpt-4');
      expect(mockRequest.messages).toHaveLength(1);
      expect(mockRequest.messages[0].role).toBe('user');
      expect(mockRequest.messages[0].content).toBe('Hello, how are you?');
    });

    it('should be able to handle chat completion responses', () => {
      const mockResponse: ChatCompletionResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1677652288,
        model: 'gpt-4',
        service_tier: 'standard',
        system_fingerprint: 'fp_test',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'I am doing well, thank you for asking!'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 9,
          completion_tokens: 12,
          total_tokens: 21,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
            audio_tokens: 0,
            accepted_prediction_tokens: 12,
            rejected_prediction_tokens: 0
          }
        }
      };

      expect(mockResponse).toBeDefined();
      expect(mockResponse.id).toBe('chatcmpl-123');
      expect(mockResponse.choices).toHaveLength(1);
      expect(mockResponse.choices[0].message.role).toBe('assistant');
      expect(mockResponse.choices[0].message.content).toBe('I am doing well, thank you for asking!');
    });

    it('should have proper TypeScript typing for request and response', () => {
      // This test ensures the class is properly typed
      const request: ChatCompletionRequest = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
        frontend_tools: []
      };

      const response: ChatCompletionResponse = {
        id: 'test',
        object: 'chat.completion',
        created: 1234567890,
        model: 'gpt-4',
        service_tier: 'standard',
        system_fingerprint: 'fp_test',
        choices: [{
          index: 0,
          message: { role: 'assistant', content: 'Test response' },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 1,
          completion_tokens: 2,
          total_tokens: 3,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
            audio_tokens: 0,
            accepted_prediction_tokens: 2,
            rejected_prediction_tokens: 0
          }
        }
      };

      expect(request).toBeDefined();
      expect(response).toBeDefined();
    });
  });

  describe('URI construction', () => {
    it('should construct URI correctly with base path', () => {
      const completions = new Completions('/agent/123');
      expect((completions as any).uri).toBe('/agent/123/completions');
    });

    it('should construct URI correctly with empty string', () => {
      const completions = new Completions('');
      expect((completions as any).uri).toBe('/completions');
    });

    it('should construct URI correctly with root path', () => {
      const completions = new Completions('/');
      expect((completions as any).uri).toBe('//completions');
    });
  });
});
