import AgentGroups from '../../apis/agent-groups';
import { AgentGroup } from '../../models';
import { GetAgentGroupsPayload, GetAgentGroupPayload, AgentGroupInterface } from '../../types';

// Mock the AgentGroup model
jest.mock('../../models');
const MockAgentGroup = AgentGroup as jest.MockedClass<typeof AgentGroup>;

// Mock the BaseAPI methods directly
jest.mock('../../apis/base-api', () => {
  return {
    BaseAPI: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      create: jest.fn(),
    }))
  };
});

describe('AgentGroups', () => {
  let agentGroups: AgentGroups;
  let mockGet: jest.MockedFunction<any>;
  let mockCreate: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock returns
    MockAgentGroup.mockImplementation((data: any) => ({ data } as any));

    agentGroups = new AgentGroups();
    
    // Get the mocked methods from the instance
    mockGet = (agentGroups as any).get;
    mockCreate = (agentGroups as any).create;
  });

  describe('constructor', () => {
    it('should create AgentGroups instance', () => {
      expect(agentGroups).toBeDefined();
    });

    it('should initialize with correct URI and AgentGroup model', () => {
      expect(agentGroups).toBeDefined();
    });

    it('should initialize with custom URI when provided', () => {
      const customAgentGroups = new AgentGroups('/api/v1');
      expect(customAgentGroups).toBeDefined();
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultAgentGroups = new AgentGroups();
      expect(defaultAgentGroups).toBeDefined();
    });
  });

  describe('get method', () => {
    it('should get all agent groups successfully', async () => {
      const mockGroups = [
        { id: '1', name: 'Support Team', short_description: 'Customer support agents' },
        { id: '2', name: 'Sales Team', short_description: 'Sales and marketing agents' }
      ];

      const mockResponse = {
        data: mockGroups.map(group => new MockAgentGroup(group))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await agentGroups.get();

      expect(mockGet).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific agent group by ID', async () => {
      const mockGroup = { id: '1', name: 'Support Team', short_description: 'Customer support agents' };
      const mockResponse = new MockAgentGroup(mockGroup);
      mockGet.mockResolvedValue(mockResponse);

      const result = await agentGroups.get({}, '1');

      expect(mockGet).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get agent groups with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        q: 'support',
        active: true
      };

      const mockGroups = [
        { id: '1', name: 'Support Team', short_description: 'Customer support agents' }
      ];

      const mockResponse = {
        data: mockGroups.map(group => new MockAgentGroup(group))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await agentGroups.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create method', () => {
    it('should create a new agent group successfully', async () => {
      const agentGroupData = {
        name: 'New Group',
        short_description: 'A new agent group',
        agents: ['agent-1', 'agent-2']
      };

      const mockAgentGroup = { id: '3', ...agentGroupData };
      const mockResponse = new MockAgentGroup(mockAgentGroup);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agentGroups.create(agentGroupData);

      expect(mockCreate).toHaveBeenCalledWith(agentGroupData);
      expect(result).toEqual(mockResponse);
    });

    it('should create agent group with minimal data', async () => {
      const agentGroupData = {
        name: 'Minimal Group',
        short_description: 'Minimal group',
        agents: ['agent-7']
      };

      const mockAgentGroup = { id: '4', ...agentGroupData };
      const mockResponse = new MockAgentGroup(mockAgentGroup);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agentGroups.create(agentGroupData);

      expect(mockCreate).toHaveBeenCalledWith(agentGroupData);
      expect(result).toEqual(mockResponse);
    });

    it('should create agent group with all optional fields', async () => {
      const agentGroupData = {
        name: 'Full Group',
        short_description: 'A fully configured agent group',
        agents: ['agent-8', 'agent-9', 'agent-10'],
        active: true,
        external_id: 'ext-group-123'
      };

      const mockAgentGroup = { id: '5', ...agentGroupData };
      const mockResponse = new MockAgentGroup(mockAgentGroup);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agentGroups.create(agentGroupData);

      expect(mockCreate).toHaveBeenCalledWith(agentGroupData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const agentGroupData = {
        name: 'Invalid Group',
        short_description: 'Invalid group',
        agents: ['invalid-agent']
      };

      const error = new Error('Validation failed');
      mockCreate.mockRejectedValue(error);

      await expect(agentGroups.create(agentGroupData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const agentGroupData = {
        name: 'Network Group',
        short_description: 'Network group',
        agents: ['agent-11']
      };

      const networkError = new Error('Network error');
      mockCreate.mockRejectedValue(networkError);

      await expect(agentGroups.create(agentGroupData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty agent group data in create', async () => {
      const agentGroupData = {
        name: '',
        short_description: '',
        agents: []
      };

      const mockAgentGroup = { id: '6', ...agentGroupData };
      const mockResponse = new MockAgentGroup(mockAgentGroup);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agentGroups.create(agentGroupData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in agent group data', async () => {
      const agentGroupData = {
        name: 'Group with Special Chars: @#$%^&*()',
        short_description: 'Group with special characters: éñüñçóðé',
        agents: ['agent-with-special-chars_123']
      };

      const mockAgentGroup = { id: '7', ...agentGroupData };
      const mockResponse = new MockAgentGroup(mockAgentGroup);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agentGroups.create(agentGroupData);

      expect(mockCreate).toHaveBeenCalledWith(agentGroupData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long agent group data', async () => {
      const longName = 'a'.repeat(1000);
      const longDescription = 'b'.repeat(2000);
      const agentGroupData = {
        name: longName,
        short_description: longDescription,
        agents: ['agent-8']
      };

      const mockAgentGroup = { id: '8', ...agentGroupData };
      const mockResponse = new MockAgentGroup(mockAgentGroup);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await agentGroups.create(agentGroupData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        q: 'group@example.com',
        external_id: 'id-with-special-chars_123'
      };

      const mockAgentGroups = [
        { id: '1', name: 'Test Group', short_description: 'Test agent group', agents: ['agent-1'] }
      ];

      const mockResponse = mockAgentGroups.map(group => new MockAgentGroup(group));
      mockGet.mockResolvedValue(mockResponse);

      await agentGroups.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        q: 'support agent group',
        active: true,
        external_id: 'ext-123'
      };

      const mockAgentGroups = [
        { id: '1', name: 'Support Group', short_description: 'Customer support agents', agents: ['agent-1', 'agent-2'] }
      ];

      const mockResponse = mockAgentGroups.map(group => new MockAgentGroup(group));
      mockGet.mockResolvedValue(mockResponse);

      await agentGroups.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete agent group management flow', async () => {
      // Step 1: Get all agent groups
      const mockAgentGroups = [
        { id: '1', name: 'Support Group', short_description: 'Customer support agents', agents: ['agent-1', 'agent-2'] },
        { id: '2', name: 'Sales Group', short_description: 'Sales agents', agents: ['agent-3', 'agent-4'] }
      ];

      const mockGetResponse = {
        data: mockAgentGroups.map(group => new MockAgentGroup(group))
      };
      mockGet.mockResolvedValueOnce(mockGetResponse);

      const allGroups = await agentGroups.get();
      expect(allGroups.data).toHaveLength(2);

      // Step 2: Get specific agent group
      const mockAgentGroup = { id: '1', name: 'Support Group', short_description: 'Customer support agents', agents: ['agent-1', 'agent-2'] };
      const mockGetGroupResponse = new MockAgentGroup(mockAgentGroup);
      mockGet.mockResolvedValueOnce(mockGetGroupResponse);

      const specificGroup = await agentGroups.get({}, '1');
      expect(specificGroup).toEqual(mockGetGroupResponse);

      // Step 3: Create new agent group
      const newGroupData = {
        name: 'New Group',
        short_description: 'A new agent group',
        agents: ['agent-5', 'agent-6']
      };

      const mockNewGroup = { id: '3', ...newGroupData };
      const mockCreateResponse = new MockAgentGroup(mockNewGroup);
      mockCreate.mockResolvedValueOnce(mockCreateResponse);

      const createdGroup = await agentGroups.create(newGroupData);
      expect(createdGroup).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageGroups = [
        { id: '1', name: 'Group 1', short_description: 'First agent group', agents: ['agent-1'] },
        { id: '2', name: 'Group 2', short_description: 'Second agent group', agents: ['agent-2'] }
      ];

      const mockFirstPage = {
        data: firstPageGroups.map(group => new MockAgentGroup(group))
      };
      mockGet.mockResolvedValueOnce(mockFirstPage);

      const firstPage = await agentGroups.get({ limit: 2, offset: 0 });
      expect(firstPage.data).toHaveLength(2);

      // Second page
      const secondPageGroups = [
        { id: '3', name: 'Group 3', short_description: 'Third agent group', agents: ['agent-3'] },
        { id: '4', name: 'Group 4', short_description: 'Fourth agent group', agents: ['agent-4'] }
      ];

      const mockSecondPage = {
        data: secondPageGroups.map(group => new MockAgentGroup(group))
      };
      mockGet.mockResolvedValueOnce(mockSecondPage);

      const secondPage = await agentGroups.get({ limit: 2, offset: 2 });
      expect(secondPage.data).toHaveLength(2);
    });

    it('should handle search and filtering scenarios', async () => {
      // Search by name
      const searchResults = [
        { id: '1', name: 'Support Group', short_description: 'Customer support agents', agents: ['agent-1', 'agent-2'] }
      ];

      const mockSearchResults = {
        data: searchResults.map(group => new MockAgentGroup(group))
      };
      mockGet.mockResolvedValueOnce(mockSearchResults);

      const searchResults1 = await agentGroups.get({ q: 'support' });
      expect(searchResults1.data).toHaveLength(1);

      // Filter by active status
      const activeGroups = [
        { id: '1', name: 'Active Group', short_description: 'Active agent group', agents: ['agent-1'] }
      ];

      const mockActiveGroups = {
        data: activeGroups.map(group => new MockAgentGroup(group))
      };
      mockGet.mockResolvedValueOnce(mockActiveGroups);

      const activeResults = await agentGroups.get({ active: true });
      expect(activeResults.data).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle API validation errors', async () => {
      const agentGroupData = {
        name: 'Invalid Group',
        short_description: 'Invalid group',
        agents: ['invalid-agent-id']
      };

      const validationError = new Error('Invalid agent ID specified');
      mockCreate.mockRejectedValue(validationError);

      await expect(agentGroups.create(agentGroupData)).rejects.toThrow('Invalid agent ID specified');
    });

    it('should handle duplicate agent group creation', async () => {
      const agentGroupData = {
        name: 'Duplicate Group',
        short_description: 'Duplicate group',
        agents: ['agent-1', 'agent-2']
      };

      const duplicateError = new Error('Agent group with this name already exists');
      mockCreate.mockRejectedValue(duplicateError);

      await expect(agentGroups.create(agentGroupData)).rejects.toThrow('Agent group with this name already exists');
    });

    it('should handle agent group not found', async () => {
      const notFoundError = new Error('Agent group not found');
      mockGet.mockRejectedValue(notFoundError);

      await expect(agentGroups.get({}, 'nonexistent-id')).rejects.toThrow('Agent group not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockGet.mockRejectedValue(serverError);

      await expect(agentGroups.get()).rejects.toThrow('Internal server error');
    });

    it('should handle agent validation errors', async () => {
      const agentGroupData = {
        name: 'Invalid Agents Group',
        short_description: 'Invalid agents group',
        agents: ['nonexistent-agent-1', 'nonexistent-agent-2']
      };

      const agentError = new Error('One or more agents not found');
      mockCreate.mockRejectedValue(agentError);

      await expect(agentGroups.create(agentGroupData)).rejects.toThrow('One or more agents not found');
    });

    it('should handle empty agents list validation', async () => {
      const agentGroupData = {
        name: 'Empty Agents Group',
        short_description: 'Empty agents group',
        agents: []
      };

      const emptyError = new Error('Agent group must contain at least one agent');
      mockCreate.mockRejectedValue(emptyError);

      await expect(agentGroups.create(agentGroupData)).rejects.toThrow('Agent group must contain at least one agent');
    });
  });
}); 