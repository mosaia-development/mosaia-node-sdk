import { Chat } from '../../functions/chat';
import { Completions } from '../../functions/completions';

// Mock the Completions class
jest.mock('../../functions/completions', () => ({
  Completions: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get: jest.fn(),
    create: jest.fn()
  }))
}));

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

describe('Chat', () => {
  let chat: Chat;
  let mockCompletions: any;

  beforeEach(() => {
    jest.clearAllMocks();
    chat = new Chat('/test');
    mockCompletions = chat.completions;
  });

  describe('constructor', () => {
    it('should create Chat instance with default URI', () => {
      const chat = new Chat();
      expect(chat).toBeDefined();
      expect((chat as any).uri).toBe('/chat');
    });

    it('should create Chat instance with custom URI', () => {
      const chat = new Chat('/custom/uri');
      expect(chat).toBeDefined();
      expect((chat as any).uri).toBe('/custom/uri/chat');
    });

    it('should extend BaseFunctions', () => {
      expect(chat).toBeDefined();
      expect(typeof chat.get).toBe('function');
      expect(typeof chat.create).toBe('function');
      expect(typeof chat.update).toBe('function');
      expect(typeof chat.delete).toBe('function');
    });
  });

  describe('completions getter', () => {
    it('should return Completions instance with correct URI', () => {
      const { Completions } = require('../../functions/completions');
      
      const completions = chat.completions;

      expect(Completions).toHaveBeenCalledWith('/test/chat');
      expect(completions).toBeDefined();
      expect(completions).toBeDefined();
    });

    it('should return Completions instance with default URI when no URI provided', () => {
      const chatWithoutUri = new Chat();
      const { Completions } = require('../../functions/completions');
      
      const completions = chatWithoutUri.completions;

      expect(Completions).toHaveBeenCalledWith('/chat');
      expect(completions).toBeDefined();
      expect(completions).toBeDefined();
    });
  });

  describe('inherited methods', () => {
    it('should inherit get method from BaseFunctions', () => {
      expect(chat.get).toBeDefined();
      expect(typeof chat.get).toBe('function');
    });

    it('should inherit create method from BaseFunctions', () => {
      expect(chat.create).toBeDefined();
      expect(typeof chat.create).toBe('function');
    });

    it('should inherit update method from BaseFunctions', () => {
      expect(chat.update).toBeDefined();
      expect(typeof chat.update).toBe('function');
    });

    it('should inherit delete method from BaseFunctions', () => {
      expect(chat.delete).toBeDefined();
      expect(typeof chat.delete).toBe('function');
    });
  });

  describe('chat-specific functionality', () => {
    it('should allow access to completions functionality', () => {
      expect(chat.completions).toBeDefined();
      expect(chat.completions.get).toBeDefined();
      expect(chat.completions.create).toBeDefined();
    });

    it('should create new Completions instance on each access', () => {
      const { Completions } = require('../../functions/completions');
      
      // Clear previous calls from beforeEach
      (Completions as jest.Mock).mockClear();
      
      const completions1 = chat.completions;
      const completions2 = chat.completions;

      expect(Completions).toHaveBeenCalledTimes(2);
      expect(completions1).toBeDefined();
      expect(completions2).toBeDefined();
    });
  });
});
