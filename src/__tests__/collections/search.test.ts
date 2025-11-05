import Search from '../../collections/search';
import { SearchQueryParams, SearchResponse } from '../../types';

// Mock the APIClient
jest.mock('../../utils/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    GET: jest.fn(),
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

describe('Search', () => {
  let search: Search;
  let mockAPIClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAPIClient = {
      GET: jest.fn(),
    };

    // Mock APIClient constructor to return our mock instance
    (MockAPIClient as any).mockImplementation(() => mockAPIClient);

    search = new Search();
  });

  describe('constructor', () => {
    it('should create Search instance with default URI', () => {
      expect(search).toBeDefined();
      expect(search).toBeInstanceOf(Search);
    });

    it('should initialize with custom URI when provided', () => {
      const customSearch = new Search('/api/v1');
      expect(customSearch).toBeDefined();
    });
  });

  describe('query method', () => {
    it('should perform search across all resource types', async () => {
      const mockResponse: SearchResponse = {
        data: {
          agents: [
            { id: '1', name: 'Support Agent', short_description: 'Customer support agent' } as any
          ],
          apps: [
            { id: '2', name: 'Support App', short_description: 'Customer support application' } as any
          ],
          tools: [
            { id: '3', name: 'Support Tool', short_description: 'Customer support tool', tool_schema: '{}' } as any
          ],
          models: [
            { id: '4', name: 'GPT-4', short_description: 'GPT-4 model', provider: 'openai', model_id: 'gpt-4' } as any
          ]
        },
        paging: {
          agents: { limit: 10, offset: 0, total: 1 },
          apps: { limit: 10, offset: 0, total: 1 },
          tools: { limit: 10, offset: 0, total: 1 },
          models: { limit: 10, offset: 0, total: 1 }
        }
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockResponse });

      const result = await search.query({ q: 'support' });

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/search', { q: 'support' });
      expect(result.data.agents).toBeDefined();
      expect(result.data.apps).toBeDefined();
      expect(result.data.tools).toBeDefined();
      expect(result.data.models).toBeDefined();
      expect(result.data.agents).toHaveLength(1);
    });

    it('should search with search_types parameter', async () => {
      const mockResponse: SearchResponse = {
        data: {
          agents: [
            { id: '1', name: 'Support Agent', short_description: 'Customer support agent' }
          ],
          apps: [
            { id: '2', name: 'Support App', short_description: 'Customer support application' }
          ]
        },
        paging: {
          agents: { limit: 10, offset: 0, total: 1 },
          apps: { limit: 10, offset: 0, total: 1 }
        }
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockResponse });

      const params: SearchQueryParams = {
        q: 'support',
        search_types: ['agent', 'app'],
        limit: 10
      };

      const result = await search.query(params);

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/search', params);
      expect(result.data.agents).toBeDefined();
      expect(result.data.apps).toBeDefined();
    });

    it('should search with search_type parameter', async () => {
      const mockResponse: SearchResponse = {
        data: {
          agents: [
            { id: '1', name: 'Support Agent', short_description: 'Customer support agent' }
          ]
        },
        paging: {
          agents: { limit: 10, offset: 0, total: 1 }
        }
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockResponse });

      const params: SearchQueryParams = {
        q: 'support',
        search_type: 'agent',
        limit: 10
      };

      const result = await search.query(params);

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/search', params);
      expect(result.data.agents).toBeDefined();
      expect(result.data.agents).toHaveLength(1);
    });

    it('should handle search with limit parameter', async () => {
      const mockResponse: SearchResponse = {
        data: {
          agents: [
            { id: '1', name: 'Agent 1', short_description: 'Agent 1' },
            { id: '2', name: 'Agent 2', short_description: 'Agent 2' }
          ]
        },
        paging: {
          agents: { limit: 5, offset: 0, total: 2 }
        }
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockResponse });

      const result = await search.query({ q: 'agent', limit: 5 });

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/search', { q: 'agent', limit: 5 });
      expect(result.data.agents).toHaveLength(2);
    });

    it('should handle empty search results', async () => {
      const mockResponse: SearchResponse = {
        data: {},
        paging: {}
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockResponse });

      const result = await search.query({ q: 'nonexistent' });

      expect(result.data).toEqual({});
    });

    it('should handle search without query string', async () => {
      const mockResponse: SearchResponse = {
        data: {
          agents: [
            { id: '1', name: 'Agent 1', short_description: 'Agent 1' }
          ]
        },
        paging: {
          agents: { limit: 10, offset: 0, total: 1 }
        }
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockResponse });

      const result = await search.query({ limit: 10 });

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/search', { limit: 10 });
      expect(result.data.agents).toBeDefined();
    });

    it('should handle API errors', async () => {
      const error = new Error('Search failed');
      mockAPIClient.GET.mockRejectedValue(error);

      await expect(search.query({ q: 'test' })).rejects.toThrow('Search failed');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockAPIClient.GET.mockRejectedValue(networkError);

      await expect(search.query({ q: 'test' })).rejects.toThrow('Network error');
    });

    it('should handle unknown errors', async () => {
      mockAPIClient.GET.mockRejectedValue({});

      await expect(search.query({ q: 'test' })).rejects.toThrow('Unknown error occurred');
    });

    it('should handle response without data property', async () => {
      const mockResponse: SearchResponse = {
        data: {
          agents: [{ id: '1', name: 'Agent', short_description: 'Agent' } as any]
        }
      };

      // When GET returns the response directly (not wrapped in data)
      mockAPIClient.GET.mockResolvedValue(mockResponse);

      const result = await search.query({ q: 'agent' });

      expect(result.data).toEqual(mockResponse.data);
      expect(result.data.agents).toBeDefined();
      // paging is optional, so it may or may not be present
      if (mockResponse.paging) {
        expect(result.paging).toEqual(mockResponse.paging);
      }
    });

    it('should handle response wrapped in data property', async () => {
      const mockResponse: SearchResponse = {
        data: {
          agents: [{ id: '1', name: 'Agent', short_description: 'Agent' } as any]
        }
      };

      // When GET returns response wrapped in data property
      mockAPIClient.GET.mockResolvedValue({ data: mockResponse });

      const result = await search.query({ q: 'agent' });

      expect(result).toEqual(mockResponse);
      expect(result.data.agents).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in query', async () => {
      const mockResponse: SearchResponse = {
        data: {}
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockResponse });

      await search.query({ q: 'test@example.com & special chars' });

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/search', { q: 'test@example.com & special chars' });
    });

    it('should handle very long query strings', async () => {
      const longQuery = 'a'.repeat(1000);
      const mockResponse: SearchResponse = {
        data: {}
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockResponse });

      await search.query({ q: longQuery });

      expect(mockAPIClient.GET).toHaveBeenCalledWith('/search', { q: longQuery });
    });

    it('should handle multiple search types', async () => {
      const mockResponse: SearchResponse = {
        data: {
          agents: [{ id: '1', name: 'Agent', short_description: 'Agent' } as any],
          tools: [{ id: '2', name: 'Tool', short_description: 'Tool', tool_schema: '{}' } as any]
        }
      };

      mockAPIClient.GET.mockResolvedValue({ data: mockResponse });

      const result = await search.query({
        q: 'test',
        search_types: ['agent', 'tool']
      });

      expect(result.data.agents).toBeDefined();
      expect(result.data.tools).toBeDefined();
    });
  });
});

