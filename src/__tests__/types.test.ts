import {
  MosaiaConfig,
  MosaiaAuth,
  APIResponse,
  ErrorResponse,
  PagingInterface,
  QueryParams,
  BaseEntity,
  RecordHistory,
  UserInterface,
  OrganizationInterface,
  SessionInterface,
  AppInterface,
  ToolInterface,
  AgentInterface,
  AgentGroupInterface,
  ModelInterface,
  ClientInterface,
  AppBotInterface,
  DehydratedAppBotInterface,
  WalletInterface,
  MeterInterface,
  AccessPolicyInterface,
  OrgPermissionInterface,
  UserPermissionInterface,
  OrgUserInterface,
  ObjectiveInterface,
  OfferingInterface,
  SnapshotInterface,
  VectorIndexInterface,
  LikeInterface,
  AgentLogInterface,
  AgentToolInterface,
  GroupAgentInterface,
  AppUserInterface,
  AppWebhookInterface,
  ClientSessionInterface,
  ApiRequestLogInterface,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  AuthRequest,
  AuthResponse,
  OAuthConfig,
  OAuthTokenResponse,
  OAuthErrorResponse
} from '../types';

describe('MosaiaConfig', () => {
  it('should allow all optional properties', () => {
    const config: MosaiaConfig = {
      apiKey: 'test-key',
      refreshToken: 'refresh-token',
      version: '1',
      apiURL: 'https://api.mosaia.ai',
      appURL: 'https://mosaia.ai',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      verbose: true,
      authType: 'oauth',
      expiresIn: 3600,
      sub: 'user-123',
      iat: '1640995200',
      exp: '1640998800'
    };

    expect(config.apiKey).toBe('test-key');
    expect(config.authType).toBe('oauth');
  });

  it('should allow partial configuration', () => {
    const partialConfig: MosaiaConfig = {
      apiKey: 'test-key'
    };

    expect(partialConfig.apiKey).toBe('test-key');
    expect(partialConfig.apiURL).toBeUndefined();
  });
});

describe('MosaiaAuth', () => {
  it('should support password grant type', () => {
    const auth: MosaiaAuth = {
      grant_type: 'password',
      email: 'user@example.com',
      password: 'password123'
    };

    expect(auth.grant_type).toBe('password');
    expect(auth.email).toBe('user@example.com');
  });

  it('should support client grant type', () => {
    const auth: MosaiaAuth = {
      grant_type: 'client',
      client_id: 'client-id',
      client_secret: 'client-secret'
    };

    expect(auth.grant_type).toBe('client');
    expect(auth.client_id).toBe('client-id');
  });

  it('should support refresh grant type', () => {
    const auth: MosaiaAuth = {
      grant_type: 'refresh',
      refresh_token: 'refresh-token'
    };

    expect(auth.grant_type).toBe('refresh');
    expect(auth.refresh_token).toBe('refresh-token');
  });
});

describe('APIResponse', () => {
  it('should have correct structure', () => {
    const response: APIResponse<string> = {
      meta: {
        status: 200,
        message: 'Success'
      },
      data: 'test-data',
      error: {
        message: '',
        code: '',
        status: 0
      }
    };

    expect(response.meta.status).toBe(200);
    expect(response.data).toBe('test-data');
    expect(response.error).toBeDefined();
  });
});

describe('ErrorResponse', () => {
  it('should have correct structure', () => {
    const error: ErrorResponse = {
      message: 'Test error message',
      code: 'TEST_ERROR',
      status: 400
    };

    expect(error.message).toBe('Test error message');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.status).toBe(400);
  });
});

describe('PagingInterface', () => {
  it('should support offset-based pagination', () => {
    const paging: PagingInterface = {
      offset: 10,
      limit: 20,
      total: 100
    };

    expect(paging.offset).toBe(10);
    expect(paging.limit).toBe(20);
    expect(paging.total).toBe(100);
  });

  it('should support page-based pagination', () => {
    const paging: PagingInterface = {
      page: 2,
      limit: 20,
      total: 100,
      total_pages: 5
    };

    expect(paging.page).toBe(2);
    expect(paging.total_pages).toBe(5);
  });
});

describe('QueryParams', () => {
  it('should support all query parameters', () => {
    const params: QueryParams = {
      q: 'search term',
      limit: 10,
      offset: 0,
      tags: ['tag1', 'tag2'],
      active: true,
      external_id: 'ext-123',
      custom_param: 'custom-value'
    };

    expect(params.q).toBe('search term');
    expect(params.tags).toEqual(['tag1', 'tag2']);
    expect(params.custom_param).toBe('custom-value');
  });
});

describe('BaseEntity', () => {
  it('should have base properties', () => {
    const entity: BaseEntity = {
      id: 'entity-123',
      active: true,
      external_id: 'ext-123',
      extensors: {
        custom_field: 'custom-value'
      },
      record_history: {
        created_at: new Date('2023-01-01'),
        created_by: 'user-123',
        created_by_type: 'user',
        updated_at: new Date('2023-01-02'),
        updated_by: 'user-123',
        updated_by_type: 'user'
      }
    };

    expect(entity.id).toBe('entity-123');
    expect(entity.active).toBe(true);
    expect(entity.extensors?.custom_field).toBe('custom-value');
  });
});

