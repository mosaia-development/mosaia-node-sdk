import { Agent } from '../../models';
import { AgentInterface } from '../../types';

// Mock the BaseModel
jest.mock('../../models/base', () => ({
  BaseModel: jest.fn().mockImplementation(function(this: any, data: any, uri?: string) {
    this.data = data;
    this.uri = uri || '/agent';
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
    this.getUri = jest.fn().mockReturnValue('/agent/123');
    this.save = jest.fn();
    this.delete = jest.fn();
    this.isActive = jest.fn().mockReturnValue(data.active === true);
    this.toJSON = jest.fn().mockReturnValue(data);
    this.toAPIPayload = jest.fn().mockImplementation(() => {
      const payload = { ...this.data };
      delete payload.id;
      return payload;
    });
    
    // Set properties from data
    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
  })
}));

// Mock the Chat functions
jest.mock('../../functions/chat', () => ({
  Chat: jest.fn().mockImplementation(() => ({
    completions: {
      create: jest.fn()
    }
  }))
}));

describe('Agent Model', () => {
  let agent: any; // Use any to access protected properties in tests
  let mockApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const agentData: Partial<AgentInterface> = {
      id: '123',
      name: 'Test Agent',
      short_description: 'A test agent',
      model: 'gpt-4',
      temperature: 0.7,
      system_prompt: 'You are a helpful assistant.',
      active: true
    };

    agent = new Agent(agentData);
    mockApiClient = agent.apiClient;
  });

  describe('constructor', () => {
    it('should create Agent instance with default URI', () => {
      const agentData: Partial<AgentInterface> = {
        id: '123',
        name: 'Test Agent',
        short_description: 'A test agent'
      };

      const agent = new Agent(agentData);
      expect(agent).toBeDefined();
      expect((agent as any).uri).toBe('/agent');
    });

    it('should create Agent instance with custom URI', () => {
      const agentData: Partial<AgentInterface> = {
        id: '123',
        name: 'Test Agent',
        short_description: 'A test agent'
      };

      const agent = new Agent(agentData, '/custom/agent');
      expect(agent).toBeDefined();
      expect((agent as any).uri).toBe('/custom/agent');
    });

    it('should set agent properties from data', () => {
      const agentData: Partial<AgentInterface> = {
        id: '123',
        name: 'Test Agent',
        short_description: 'A test agent',
        model: 'gpt-4',
        temperature: 0.7
      };

      const agent = new Agent(agentData);
      expect((agent as any).name).toBe('Test Agent');
      expect((agent as any).short_description).toBe('A test agent');
      expect((agent as any).model).toBe('gpt-4');
      expect((agent as any).temperature).toBe(0.7);
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockFile = new File(['image data'], 'agent-avatar.png', { type: 'image/png' });
      const mockResponse = {
        data: {
          id: '123',
          name: 'Test Agent',
          short_description: 'A test agent',
          model: 'gpt-4',
          temperature: 0.7,
          system_prompt: 'You are a helpful assistant.',
          active: true
        }
      };

      mockApiClient.POST.mockResolvedValue(mockResponse);

      const result = await agent.uploadImage(mockFile);

      expect(mockApiClient.POST).toHaveBeenCalledWith('/agent/123/image/upload', expect.any(FormData));
      expect(result).toBe(agent);
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['image data'], 'agent-avatar.png', { type: 'image/png' });
      const uploadError = new Error('Upload failed');
      mockApiClient.POST.mockRejectedValue(uploadError);

      await expect(agent.uploadImage(mockFile)).rejects.toThrow('Upload failed');
    });

    it('should create FormData with file', async () => {
      const mockFile = new File(['image data'], 'agent-avatar.png', { type: 'image/png' });
      const mockResponse = { data: { id: '123', name: 'Test Agent' } };
      mockApiClient.POST.mockResolvedValue(mockResponse);

      await agent.uploadImage(mockFile);

      expect(mockApiClient.POST).toHaveBeenCalledWith('/agent/123/image/upload', expect.any(FormData));
    });
  });

  describe('chat getter', () => {
    it('should return Chat instance with completions', () => {
      const { Chat } = require('../../functions/chat');
      
      const chat = agent.chat;

      expect(Chat).toHaveBeenCalled();
      expect(chat).toBeDefined();
      expect(chat.completions).toBeDefined();
      expect(chat.completions.create).toBeDefined();
    });

    it('should allow chat completions', async () => {
      const { Chat } = require('../../functions/chat');
      const mockCompletions = {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Hello!' } }]
        })
      };
      (Chat as jest.Mock).mockReturnValue({
        completions: mockCompletions
      });

      const chat = agent.chat;
      const result = await chat.completions.create({
        messages: [{ role: 'user', content: 'Hello' }]
      });

      expect(mockCompletions.create).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: 'Hello' }]
      });
      expect(result).toEqual({
        choices: [{ message: { content: 'Hello!' } }]
      });
    });
  });

  describe('inherited methods', () => {
    it('should inherit save method from BaseModel', () => {
      expect(agent.save).toBeDefined();
      expect(typeof agent.save).toBe('function');
    });

    it('should inherit delete method from BaseModel', () => {
      expect(agent.delete).toBeDefined();
      expect(typeof agent.delete).toBe('function');
    });

    it('should inherit update method from BaseModel', () => {
      expect(agent.update).toBeDefined();
      expect(typeof agent.update).toBe('function');
    });

    it('should inherit isActive method from BaseModel', () => {
      expect(agent.isActive).toBeDefined();
      expect(typeof agent.isActive).toBe('function');
    });

    it('should inherit toJSON method from BaseModel', () => {
      expect(agent.toJSON).toBeDefined();
      expect(typeof agent.toJSON).toBe('function');
    });

    it('should inherit toAPIPayload method from BaseModel', () => {
      expect(agent.toAPIPayload).toBeDefined();
      expect(typeof agent.toAPIPayload).toBe('function');
    });
  });

  describe('data access', () => {
    it('should access agent data properties', () => {
      expect((agent as any).name).toBe('Test Agent');
      expect((agent as any).short_description).toBe('A test agent');
      expect((agent as any).model).toBe('gpt-4');
      expect((agent as any).temperature).toBe(0.7);
      expect((agent as any).system_prompt).toBe('You are a helpful assistant.');
      expect((agent as any).active).toBe(true);
    });

    it('should return agent data via toJSON', () => {
      const jsonData = agent.toJSON();
      expect(jsonData).toEqual({
        id: '123',
        name: 'Test Agent',
        short_description: 'A test agent',
        model: 'gpt-4',
        temperature: 0.7,
        system_prompt: 'You are a helpful assistant.',
        active: true
      });
    });

    it('should return API payload without read-only fields', () => {
      const apiPayload = agent.toAPIPayload();
      expect(apiPayload).toEqual({
        name: 'Test Agent',
        short_description: 'A test agent',
        model: 'gpt-4',
        temperature: 0.7,
        system_prompt: 'You are a helpful assistant.',
        active: true
      });
      expect(apiPayload.id).toBeUndefined();
    });
  });

  describe('agent-specific functionality', () => {
    it('should handle agent configuration updates', () => {
      const updates = {
        temperature: 0.9,
        system_prompt: 'You are a creative assistant.'
      };

      agent.update(updates);

      expect((agent as any).temperature).toBe(0.9);
      expect((agent as any).system_prompt).toBe('You are a creative assistant.');
    });

    it('should check if agent is active', () => {
      expect(agent.isActive()).toBe(true);

      const inactiveAgent = new Agent({
        id: '456',
        name: 'Inactive Agent',
        short_description: 'An inactive agent',
        active: false
      });

      expect(inactiveAgent.isActive()).toBe(false);
    });
  });
});
