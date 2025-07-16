import Agents from '../apis/agents';
import { MosiaConfig, AgentInterface, ChatCompletionRequest, ChatCompletionResponse } from '../types';

// Mock the APIClient
jest.mock('../apis/api-client');

describe('Agents API', () => {
  let agents: Agents;
  const mockConfig: MosiaConfig = {
    apiKey: 'test-api-key',
    baseURL: 'https://api.test.com/v1',
    version: '1'
  };

  beforeEach(() => {
    agents = new Agents(mockConfig);
  });

  describe('Constructor', () => {
    it('should create an Agents instance', () => {
      expect(agents).toBeInstanceOf(Agents);
    });
  });

  describe('getAll', () => {
    it('should call GET with search parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', name: 'Assistant', short_description: 'Helpful AI' }
          ],
          paging: { limit: 10, offset: 0, total: 1 }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (agents as any).client = mockClient;

      const params = {
        limit: 10,
        offset: 0,
        search: 'assistant',
        search_type: 'chat',
        q: 'helpful assistant',
        active: true,
        public: true
      };

      const result = await agents.getAll(params);

      expect(mockClient.GET).toHaveBeenCalledWith('/agent', params);
      expect(result).toEqual(mockResponse);
    });

    it('should call GET without parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', name: 'Assistant', short_description: 'Helpful AI' }
          ],
          paging: { limit: 5, offset: 0, total: 1 }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (agents as any).client = mockClient;

      const result = await agents.getAll();

      expect(mockClient.GET).toHaveBeenCalledWith('/agent', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should call GET with agent ID', async () => {
      const mockResponse = {
        data: {
          data: { id: '1', name: 'Assistant', short_description: 'Helpful AI' }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (agents as any).client = mockClient;

      const result = await agents.getById('1');

      expect(mockClient.GET).toHaveBeenCalledWith('/agent/1', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call GET with export parameter', async () => {
      const mockResponse = {
        data: {
          data: { id: '1', name: 'Assistant', short_description: 'Helpful AI' }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (agents as any).client = mockClient;

      const result = await agents.getById('1', { export: 'full' });

      expect(mockClient.GET).toHaveBeenCalledWith('/agent/1', { export: 'full' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call POST with agent data', async () => {
      const agentData: Omit<AgentInterface, 'id'> = {
        name: 'New Assistant',
        short_description: 'A new helpful assistant',
        model: 'model-id',
        system_prompt: 'You are a helpful assistant.'
      };

      const mockResponse = {
        data: {
          data: { id: '2', ...agentData }
        },
        status: 201
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue(mockResponse)
      };

      (agents as any).client = mockClient;

      const result = await agents.create(agentData);

      expect(mockClient.POST).toHaveBeenCalledWith('/agent', agentData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call PUT with agent ID and update data', async () => {
      const updateData = {
        name: 'Updated Assistant'
      };

      const mockResponse = {
        data: {
          data: { id: '1', name: 'Updated Assistant', short_description: 'Helpful AI' }
        },
        status: 200
      };

      const mockClient = {
        PUT: jest.fn().mockResolvedValue(mockResponse)
      };

      (agents as any).client = mockClient;

      const result = await agents.update('1', updateData);

      expect(mockClient.PUT).toHaveBeenCalledWith('/agent/1', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call DELETE with agent ID', async () => {
      const mockResponse = {
        data: null,
        status: 204
      };

      const mockClient = {
        DELETE: jest.fn().mockResolvedValue(mockResponse)
      };

      (agents as any).client = mockClient;

      const result = await agents.delete('1');

      expect(mockClient.DELETE).toHaveBeenCalledWith('/agent/1', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call DELETE with force parameter', async () => {
      const mockResponse = {
        data: null,
        status: 204
      };

      const mockClient = {
        DELETE: jest.fn().mockResolvedValue(mockResponse)
      };

      (agents as any).client = mockClient;

      const result = await agents.delete('1', { force: true });

      expect(mockClient.DELETE).toHaveBeenCalledWith('/agent/1', { force: true });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('chatCompletion', () => {
    it('should call POST with chat completion request', async () => {
      const chatRequest: ChatCompletionRequest = {
        model: 'agent-id',
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        max_tokens: 100,
        temperature: 0.7
      };

      const mockResponse: ChatCompletionResponse = {
        id: 'chat-completion-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'agent-id',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Hello! I am doing well, thank you for asking.' },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25
        }
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 })
      };

      (agents as any).client = mockClient;

      const result = await agents.chatCompletion(chatRequest);

      expect(mockClient.POST).toHaveBeenCalledWith('/agent/chat/completions', chatRequest);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('asyncChatCompletion', () => {
    it('should call POST with async chat completion request', async () => {
      const chatRequest: ChatCompletionRequest & { type: 'async' } = {
        model: 'agent-id',
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        type: 'async',
        max_tokens: 100
      };

      const mockResponse: ChatCompletionResponse = {
        id: 'async-chat-completion-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'agent-id',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Hello! I am doing well, thank you for asking.' },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25
        }
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue({ data: mockResponse, status: 201 })
      };

      (agents as any).client = mockClient;

      const result = await agents.asyncChatCompletion(chatRequest);

      expect(mockClient.POST).toHaveBeenCalledWith('/agent/chat/completions', chatRequest);
      expect(result.data).toEqual(mockResponse);
    });
  });
}); 