describe('RecordHistory', () => {
  it('should track creation and update information', () => {
    const history: RecordHistory = {
      created_at: new Date('2023-01-01'),
      created_by: 'user-123',
      created_by_type: 'user',
      updated_at: new Date('2023-01-02'),
      updated_by: 'user-123',
      updated_by_type: 'user'
    };

    expect(history.created_at).toEqual(new Date('2023-01-01'));
    expect(history.created_by_type).toBe('user');
  });
});

describe('UserInterface', () => {
  it('should extend BaseEntity and have user properties', () => {
    const user: UserInterface = {
      id: 'user-123',
      username: 'johndoe',
      name: 'John Doe',
      image: 'https://example.com/avatar.jpg',
      description: 'Software developer',
      email: 'john@example.com',
      url: 'https://example.com',
      location: 'San Francisco, CA',
      links: {
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe'
      },
      active: true
    };

    expect(user.username).toBe('johndoe');
    expect(user.links?.github).toBe('https://github.com/johndoe');
  });
});

describe('OrganizationInterface', () => {
  it('should have organization properties', () => {
    const org: OrganizationInterface = {
      id: 'org-123',
      name: 'Acme Corp',
      short_description: 'Leading technology company',
      long_description: 'Acme Corp is a leading technology company...',
      image: 'https://example.com/logo.png',
      external_id: 'ext-org-123',
      extensors: {
        industry: 'technology',
        founded: '2020'
      },
      active: true
    };

    expect(org.name).toBe('Acme Corp');
    expect(org.extensors?.industry).toBe('technology');
  });
});

describe('AppInterface', () => {
  it('should have application properties', () => {
    const app: AppInterface = {
      id: 'app-123',
      name: 'My AI Assistant',
      org: 'org-456',
      short_description: 'AI-powered customer support',
      long_description: 'An intelligent assistant for customer support...',
      image: 'https://example.com/app-icon.png',
      external_app_url: 'https://myapp.com',
      external_api_key: 'app-api-key',
      external_headers: {
        'X-Custom-Header': 'custom-value'
      },
      active: true,
      tags: ['ai', 'support', 'automation'],
      keywords: ['customer service', 'chatbot'],
      extensors: {
        category: 'productivity'
      },
      external_id: 'ext-app-123'
    };

    expect(app.name).toBe('My AI Assistant');
    expect(app.tags).toEqual(['ai', 'support', 'automation']);
    expect(app.external_headers?.['X-Custom-Header']).toBe('custom-value');
  });
});

describe('ToolInterface', () => {
  it('should have tool properties', () => {
    const tool: ToolInterface = {
      id: 'tool-123',
      org: 'org-456',
      name: 'Weather API',
      friendly_name: 'Weather Tool',
      short_description: 'Get weather information',
      tool_schema: '{"type": "object", "properties": {"location": {"type": "string"}}}',
      required_environment_variables: ['WEATHER_API_KEY'],
      source_url: 'https://github.com/example/weather-tool',
      url: 'https://api.weatherapi.com',
      public: true,
      active: true,
      keywords: ['weather', 'forecast'],
      tags: ['api', 'weather'],
      external_id: 'ext-tool-123',
      extensors: {
        provider: 'weatherapi'
      }
    };

    expect(tool.name).toBe('Weather API');
    expect(tool.tool_schema).toContain('"type": "object"');
    expect(tool.required_environment_variables).toEqual(['WEATHER_API_KEY']);
  });
});

describe('AgentInterface', () => {
  it('should have agent properties', () => {
    const agent: AgentInterface = {
      id: 'agent-123',
      name: 'Customer Support Agent',
      org: 'org-456',
      short_description: 'AI agent for customer support',
      long_description: 'An intelligent agent that handles customer inquiries...',
      image: 'https://example.com/agent-avatar.png',
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1000,
      system_prompt: 'You are a helpful customer support agent.',
      public: true,
      active: true,
      tags: ['support', 'customer-service'],
      keywords: ['help', 'assistance'],
      external_id: 'ext-agent-123',
      extensors: {
        department: 'customer-support'
      }
    };

    expect(agent.name).toBe('Customer Support Agent');
    expect(agent.model).toBe('gpt-4');
    expect(agent.temperature).toBe(0.7);
  });
});

describe('ChatMessage', () => {
  it('should support different message roles', () => {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'You are a helpful assistant.'
    };

    const userMessage: ChatMessage = {
      role: 'user',
      content: 'Hello, how are you?'
    };

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: 'I am doing well, thank you!'
    };

    expect(systemMessage.role).toBe('system');
    expect(userMessage.role).toBe('user');
    expect(assistantMessage.role).toBe('assistant');
  });
});

