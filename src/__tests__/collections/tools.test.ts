import Tools from '../../collections/tools';
import { Tool } from '../../models';
import { GetToolsPayload, GetToolPayload, ToolInterface } from '../../types';

// Mock the Tool model
jest.mock('../../models');
const MockTool = Tool as jest.MockedClass<typeof Tool>;

// Mock the BaseCollections class properly
jest.mock('../../collections/base-collection', () => {
  return {
          BaseCollection: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      create: jest.fn(),
    }))
  };
});

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
jest.mock('../../utils/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
  }));
});

describe('Tools', () => {
  let tools: any;
  let mockGet: jest.MockedFunction<any>;
  let mockCreate: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock returns
    MockTool.mockImplementation((data: any) => ({ data } as any));

    tools = new Tools();
    
    // Get the mocked methods from the instance
    mockGet = tools.get;
    mockCreate = tools.create;
  });

  describe('constructor', () => {
    it('should create Tools instance', () => {
      expect(tools).toBeDefined();
      expect(typeof tools.get).toBe('function');
      expect(typeof tools.create).toBe('function');
    });

    it('should initialize with correct URI and Tool model', () => {
      expect(tools).toBeDefined();
    });

    it('should initialize with custom URI when provided', () => {
      const customTools = new Tools('/api/v1');
      expect(customTools).toBeDefined();
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultTools = new Tools();
      expect(defaultTools).toBeDefined();
    });
  });

  describe('get method', () => {
    it('should get all tools successfully', async () => {
      const mockTools = [
        { id: '1', name: 'Weather API', short_description: 'Weather information tool', tool_schema: '{}' },
        { id: '2', name: 'Email Tool', short_description: 'Email sending tool', tool_schema: '{}' }
      ];

      const mockResponse = {
        data: mockTools.map(tool => new MockTool(tool))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await tools.get();

      expect(mockGet).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific tool by ID', async () => {
      const mockTool = { id: '1', name: 'Weather API', short_description: 'Weather information tool', tool_schema: '{}' };
      const mockResponse = new MockTool(mockTool);
      mockGet.mockResolvedValue(mockResponse);

      const result = await tools.get({}, '1');

      expect(mockGet).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get tools with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        q: 'weather',
        active: true,
        public: true
      };

      const mockTools = [
        { id: '1', name: 'Weather API', short_description: 'Weather information tool', tool_schema: '{}' }
      ];

      const mockResponse = {
        data: mockTools.map(tool => new MockTool(tool))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await tools.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty tools list', async () => {
      const mockResponse = { data: [] };
      mockGet.mockResolvedValue(mockResponse);

      const result = await tools.get();

      expect(result).toEqual({ data: [] });
    });

    it('should handle null response', async () => {
      mockGet.mockResolvedValue(null);

      const result = await tools.get();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch tools');
      mockGet.mockRejectedValue(error);

      await expect(tools.get()).rejects.toThrow('Failed to fetch tools');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockGet.mockRejectedValue(networkError);

      await expect(tools.get()).rejects.toThrow('Network error');
    });
  });

  describe('create method', () => {
    it('should create a new tool successfully', async () => {
      const toolData = {
        name: 'New Tool',
        friendly_name: 'New Integration Tool',
        short_description: 'A new tool integration',
        tool_schema: JSON.stringify({
          type: 'object',
          properties: {
            input: { type: 'string' }
          }
        }),
        required_environment_variables: ['API_KEY'],
        source_url: 'https://api.example.com'
      };

      const mockTool = { id: '3', ...toolData };
      const mockResponse = new MockTool(mockTool);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await tools.create(toolData);

      expect(mockCreate).toHaveBeenCalledWith(toolData);
      expect(result).toEqual(mockResponse);
    });

    it('should create tool with minimal data', async () => {
      const toolData = {
        name: 'Minimal Tool',
        friendly_name: 'Minimal Integration',
        short_description: 'A minimal tool',
        tool_schema: '{}'
      };

      const mockTool = { id: '4', ...toolData };
      const mockResponse = new MockTool(mockTool);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await tools.create(toolData);

      expect(mockCreate).toHaveBeenCalledWith(toolData);
      expect(result).toEqual(mockResponse);
    });

    it('should create tool with all optional fields', async () => {
      const toolData = {
        name: 'Full Tool',
        friendly_name: 'Full Integration Tool',
        short_description: 'A fully configured tool',
        tool_schema: JSON.stringify({
          type: 'object',
          properties: {
            input: { type: 'string' },
            options: { type: 'object' }
          }
        }),
        required_environment_variables: ['API_KEY', 'SECRET_KEY'],
        source_url: 'https://fullapi.example.com',
        url: 'https://docs.example.com',
        public: true,
        active: true,
        tags: ['api', 'integration'],
        keywords: ['external service', 'automation'],
        external_id: 'ext-tool-123'
      };

      const mockTool = { id: '5', ...toolData };
      const mockResponse = new MockTool(mockTool);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await tools.create(toolData);

      expect(mockCreate).toHaveBeenCalledWith(toolData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const toolData = {
        name: 'Invalid Tool',
        friendly_name: 'Invalid Integration',
        short_description: 'An invalid tool',
        tool_schema: '{}'
      };

      const error = new Error('Validation failed');
      mockCreate.mockRejectedValue(error);

      await expect(tools.create(toolData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const toolData = {
        name: 'Network Tool',
        friendly_name: 'Network Integration',
        short_description: 'A network tool',
        tool_schema: '{}'
      };

      const networkError = new Error('Network error');
      mockCreate.mockRejectedValue(networkError);

      await expect(tools.create(toolData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty tool data in create', async () => {
      const toolData = {
        name: '',
        friendly_name: '',
        short_description: '',
        tool_schema: ''
      };

      const mockTool = { id: '6', ...toolData };
      const mockResponse = new MockTool(mockTool);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await tools.create(toolData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in tool data', async () => {
      const toolData = {
        name: 'Tool with Special Chars: @#$%^&*()',
        friendly_name: 'Tool with special characters: éñüñçóðé',
        short_description: 'Tool with special chars: @#$%^&*()',
        tool_schema: '{}',
        source_url: 'https://example.com/tool?param=value&other=123'
      };

      const mockTool = { id: '7', ...toolData };
      const mockResponse = new MockTool(mockTool);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await tools.create(toolData);

      expect(mockCreate).toHaveBeenCalledWith(toolData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long tool data', async () => {
      const longName = 'a'.repeat(1000);
      const longDescription = 'b'.repeat(2000);
      const longSchema = 'c'.repeat(5000);
      const toolData = {
        name: longName,
        short_description: longDescription,
        tool_schema: longSchema
      };

      const mockTool = { id: '8', ...toolData };
      const mockResponse = new MockTool(mockTool);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await tools.create(toolData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        q: 'tool@example.com',
        tags: ['tag1', 'tag2'],
        external_id: 'id-with-special-chars_123'
      };

      const mockTools = [
        { id: '1', name: 'Test Tool', short_description: 'Test tool', tool_schema: '{}' }
      ];

      const mockResponse = mockTools.map(tool => new MockTool(tool));
      mockGet.mockResolvedValue(mockResponse);

      await tools.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        q: 'weather api tool',
        active: true,
        public: false,
        tags: ['api', 'integration'],
        keywords: ['external service'],
        external_id: 'ext-123'
      };

      const mockTools = [
        { id: '1', name: 'Weather API', short_description: 'Weather information tool', tool_schema: '{}' }
      ];

      const mockResponse = mockTools.map(tool => new MockTool(tool));
      mockGet.mockResolvedValue(mockResponse);

      await tools.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete tool management flow', async () => {
      // Step 1: Get all tools
      const mockTools = [
        { id: '1', name: 'Weather API', short_description: 'Weather information tool', tool_schema: '{}' },
        { id: '2', name: 'Email Tool', short_description: 'Email sending tool', tool_schema: '{}' }
      ];

      const mockGetResponse = {
        data: mockTools.map(tool => new MockTool(tool))
      };
      mockGet.mockResolvedValueOnce(mockGetResponse);

      const allTools = await tools.get();
      expect(allTools.data).toHaveLength(2);

      // Step 2: Get specific tool
      const mockTool = { id: '1', name: 'Weather API', short_description: 'Weather information tool', tool_schema: '{}' };
      const mockGetToolResponse = new MockTool(mockTool);
      mockGet.mockResolvedValueOnce(mockGetToolResponse);

      const specificTool = await tools.get({}, '1');
      expect(specificTool).toEqual(mockGetToolResponse);

      // Step 3: Create new tool
      const newToolData = {
        name: 'New Tool',
        friendly_name: 'New Integration',
        short_description: 'A new tool integration',
        tool_schema: JSON.stringify({ type: 'object' })
      };

      const mockNewTool = { id: '3', ...newToolData };
      const mockCreateResponse = new MockTool(mockNewTool);
      mockCreate.mockResolvedValueOnce(mockCreateResponse);

      const createdTool = await tools.create(newToolData);
      expect(createdTool).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageTools = [
        { id: '1', name: 'Tool 1', short_description: 'First tool', tool_schema: '{}' },
        { id: '2', name: 'Tool 2', short_description: 'Second tool', tool_schema: '{}' }
      ];

      const mockFirstPage = { data: firstPageTools.map(tool => new MockTool(tool)) };
      mockGet.mockResolvedValueOnce(mockFirstPage);

      const firstPage = await tools.get({ limit: 2, offset: 0 });
      expect(firstPage.data).toHaveLength(2);

      // Second page
      const secondPageTools = [
        { id: '3', name: 'Tool 3', short_description: 'Third tool', tool_schema: '{}' },
        { id: '4', name: 'Tool 4', short_description: 'Fourth tool', tool_schema: '{}' }
      ];

      const mockSecondPage = { data: secondPageTools.map(tool => new MockTool(tool)) };
      mockGet.mockResolvedValueOnce(mockSecondPage);

      const secondPage = await tools.get({ limit: 2, offset: 2 });
      expect(secondPage.data).toHaveLength(2);
    });

    it('should handle search and filtering scenarios', async () => {
      // Search by name
      const searchResults = [
        { id: '1', name: 'Weather API', short_description: 'Weather information tool', tool_schema: '{}' }
      ];

      const mockSearchResults = { data: searchResults.map(tool => new MockTool(tool)) };
      mockGet.mockResolvedValueOnce(mockSearchResults);

      const searchResults1 = await tools.get({ q: 'weather' });
      expect(searchResults1.data).toHaveLength(1);

      // Filter by public status
      const publicTools = [
        { id: '1', name: 'Public Tool', short_description: 'Public tool', tool_schema: '{}' }
      ];

      const mockPublicTools = { data: publicTools.map(tool => new MockTool(tool)) };
      mockGet.mockResolvedValueOnce(mockPublicTools);

      const publicResults = await tools.get({ public: true });
      expect(publicResults.data).toHaveLength(1);

      // Filter by tags
      const taggedTools = [
        { id: '1', name: 'Tagged Tool', short_description: 'Tool with tags', tool_schema: '{}' }
      ];

      const mockTaggedTools = { data: taggedTools.map(tool => new MockTool(tool)) };
      mockGet.mockResolvedValueOnce(mockTaggedTools);

      const taggedResults = await tools.get({ tags: ['api'] });
      expect(taggedResults.data).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle API validation errors', async () => {
      const toolData = {
        name: 'Invalid Tool',
        friendly_name: 'Invalid Integration',
        short_description: 'A tool with invalid data',
        tool_schema: '{}'
      };

      const validationError = new Error('Tool name is required');
      mockCreate.mockRejectedValue(validationError);

      await expect(tools.create(toolData)).rejects.toThrow('Tool name is required');
    });

    it('should handle duplicate tool creation', async () => {
      const toolData = {
        name: 'Duplicate Tool',
        friendly_name: 'Duplicate Integration',
        short_description: 'A tool that already exists',
        tool_schema: '{}'
      };

      const duplicateError = new Error('Tool with this name already exists');
      mockCreate.mockRejectedValue(duplicateError);

      await expect(tools.create(toolData)).rejects.toThrow('Tool with this name already exists');
    });

    it('should handle tool not found', async () => {
      const notFoundError = new Error('Tool not found');
      mockGet.mockRejectedValue(notFoundError);

      await expect(tools.get({}, 'nonexistent-id')).rejects.toThrow('Tool not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockGet.mockRejectedValue(serverError);

      await expect(tools.get()).rejects.toThrow('Internal server error');
    });

    it('should handle schema validation errors', async () => {
      const toolData = {
        name: 'Invalid Schema Tool',
        friendly_name: 'Invalid Schema Integration',
        short_description: 'Tool with invalid schema',
        tool_schema: 'invalid-json'
      };

      const schemaError = new Error('Invalid tool schema format');
      mockCreate.mockRejectedValue(schemaError);

      await expect(tools.create(toolData)).rejects.toThrow('Invalid tool schema format');
    });
  });
}); 