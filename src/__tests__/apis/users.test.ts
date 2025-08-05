import Users from '../../apis/users';
import { User } from '../../models';
import { GetUsersPayload, GetUserPayload, UserInterface } from '../../types';

// Mock the User model
jest.mock('../../models');
const MockUser = User as jest.MockedClass<typeof User>;

// Mock the BaseAPI class properly
jest.mock('../../apis/base-api', () => {
  return {
    BaseAPI: jest.fn().mockImplementation(() => ({
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
jest.mock('../../apis/api-client', () => {
  return jest.fn().mockImplementation(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
  }));
});

describe('Users', () => {
  let users: any;
  let mockGet: jest.MockedFunction<any>;
  let mockCreate: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock returns
    MockUser.mockImplementation((data: any) => ({ data } as any));

    users = new Users();
    
    // Get the mocked methods from the instance
    mockGet = users.get;
    mockCreate = users.create;
  });

  describe('constructor', () => {
    it('should create Users instance', () => {
      expect(users).toBeDefined();
      expect(typeof users.get).toBe('function');
      expect(typeof users.create).toBe('function');
    });

    it('should initialize with correct URI and User model', () => {
      expect(users).toBeDefined();
    });

    it('should initialize with custom URI when provided', () => {
      const customUsers = new Users('/api/v1');
      expect(customUsers).toBeDefined();
    });

    it('should initialize with empty URI when not provided', () => {
      const defaultUsers = new Users();
      expect(defaultUsers).toBeDefined();
    });
  });

  describe('get method', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ];

      const mockResponse = {
        data: mockUsers.map(user => new MockUser(user))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await users.get();

      expect(mockGet).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get a specific user by ID', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      const mockResponse = new MockUser(mockUser);
      mockGet.mockResolvedValue(mockResponse);

      const result = await users.get({}, '1');

      expect(mockGet).toHaveBeenCalledWith({}, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should get users with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        q: 'john',
        active: true
      };

      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' }
      ];

      const mockResponse = {
        data: mockUsers.map(user => new MockUser(user))
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await users.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty users list', async () => {
      const mockResponse: any[] = [];
      mockGet.mockResolvedValue(mockResponse);

      const result = await users.get();

      expect(result).toEqual([]);
    });

    it('should handle null response', async () => {
      mockGet.mockResolvedValue(null);

      const result = await users.get();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch users');
      mockGet.mockRejectedValue(error);

      await expect(users.get()).rejects.toThrow('Failed to fetch users');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockGet.mockRejectedValue(networkError);

      await expect(users.get()).rejects.toThrow('Network error');
    });
  });

  describe('create method', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        username: 'newuser'
      };

      const mockUser = { id: '3', ...userData };
      const mockResponse = new MockUser(mockUser);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await users.create(userData);

      expect(mockCreate).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockResponse);
    });

    it('should create user with minimal data', async () => {
      const userData = {
        name: 'Minimal User',
        email: 'minimal@example.com'
      };

      const mockUser = { id: '4', ...userData };
      const mockResponse = new MockUser(mockUser);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await users.create(userData);

      expect(mockCreate).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockResponse);
    });

    it('should create user with all optional fields', async () => {
      const userData = {
        name: 'Full User',
        email: 'full@example.com',
        username: 'fulluser',
        image: 'https://example.com/avatar.jpg',
        description: 'A full user profile',
        url: 'https://example.com/user',
        location: 'New York, NY',
        links: {
          twitter: 'https://twitter.com/fulluser',
          linkedin: 'https://linkedin.com/in/fulluser'
        },
        active: true,
        external_id: 'ext-user-123'
      };

      const mockUser = { id: '5', ...userData };
      const mockResponse = new MockUser(mockUser);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await users.create(userData);

      expect(mockCreate).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation error', async () => {
      const userData = {
        name: 'Invalid User',
        email: 'invalid-email'
      };

      const error = new Error('Validation failed');
      mockCreate.mockRejectedValue(error);

      await expect(users.create(userData)).rejects.toThrow('Validation failed');
    });

    it('should handle network errors during creation', async () => {
      const userData = {
        name: 'Network User',
        email: 'network@example.com'
      };

      const networkError = new Error('Network error');
      mockCreate.mockRejectedValue(networkError);

      await expect(users.create(userData)).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty user data in create', async () => {
      const userData = {
        name: '',
        email: ''
      };

      const mockUser = { id: '6', ...userData };
      const mockResponse = new MockUser(mockUser);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await users.create(userData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in user data', async () => {
      const userData = {
        name: 'User with special chars @#$%^&*()',
        email: 'user-with-special-chars@example.com',
        username: 'user_with_special_chars_123'
      };

      const mockUser = { id: '7', ...userData };
      const mockResponse = new MockUser(mockUser);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await users.create(userData);

      expect(mockCreate).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle very long user data', async () => {
      const longName = 'a'.repeat(1000);
      const longEmail = 'b'.repeat(500) + '@example.com';
      const userData = {
        name: longName,
        email: longEmail
      };

      const mockUser = { id: '8', ...userData };
      const mockResponse = new MockUser(mockUser);
      mockCreate.mockResolvedValue(mockResponse);

      const result = await users.create(userData);

      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters with special characters', async () => {
      const params = {
        q: 'user@example.com',
        external_id: 'id-with-special-chars_123'
      };

      const mockUsers = [
        { id: '1', name: 'Test User', email: 'user@example.com' }
      ];

      const mockResponse = {
        data: mockUsers.map(user => new MockUser(user))
      };
      mockGet.mockResolvedValue(mockResponse);

      await users.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
    });

    it('should handle complex query parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        q: 'john doe user',
        active: true,
        external_id: 'ext-123'
      };

      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' }
      ];

      const mockResponse = {
        data: mockUsers.map(user => new MockUser(user))
      };
      mockGet.mockResolvedValue(mockResponse);

      await users.get(params);

      expect(mockGet).toHaveBeenCalledWith(params);
    });
  });

  describe('integration scenarios', () => {
    it('should work with complete user management flow', async () => {
      // Step 1: Get all users
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ];

      const mockGetResponse = {
        data: mockUsers.map(user => new MockUser(user))
      };
      mockGet.mockResolvedValueOnce(mockGetResponse);

      const allUsers = await users.get();
      expect(allUsers.data).toHaveLength(2);

      // Step 2: Get specific user
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      const mockGetUserResponse = new MockUser(mockUser);
      mockGet.mockResolvedValueOnce(mockGetUserResponse);

      const specificUser = await users.get({}, '1');
      expect(specificUser).toEqual(mockGetUserResponse);

      // Step 3: Create new user
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        username: 'newuser'
      };

      const mockNewUser = { id: '3', ...newUserData };
      const mockCreateResponse = new MockUser(mockNewUser);
      mockCreate.mockResolvedValueOnce(mockCreateResponse);

      const createdUser = await users.create(newUserData);
      expect(createdUser).toEqual(mockCreateResponse);
    });

    it('should handle pagination scenarios', async () => {
      // First page
      const firstPageUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' }
      ];

      const mockFirstPage = {
        data: firstPageUsers.map(user => new MockUser(user))
      };
      mockGet.mockResolvedValueOnce(mockFirstPage);

      const firstPage = await users.get({ limit: 2, offset: 0 });
      expect(firstPage.data).toHaveLength(2);

      // Second page
      const secondPageUsers = [
        { id: '3', name: 'User 3', email: 'user3@example.com' },
        { id: '4', name: 'User 4', email: 'user4@example.com' }
      ];

      const mockSecondPage = {
        data: secondPageUsers.map(user => new MockUser(user))
      };
      mockGet.mockResolvedValueOnce(mockSecondPage);

      const secondPage = await users.get({ limit: 2, offset: 2 });
      expect(secondPage.data).toHaveLength(2);
    });

    it('should handle search scenarios', async () => {
      // Search by name
      const searchResults = [
        { id: '1', name: 'John Doe', email: 'john@example.com' }
      ];

      const mockSearchResults = {
        data: searchResults.map(user => new MockUser(user))
      };
      mockGet.mockResolvedValueOnce(mockSearchResults);

      const searchResults1 = await users.get({ q: 'john' });
      expect(searchResults1.data).toHaveLength(1);

      // Search by email
      const emailResults = [
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ];

      const mockEmailResults = {
        data: emailResults.map(user => new MockUser(user))
      };
      mockGet.mockResolvedValueOnce(mockEmailResults);

      const emailSearchResults = await users.get({ q: 'jane@example.com' });
      expect(emailSearchResults.data).toHaveLength(1);
    });

    it('should handle filtering scenarios', async () => {
      // Filter by active status
      const activeUsers = [
        { id: '1', name: 'Active User', email: 'active@example.com' }
      ];

      const mockActiveUsers = {
        data: activeUsers.map(user => new MockUser(user))
      };
      mockGet.mockResolvedValueOnce(mockActiveUsers);

      const activeResults = await users.get({ active: true });
      expect(activeResults.data).toHaveLength(1);
    });

    it('should handle error scenarios', async () => {
      // Validation error
      const validationError = new Error('User name is required');
      mockCreate.mockRejectedValue(validationError);

      await expect(users.create({ email: 'test@example.com' })).rejects.toThrow('User name is required');

      // Duplicate error
      const duplicateError = new Error('User with this email already exists');
      mockCreate.mockRejectedValue(duplicateError);

      await expect(users.create({ name: 'Test', email: 'existing@example.com' })).rejects.toThrow('User with this email already exists');
    });

    it('should handle user not found', async () => {
      const notFoundError = new Error('User not found');
      mockGet.mockRejectedValue(notFoundError);

      await expect(users.get({}, 'nonexistent-id')).rejects.toThrow('User not found');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockGet.mockRejectedValue(serverError);

      await expect(users.get()).rejects.toThrow('Internal server error');
    });

    it('should handle email validation errors', async () => {
      const emailError = new Error('Invalid email format');
      mockCreate.mockRejectedValue(emailError);

      await expect(users.create({ name: 'Test', email: 'invalid-email' })).rejects.toThrow('Invalid email format');
    });
  });
}); 