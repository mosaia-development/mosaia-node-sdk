import Users from '../apis/users';
import { MosiaConfig, UserInterface } from '../types';

// Mock the APIClient
jest.mock('../apis/api-client');

describe('Users API', () => {
  let users: Users;
  const mockConfig: MosiaConfig = {
    apiKey: 'test-api-key',
    apiURL: 'https://api.test.com/v1',
    version: '1'
  };

  beforeEach(() => {
    users = new Users(mockConfig);
  });

  describe('Constructor', () => {
    it('should create a Users instance', () => {
      expect(users).toBeInstanceOf(Users);
    });
  });

  describe('getAll', () => {
    it('should call GET with correct parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', email: 'test@example.com', first_name: 'John' }
          ],
          paging: { limit: 10, offset: 0, total: 1 }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (users as any).client = mockClient;

      const params = { limit: 10, offset: 0, search: 'john' };
      const result = await users.getAll(params);

      expect(mockClient.GET).toHaveBeenCalledWith('/user', params);
      expect(result).toEqual(mockResponse);
    });

    it('should call GET without parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', email: 'test@example.com', first_name: 'John' }
          ],
          paging: { limit: 10, offset: 0, total: 1 }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (users as any).client = mockClient;

      const result = await users.getAll();

      expect(mockClient.GET).toHaveBeenCalledWith('/user', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should call GET with user ID', async () => {
      const mockResponse = {
        data: {
          data: { id: '1', email: 'test@example.com', first_name: 'John' }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (users as any).client = mockClient;

      const result = await users.getById('1');

      expect(mockClient.GET).toHaveBeenCalledWith('/user/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call POST with user data', async () => {
      const userData: Omit<UserInterface, 'id'> = {
        email: 'new@example.com',
        first_name: 'Jane',
        last_name: 'Doe'
      };

      const mockResponse = {
        data: {
          data: { id: '2', ...userData }
        },
        status: 201
      };

      const mockClient = {
        POST: jest.fn().mockResolvedValue(mockResponse)
      };

      (users as any).client = mockClient;

      const result = await users.create(userData);

      expect(mockClient.POST).toHaveBeenCalledWith('/user', userData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call PUT with user ID and update data', async () => {
      const updateData = {
        first_name: 'Updated Name'
      };

      const mockResponse = {
        data: {
          data: { id: '1', email: 'test@example.com', ...updateData }
        },
        status: 200
      };

      const mockClient = {
        PUT: jest.fn().mockResolvedValue(mockResponse)
      };

      (users as any).client = mockClient;

      const result = await users.update('1', updateData);

      expect(mockClient.PUT).toHaveBeenCalledWith('/user/1', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call DELETE with user ID', async () => {
      const mockResponse = {
        data: null,
        status: 204
      };

      const mockClient = {
        DELETE: jest.fn().mockResolvedValue(mockResponse)
      };

      (users as any).client = mockClient;

      const result = await users.delete('1');

      expect(mockClient.DELETE).toHaveBeenCalledWith('/user/1', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call DELETE with parameters', async () => {
      const mockResponse = {
        data: null,
        status: 204
      };

      const mockClient = {
        DELETE: jest.fn().mockResolvedValue(mockResponse)
      };

      (users as any).client = mockClient;

      const params = { force: true };
      const result = await users.delete('1', params);

      expect(mockClient.DELETE).toHaveBeenCalledWith('/user/1', params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSession', () => {
    it('should call GET for user session', async () => {
      const mockResponse = {
        data: {
          data: { token: 'session-token' }
        },
        status: 200
      };

      const mockClient = {
        GET: jest.fn().mockResolvedValue(mockResponse)
      };

      (users as any).client = mockClient;

      const result = await users.getSession('1');

      expect(mockClient.GET).toHaveBeenCalledWith('/user/1/session');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadProfileImage', () => {
    it('should throw error for unimplemented feature', async () => {
      await expect(users.uploadProfileImage('1', {} as File)).rejects.toThrow(
        'File upload not implemented in this version'
      );
    });
  });
}); 