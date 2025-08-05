import Organizations from '../../apis/organizations';
import { Organization } from '../../models';
import { GetOrgsPayload, GetOrgPayload, OrganizationInterface } from '../../types';

// Mock the Organization model
jest.mock('../../models');
const MockOrganization = Organization as jest.MockedClass<typeof Organization>;

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

describe('Organizations', () => {
  let organizations: any;
  let mockGet: jest.MockedFunction<any>;
  let mockCreate: jest.MockedFunction<any>;
  let mockBaseAPI: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock returns
    MockOrganization.mockImplementation((data: any) => ({ data } as any));

    // Setup BaseAPI mock
    mockBaseAPI = {
      get: jest.fn(),
      create: jest.fn(),
    };
    MockBaseAPI.mockImplementation(() => mockBaseAPI);

    organizations = new Organizations();
    
    // Get the mocked methods from the instance
    mockGet = organizations.get;
    mockCreate = organizations.create;
  });

  describe('constructor', () => {
    it('should create Organizations instance extending BaseAPI', () => {
      expect(organizations).toBeDefined();
      expect(typeof organizations.get).toBe('function');
      expect(typeof organizations.create).toBe('function');
    });

    it('should initialize with correct URI and Organization model', () => {
      expect(MockBaseAPI).toHaveBeenCalledWith('/org', Organization);
    });

    it('should initialize with custom URI when provided', () => {
      const customOrganizations = new Organizations('/api/v1');
      expect(MockBaseAPI).toHaveBeenCalledWith('/api/v1/org', Organization);
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultOrganizations = new Organizations();
      expect(MockBaseAPI).toHaveBeenCalledWith('/org', Organization);
    });
  });

  describe('get method', () => {
    it('should get all organizations successfully', async () => {
      const mockOrgs = [
        { id: '1', name: 'Acme Corp', short_description: 'Technology company' },
        { id: '2', name: 'Tech Solutions', short_description: 'Software solutions provider' }
      ];

      const mockResponse = {
        data: mockOrgs.map(org => new MockOrganization(org))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await organizations.get();

      expect(mockGet).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific organization by ID', async () => {
      const mockOrg = { id: '1', name: 'Acme Corp', short_description: 'Technology company' };
      const mockResponse = new MockOrganization(mockOrg);
      mockGet.mockResolvedValue(mockResponse);

      const result = await organizations.get({}, '1');

      expect(mockGet).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get organizations with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        q: 'acme',
        active: true
      };

      const mockOrgs = [
        { id: '1', name: 'Acme Corp', short_description: 'Technology company' }
      ];

      const mockResponse = {
        data: mockOrgs.map(org => new MockOrganization(org))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await organizations.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty organizations list', async () => {
      const mockResponse = { data: [] };
      mockGet.mockResolvedValue(mockResponse);

      const result = await organizations.get();

      expect(result).toEqual({ data: [] });
    });

    it('should handle null response', async () => {
      mockGet.mockResolvedValue(null);

      const result = await organizations.get();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch organizations');
      mockBaseAPI.get.mockRejectedValue(error);

      await expect(organizations.get()).rejects.toThrow('Failed to fetch organizations');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockBaseAPI.get.mockRejectedValue(networkError);

      await expect(organizations.get()).rejects.toThrow('Network error');
    });
  });

  describe('create method', () => {
    it('should create a new organization successfully', async () => {
      const orgData = {
        name: 'New Corp',
        short_description: 'A new organization',
        long_description: 'A detailed description of the new organization',
        image: 'https://example.com/logo.png'
      };

      const mockOrg = { id: '3', ...orgData };
      const mockResponse = new MockOrganization(mockOrg);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await organizations.create(orgData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(orgData);
      expect(result).toEqual(mockResponse);
    });

    it('should create organization with minimal data', async () => {
      const orgData = {
        name: 'Minimal Corp',
        short_description: 'A minimal organization'
      };

      const mockOrg = { id: '4', ...orgData };
      const mockResponse = new MockOrganization(mockOrg);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await organizations.create(orgData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(orgData);
      expect(result).toEqual(mockResponse);
    });

    it('should create organization with all optional fields', async () => {
      const orgData = {
        name: 'Full Corp',
        short_description: 'A fully configured organization',
        long_description: 'A detailed description of the organization',
        image: 'https://example.com/logo.jpg',
        external_id: 'ext-org-123'
      };

      const mockOrg = { id: '5', ...orgData };
      const mockResponse = new MockOrganization(mockOrg);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await organizations.create(orgData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(orgData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const orgData = {
        name: 'Invalid Corp',
        short_description: 'An invalid organization'
      };

      const error = new Error('Validation failed');
      mockBaseAPI.create.mockRejectedValue(error);

      await expect(organizations.create(orgData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const orgData = {
        name: 'Network Corp',
        short_description: 'A network organization'
      };

      const networkError = new Error('Network error');
      mockBaseAPI.create.mockRejectedValue(networkError);

      await expect(organizations.create(orgData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty organization data in create', async () => {
      const orgData = {
        name: '',
        short_description: '',
        long_description: ''
      };

      const mockOrg = { id: '6', ...orgData };
      const mockResponse = new MockOrganization(mockOrg);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await organizations.create(orgData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in organization data', async () => {
      const orgData = {
        name: 'Org with Special Chars: @#$%^&*()',
        short_description: 'Org with special characters: éñüñçóðé',
        image: 'https://example.com/org?param=value&other=123'
      };

      const mockOrg = { id: '7', ...orgData };
      const mockResponse = new MockOrganization(mockOrg);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await organizations.create(orgData);

      expect(mockBaseAPI.create).toHaveBeenCalledWith(orgData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long organization data', async () => {
      const longName = 'a'.repeat(1000);
      const longDescription = 'b'.repeat(2000);
      const orgData = {
        name: longName,
        short_description: longDescription,
        image: 'https://example.com/org'
      };

      const mockOrg = { id: '8', ...orgData };
      const mockResponse = new MockOrganization(mockOrg);
      mockBaseAPI.create.mockResolvedValue(mockResponse);

      const result = await organizations.create(orgData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        q: 'org@example.com',
        external_id: 'id-with-special-chars_123'
      };

      const mockOrganizations = [
        { id: '1', name: 'Test Org', short_description: 'Test organization' }
      ];

      const mockResponse = mockOrganizations.map(org => new MockOrganization(org));
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      await organizations.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        q: 'acme corporation',
        active: true,
        external_id: 'ext-123'
      };

      const mockOrganizations = [
        { id: '1', name: 'Acme Corp', short_description: 'Technology company' }
      ];

      const mockResponse = mockOrganizations.map(org => new MockOrganization(org));
      mockBaseAPI.get.mockResolvedValue(mockResponse);

      await organizations.get(params);

      expect(mockBaseAPI.get).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete organization management flow', async () => {
      // Step 1: Get all organizations
      const mockOrganizations = [
        { id: '1', name: 'Acme Corp', short_description: 'Technology company' },
        { id: '2', name: 'Tech Solutions', short_description: 'IT consulting firm' }
      ];

      const mockGetResponse = {
        data: mockOrganizations.map(org => new MockOrganization(org))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockGetResponse);

      const allOrgs = await organizations.get();
      expect(allOrgs.data).toHaveLength(2);

      // Step 2: Get specific organization
      const mockOrg = { id: '1', name: 'Acme Corp', short_description: 'Technology company' };
      const mockGetOrgResponse = new MockOrganization(mockOrg);
      mockBaseAPI.get.mockResolvedValueOnce(mockGetOrgResponse);

      const specificOrg = await organizations.get({}, '1');
      expect(specificOrg).toEqual(mockGetOrgResponse);

      // Step 3: Create new organization
      const newOrgData = {
        name: 'New Corp',
        short_description: 'A new organization',
        image: 'https://example.com/logo.png'
      };

      const mockNewOrg = { id: '3', ...newOrgData };
      const mockCreateResponse = new MockOrganization(mockNewOrg);
      mockBaseAPI.create.mockResolvedValueOnce(mockCreateResponse);

      const createdOrg = await organizations.create(newOrgData);
      expect(createdOrg).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageOrgs = [
        { id: '1', name: 'Org 1', short_description: 'First organization' },
        { id: '2', name: 'Org 2', short_description: 'Second organization' }
      ];

      const mockFirstPage = {
        data: firstPageOrgs.map(org => new MockOrganization(org))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockFirstPage);

      const firstPage = await organizations.get({ limit: 2, offset: 0 });
      expect(firstPage.data).toHaveLength(2);

      // Second page
      const secondPageOrgs = [
        { id: '3', name: 'Org 3', short_description: 'Third organization' },
        { id: '4', name: 'Org 4', short_description: 'Fourth organization' }
      ];

      const mockSecondPage = {
        data: secondPageOrgs.map(org => new MockOrganization(org))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockSecondPage);

      const secondPage = await organizations.get({ limit: 2, offset: 2 });
      expect(secondPage.data).toHaveLength(2);
    });

    it('should handle search and filtering scenarios', async () => {
      // Search by name
      const searchResults = [
        { id: '1', name: 'Acme Corp', short_description: 'Technology company' }
      ];

      const mockSearchResults = {
        data: searchResults.map(org => new MockOrganization(org))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockSearchResults);

      const searchResults1 = await organizations.get({ q: 'acme' });
      expect(searchResults1.data).toHaveLength(1);

      // Filter by active status
      const activeOrgs = [
        { id: '1', name: 'Active Corp', short_description: 'Active organization' }
      ];

      const mockActiveOrgs = {
        data: activeOrgs.map(org => new MockOrganization(org))
      };
      mockBaseAPI.get.mockResolvedValueOnce(mockActiveOrgs);

      const activeResults = await organizations.get({ active: true });
      expect(activeResults.data).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle API validation errors', async () => {
      const orgData = {
        name: 'Invalid Org',
        short_description: 'An organization with invalid data'
      };

      const validationError = new Error('Organization name is required');
      mockBaseAPI.create.mockRejectedValue(validationError);

      await expect(organizations.create(orgData)).rejects.toThrow('Organization name is required');
    });

    it('should handle duplicate organization creation', async () => {
      const orgData = {
        name: 'Duplicate Corp',
        short_description: 'An organization that already exists'
      };

      const duplicateError = new Error('Organization with this name already exists');
      mockBaseAPI.create.mockRejectedValue(duplicateError);

      await expect(organizations.create(orgData)).rejects.toThrow('Organization with this name already exists');
    });

    it('should handle organization not found', async () => {
      const notFoundError = new Error('Organization not found');
      mockBaseAPI.get.mockRejectedValue(notFoundError);

      await expect(organizations.get({}, 'nonexistent-id')).rejects.toThrow('Organization not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockBaseAPI.get.mockRejectedValue(serverError);

      await expect(organizations.get()).rejects.toThrow('Internal server error');
    });

    it('should handle image URL validation errors', async () => {
      const orgData = {
        name: 'Invalid Image Org',
        short_description: 'Organization with invalid image URL',
        image: 'invalid-url'
      };

      const imageError = new Error('Invalid image URL format');
      mockBaseAPI.create.mockRejectedValue(imageError);

      await expect(organizations.create(orgData)).rejects.toThrow('Invalid image URL format');
    });
  });
}); 