describe('ChatCompletionRequest', () => {
  it('should have correct structure', () => {
    const request: ChatCompletionRequest = {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
      logging: true,
      log_id: 'log-123'
    };

    expect(request.model).toBe('gpt-4');
    expect(request.messages).toHaveLength(2);
    expect(request.stream).toBe(false);
  });
});

describe('ChatCompletionResponse', () => {
  it('should have correct structure', () => {
    const response: ChatCompletionResponse = {
      id: 'chat-123',
      object: 'chat.completion',
      created: 1640995200,
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Hello! How can I help you today?'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 15,
        total_tokens: 25
      }
    };

    expect(response.id).toBe('chat-123');
    expect(response.choices).toHaveLength(1);
    expect(response.usage.total_tokens).toBe(25);
  });
});

describe('OAuthConfig', () => {
  it('should have OAuth configuration properties', () => {
    const oauthConfig: OAuthConfig = {
      clientId: 'client-123',
      redirectUri: 'https://myapp.com/callback',
      appURL: 'https://mosaia.ai',
      apiURL: 'https://api.mosaia.ai',
      scopes: ['read', 'write'],
      state: 'random-state-string'
    };

    expect(oauthConfig.clientId).toBe('client-123');
    expect(oauthConfig.scopes).toEqual(['read', 'write']);
    expect(oauthConfig.state).toBe('random-state-string');
  });
});

describe('OAuthTokenResponse', () => {
  it('should have token response properties', () => {
    const tokenResponse: OAuthTokenResponse = {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refresh_token: 'refresh-token-here',
      token_type: 'Bearer',
      expires_in: 3600,
      sub: 'user-123',
      iat: '1640995200',
      exp: '1640998800'
    };

    expect(tokenResponse.access_token).toContain('eyJ');
    expect(tokenResponse.token_type).toBe('Bearer');
    expect(tokenResponse.expires_in).toBe(3600);
  });
});

describe('OAuthErrorResponse', () => {
  it('should have error response properties', () => {
    const errorResponse: OAuthErrorResponse = {
      error: 'invalid_grant',
      error_description: 'The authorization code has expired',
      error_uri: 'https://docs.mosaia.ai/oauth/errors'
    };

    expect(errorResponse.error).toBe('invalid_grant');
    expect(errorResponse.error_description).toBe('The authorization code has expired');
  });
});

describe('AppBotInterface', () => {
  it('should have app bot properties', () => {
    const appBot: AppBotInterface = {
      id: 'app-bot-123',
      app: 'app-456',
      response_url: 'https://webhook.example.com/callback',
      org: 'org-789',
      agent: 'agent-123',
      agent_group: 'group-456',
      api_key: 'bot-api-key',
      api_key_partial: 'bot-***-key',
      active: true,
      tags: ['webhook', 'integration'],
      extensors: {
        webhook_secret: 'secret-123'
      },
      external_id: 'ext-app-bot-123'
    };

    expect(appBot.app).toBe('app-456');
    expect(appBot.response_url).toBe('https://webhook.example.com/callback');
    expect(appBot.api_key_partial).toBe('bot-***-key');
  });
});

describe('DehydratedAppBotInterface', () => {
  it('should have dehydrated app bot properties', () => {
    const dehydratedAppBot: DehydratedAppBotInterface = {
      id: 'app-bot-123',
      app: 'app-456', // This is now a string instead of AppInterface
      response_url: 'https://webhook.example.com/callback',
      org: 'org-789',
      agent: 'agent-123',
      active: true
    };

    expect(dehydratedAppBot.app).toBe('app-456');
    expect(typeof dehydratedAppBot.app).toBe('string');
  });
});

describe('Complex nested interfaces', () => {
  it('should support complex nested structures', () => {
    const complexEntity: BaseEntity & {
      nested: {
        user: UserInterface;
        org: OrganizationInterface;
        apps: AppInterface[];
      };
    } = {
      id: 'complex-123',
      active: true,
      nested: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'John Doe'
        },
        org: {
          id: 'org-123',
          name: 'Acme Corp',
          short_description: 'Test organization'
        },
        apps: [
          {
            id: 'app-1',
            name: 'App 1',
            short_description: 'First app'
          },
          {
            id: 'app-2',
            name: 'App 2',
            short_description: 'Second app'
          }
        ]
      }
    };

    expect(complexEntity.nested.user.name).toBe('John Doe');
    expect(complexEntity.nested.apps).toHaveLength(2);
  });
});

describe('Type compatibility', () => {
  it('should ensure type compatibility between related interfaces', () => {
    // Test that UserInterface extends BaseEntity
    const user: UserInterface = {
      id: 'user-123',
      active: true,
      email: 'user@example.com'
    };

    // Test that OrganizationInterface extends BaseEntity
    const org: OrganizationInterface = {
      id: 'org-123',
      name: 'Test Org',
      active: true
    };

    // Test that AppInterface extends BaseEntity
    const app: AppInterface = {
      id: 'app-123',
      name: 'Test App',
      short_description: 'Test description',
      active: true
    };

    expect(user.id).toBeDefined();
    expect(org.id).toBeDefined();
    expect(app.id).toBeDefined();
  });
}); 