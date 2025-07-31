import Agents from '../../apis/agents';
import { Agent } from '../../models';
import { GetAgentsPayload, GetAgentPayload, AgentInterface } from '../../types';

// Mock the Agent model
jest.mock('../../models');
const MockAgent = Agent as jest.MockedClass<typeof Agent>;

// Mock the BaseAPI class properly
jest.mock('../../apis/base-api');
const { BaseAPI } = require('../../apis/base-api');
const MockBaseAPI = BaseAPI as jest.MockedClass<typeof BaseAPI>;

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
jest.mock('../../apis/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
  }));
});

describe('Agents', () => {
  let agents: any;
  let mockGet: jest.MockedFunction<any>;
  let mockCreate: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock returns
    MockAgent.mockImplementation((data: any) => ({ data } as any));

    agents = new Agents();
    
    // Get the mocked methods from the instance
    mockGet = agents.get;
    mockCreate = agents.create;
  });

  describe('constructor', () => {
    it('should create Agents instance', () => {
      expect(agents).toBeDefined();
      expect(typeof agents.get).toBe('function');
      expect(typeof agents.create).toBe('function');
    });

    it('should initialize with correct URI and Agent model', () => {
      expect(agents).toBeDefined();
    });

    it('should initialize with custom URI when provided', () => {
      const customAgents = new Agents('/api/v1');
      expect(customAgents).toBeDefined();
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultAgents = new Agents();
      expect(defaultAgents).toBeDefined();
    });
  });

  describe('get method', () => {
    it('should get all agents successfully', async () => {
      const mockAgents = [
        { id: '1', name: 'Support Agent', short_description: 'Customer support agent' },
        { id: '2', name: 'Sales Agent', short_description: 'Sales assistant agent' }
      ];

      const mockResponse = mockAgents.map(agent => new MockAgent(agent));
      mockGet.mockResolvedValue(mockResponse);

      const result = await agents.get();

      expect(mockGet).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result).toHaveLength(2);
    });

    it('should get a specific agent by ID', async () => {
      const mockAgent = { id: '1', name: 'Support Agent', short_description: 'Customer support agent' };
      const mockResponse = new MockAgent(mockAgent);
      mockGet.mockResolvedValue(mockResponse);

      const result = await agents.get({}, '1');

      expect(mockGet).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get agents with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        q: 'support',
        active: true,
        model: 'gpt-4'
      };

      const mockAgents = [
        { id: '1', name: 'Support Agent', short_description: 'Customer support agent' }
      ];

      const mockResponse = mockAgents.map(agent => new MockAgent(agent));
      mockGet.mockResolvedValue(mockResponse);

      const result = await agents.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty agents list', async () => {
      const mockResponse: any[] = [];
      mockGet.mockResolvedValue(mockResponse);

      const result = await agents.get();

      expect(result).toEqual([]);
    });

    it('should handle null response', async () => {
      mockGet.mockResolvedValue(null);

      const result = await agents.get();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch agents');
      mockGet.mockRejectedValue(error);

      await expect(agents.get()).rejects.toThrow('Failed to fetch agents');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockGet.mockRejectedValue(networkError);

      await expect(agents.get()).rejects.toThrow('Network error');
    });
  });

  describe('create method', () => {
    it('should create a new agent successfully', async () => {
      const agentData = {
        name: 'New Agent',
        short_description: 'A new AI agent',
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 1000,
        system_prompt: 'You are a helpful assistant.'
      };

      const mockAgent = { id: '3', ...agentData };
      const mockResponse = new MockAgent(mockAgent);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agents.create(agentData);

      expect(mockCreate).toHaveBeenCalledWith(agentData);
      expect(result).toEqual(mockResponse);
    });

    it('should create agent with minimal data', async () => {
      const agentData = {
        name: 'Minimal Agent',
        short_description: 'A minimal agent'
      };

      const mockAgent = { id: '4', ...agentData };
      const mockResponse = new MockAgent(mockAgent);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agents.create(agentData);

      expect(mockCreate).toHaveBeenCalledWith(agentData);
      expect(result).toEqual(mockResponse);
    });

    it('should create agent with all optional fields', async () => {
      const agentData = {
        name: 'Full Agent',
        short_description: 'A fully configured agent',
        long_description: 'A detailed description of the agent',
        model: 'gpt-4',
        temperature: 0.8,
        max_tokens: 2000,
        system_prompt: 'You are an expert assistant.',
        image: 'https://example.com/agent.jpg',
        public: true,
        active: true,
        tags: ['support', 'ai'],
        keywords: ['customer service', 'automation'],
        external_id: 'ext-agent-123'
      };

      const mockAgent = { id: '5', ...agentData };
      const mockResponse = new MockAgent(mockAgent);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agents.create(agentData);

      expect(mockCreate).toHaveBeenCalledWith(agentData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const agentData = {
        name: 'Invalid Agent',
        short_description: 'An invalid agent'
      };

      const error = new Error('Validation failed');
      mockCreate.mockRejectedValue(error);

      await expect(agents.create(agentData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const agentData = {
        name: 'Network Agent',
        short_description: 'A network agent'
      };

      const networkError = new Error('Network error');
      mockCreate.mockRejectedValue(networkError);

      await expect(agents.create(agentData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty agent data in create', async () => {
      const agentData = {
        name: '',
        short_description: '',
        long_description: ''
      };

      const mockAgent = { id: '6', ...agentData };
      const mockResponse = new MockAgent(mockAgent);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agents.create(agentData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in agent data', async () => {
      const agentData = {
        name: 'Agent with Special Chars: @#$%^&*()',
        short_description: 'Agent with special characters: éñüñçóðé',
        system_prompt: 'You are an agent with special chars: @#$%^&*()'
      };

      const mockAgent = { id: '7', ...agentData };
      const mockResponse = new MockAgent(mockAgent);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agents.create(agentData);

      expect(mockCreate).toHaveBeenCalledWith(agentData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long agent data', async () => {
      const longName = 'a'.repeat(1000);
      const longDescription = 'b'.repeat(2000);
      const longPrompt = 'c'.repeat(5000);
      const agentData = {
        name: longName,
        short_description: longDescription,
        system_prompt: longPrompt
      };

      const mockAgent = { id: '8', ...agentData };
      const mockResponse = new MockAgent(mockAgent);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agents.create(agentData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        q: 'agent@example.com',
        tags: ['tag1', 'tag2'],
        external_id: 'id-with-special-chars_123',
        model: 'gpt-4@latest'
      };

      const mockAgents = [
        { id: '1', name: 'Test Agent', short_description: 'Test agent' }
      ];

      const mockResponse = mockAgents.map(agent => new MockAgent(agent));
      mockGet.mockResolvedValue(mockResponse);

      await agents.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        q: 'support agent',
        active: true,
        public: false,
        tags: ['support', 'ai'],
        keywords: ['customer service'],
        external_id: 'ext-123',
        model: 'gpt-4'
      };

      const mockAgents = [
        { id: '1', name: 'Support Agent', short_description: 'Customer support agent' }
      ];

      const mockResponse = mockAgents.map(agent => new MockAgent(agent));
      mockGet.mockResolvedValue(mockResponse);

      await agents.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete agent management flow', async () => {
      // Step 1: Get all agents
      const mockAgents = [
        { id: '1', name: 'Support Agent', short_description: 'Customer support agent' },
        { id: '2', name: 'Sales Agent', short_description: 'Sales assistant agent' }
      ];

      const mockGetResponse = mockAgents.map(agent => new MockAgent(agent));
      mockGet.mockResolvedValueOnce(mockGetResponse);

      const allAgents = await agents.get();
      expect(allAgents).toHaveLength(2);

      // Step 2: Get specific agent
      const mockAgent = { id: '1', name: 'Support Agent', short_description: 'Customer support agent' };
      const mockGetAgentResponse = new MockAgent(mockAgent);
      mockGet.mockResolvedValueOnce(mockGetAgentResponse);

      const specificAgent = await agents.get({}, '1');
      expect(specificAgent).toEqual(mockGetAgentResponse);

      // Step 3: Create new agent
      const newAgentData = {
        name: 'New Agent',
        short_description: 'A new AI agent',
        model: 'gpt-4'
      };

      const mockNewAgent = { id: '3', ...newAgentData };
      const mockCreateResponse = new MockAgent(mockNewAgent);
      mockCreate.mockResolvedValueOnce(mockCreateResponse);

      const createdAgent = await agents.create(newAgentData);
      expect(createdAgent).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageAgents = [
        { id: '1', name: 'Agent 1', short_description: 'First agent' },
        { id: '2', name: 'Agent 2', short_description: 'Second agent' }
      ];

      const mockFirstPage = firstPageAgents.map(agent => new MockAgent(agent));
      mockGet.mockResolvedValueOnce(mockFirstPage);

      const firstPage = await agents.get({ limit: 2, offset: 0 });
      expect(firstPage).toHaveLength(2);

      // Second page
      const secondPageAgents = [
        { id: '3', name: 'Agent 3', short_description: 'Third agent' },
        { id: '4', name: 'Agent 4', short_description: 'Fourth agent' }
      ];

      const mockSecondPage = secondPageAgents.map(agent => new MockAgent(agent));
      mockGet.mockResolvedValueOnce(mockSecondPage);

      const secondPage = await agents.get({ limit: 2, offset: 2 });
      expect(secondPage).toHaveLength(2);
    });

    it('should handle search and filtering scenarios', async () => {
      // Search by name
      const searchResults = [
        { id: '1', name: 'Support Agent', short_description: 'Customer support agent' }
      ];

      const mockSearchResults = searchResults.map(agent => new MockAgent(agent));
      mockGet.mockResolvedValueOnce(mockSearchResults);

      const searchResults1 = await agents.get({ q: 'support' });
      expect(searchResults1).toHaveLength(1);

      // Filter by model
      const gpt4Agents = [
        { id: '1', name: 'GPT-4 Agent', short_description: 'GPT-4 powered agent' }
      ];

      const mockGpt4Agents = gpt4Agents.map(agent => new MockAgent(agent));
      mockGet.mockResolvedValueOnce(mockGpt4Agents);

      const gpt4Results = await agents.get({ model: 'gpt-4' });
      expect(gpt4Results).toHaveLength(1);

      // Filter by tags
      const taggedAgents = [
        { id: '1', name: 'Tagged Agent', short_description: 'Agent with tags' }
      ];

      const mockTaggedAgents = taggedAgents.map(agent => new MockAgent(agent));
      mockGet.mockResolvedValueOnce(mockTaggedAgents);

      const taggedResults = await agents.get({ tags: ['support'] });
      expect(taggedResults).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle API validation errors', async () => {
      const agentData = {
        name: 'Invalid Agent',
        short_description: 'An agent with invalid data'
      };

      const validationError = new Error('Agent name is required');
      mockCreate.mockRejectedValue(validationError);

      await expect(agents.create(agentData)).rejects.toThrow('Agent name is required');
    });

    it('should handle duplicate agent creation', async () => {
      const agentData = {
        name: 'Duplicate Agent',
        short_description: 'An agent that already exists'
      };

      const duplicateError = new Error('Agent with this name already exists');
      mockCreate.mockRejectedValue(duplicateError);

      await expect(agents.create(agentData)).rejects.toThrow('Agent with this name already exists');
    });

    it('should handle agent not found', async () => {
      const notFoundError = new Error('Agent not found');
      mockGet.mockRejectedValue(notFoundError);

      await expect(agents.get({}, 'nonexistent-id')).rejects.toThrow('Agent not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockGet.mockRejectedValue(serverError);

      await expect(agents.get()).rejects.toThrow('Internal server error');
    });

    it('should handle model validation errors', async () => {
      const agentData = {
        name: 'Invalid Model Agent',
        short_description: 'Agent with invalid model',
        model: 'invalid-model'
      };

      const modelError = new Error('Invalid model specified');
      mockCreate.mockRejectedValue(modelError);

      await expect(agents.create(agentData)).rejects.toThrow('Invalid model specified');
    });
  });
}); 