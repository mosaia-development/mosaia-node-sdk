import { Chat } from '../functions/chat';
import {
    APIResponse,
    ChatCompletionRequest,
    ChatCompletionResponse,
    ModelInterface,
    GetModelPayload,
    RerankRequest,
    RerankResponse,
    EmbeddingRequest,
    EmbeddingResponse
} from '../types';
import { BaseModel } from './base';

/**
 * Model class for managing AI model configurations
 * 
 * This class represents an AI model configuration in the Mosaia platform.
 * It provides a structured way to define, customize, and interact with
 * various AI models through a unified interface.
 * 
 * Features:
 * - Model configuration management
 * - Chat completion capabilities
 * - Parameter customization
 * - Provider integration
 * - Performance monitoring
 * 
 * @remarks
 * Models are the core AI engines that power:
 * - Text generation and completion
 * - Natural language understanding
 * - Decision making and analysis
 * - Content transformation
 * - Knowledge extraction
 * 
 * The class supports various model providers and configurations:
 * - OpenAI (GPT-3.5, GPT-4)
 * - Anthropic (Claude)
 * - Custom models
 * 
 * @example
 * Basic model setup:
 * ```typescript
 * import { Model } from 'mosaia-node-sdk';
 * 
 * // Create a GPT-4o model configuration
 * const gpt4Model = new Model({
 *   name: 'gpt-4o',
 *   model: 'gpt-4o',
 *   description: 'Flagship multimodal model from OpenAI.',
 *   type: 'chat',
 *   api_type: 'openai',
 *   base_url: 'https://api.openai.com/v1',
 *   api_key: process.env.OPENAI_API_KEY!,
 *   prices: {
 *     input_per_1k: 0.005,
 *     output_per_1k: 0.015
 *   },
 *   max_context_tokens: 128000,
 *   max_output_tokens: 16384
 * });
 *
 * await gpt4Model.save();
 * ```
 * 
 * @example
 * Using chat capabilities:
 * ```typescript
 * // Interact with the model
 * const response = await gpt4Model.chat.completions.create({
 *   messages: [
 *     {
 *       role: 'system',
 *       content: 'You are a helpful assistant.'
 *     },
 *     {
 *       role: 'user',
 *       content: 'Explain quantum computing in simple terms.'
 *     }
 *   ],
 *   temperature: 0.5,
 *   max_tokens: 500
 * });
 * 
 * console.log('Model response:', response.choices[0].message.content);
 * ```
 * 
 * @extends BaseModel<ModelInterface>
 * @category Models
 */
export default class Model extends BaseModel<ModelInterface> {
    /**
     * Creates a new AI model configuration
     * 
     * Initializes a model configuration with the specified parameters and settings.
     * The model configuration defines how the AI model behaves and interacts
     * with the platform.
     * 
     * @param data - Configuration data including:
     *               - name: Display name (required, unique among public models)
     *               - model: Upstream model identifier (e.g. 'gpt-4o', 'claude-3-5-sonnet-20241022')
     *               - description: One-line description (required)
     *               - api_type: Provider protocol (e.g. 'openai', 'anthropic')
     *               - base_url: Provider API base URL (required, encrypted)
     *               - api_key: Provider API key (required, encrypted)
     *               - prices: Pricing map (values must be numbers)
     *               - type: Model category (chat | image | rerank | moderation | language | embedding | contextualized_embedding)
     *               - max_context_tokens / max_output_tokens: Token limits
     * @param uri - Optional custom URI path for the model endpoint
     *
     * @example
     * Basic configuration:
     * ```typescript
     * const model = new Model({
     *   name: 'support-gpt',
     *   model: 'gpt-4o',
     *   description: 'Support model fine-tuned on Zendesk tickets.',
     *   api_type: 'openai',
     *   base_url: 'https://api.openai.com/v1',
     *   api_key: process.env.OPENAI_API_KEY!,
     *   prices: { input_per_1k: 0.005, output_per_1k: 0.015 }
     * });
     * ```
     *
     * @example
     * Advanced configuration:
     * ```typescript
     * const model = new Model({
     *   name: 'enterprise-claude',
     *   model: 'claude-3-5-sonnet-20241022',
     *   description: 'Enterprise documentation assistant.',
     *   api_type: 'anthropic',
     *   base_url: 'https://api.anthropic.com/v1',
     *   api_key: process.env.ANTHROPIC_API_KEY!,
     *   prices: { input_per_1k: 0.003, output_per_1k: 0.015 },
     *   type: 'chat',
     *   max_context_tokens: 200000,
     *   max_output_tokens: 8192,
     *   encoding: 'cl100k_base'
     * }, '/enterprise/model');
     * ```
     */
    constructor(data: Partial<ModelInterface>, uri?: string) {
        super(data, uri || '/model');
    }

    /**
     * Get the chat functionality for this model
     * 
     * This getter provides access to the model's chat capabilities through
     * the Chat class. It enables direct interaction with the model for
     * text generation and completion tasks.
     * 
     * @returns A new Chat instance configured for this model
     * 
     * @example
     * Basic chat:
     * ```typescript
     * const response = await model.chat.completions.create({
     *   messages: [
     *     { role: 'user', content: 'What is machine learning?' }
     *   ]
     * });
     * ```
     * 
     * @example
     * Advanced chat with system prompt:
     * ```typescript
     * const response = await model.chat.completions.create({
     *   messages: [
     *     {
     *       role: 'system',
     *       content: 'You are an expert in artificial intelligence.'
     *     },
     *     {
     *       role: 'user',
     *       content: 'Explain neural networks to a beginner.'
     *     }
     *   ],
     *   temperature: 0.3,
     *   max_tokens: 1000,
     *   stream: false
     * });
     * 
     * console.log('Model explanation:', response.choices[0].message.content);
     * ```
     */
    get chat() {
        return new Chat(this.getUri());
    }

    /**
     * Rerank documents using this model
     * 
     * Uses this model to rerank documents based on their relevance
     * to a query string.
     * 
     * @param request - Rerank request parameters
     * @param request.query - The query string to rank documents against
     * @param request.documents - Array of document strings to rank
     * @param request.model - Optional model identifier override
     * @param request.reorder_results - Optional flag to reorder results by relevance score
     * @returns Promise resolving to the rerank response
     * 
     * @example
     * ```typescript
     * const response = await model.rerank({
     *   query: 'What is artificial intelligence?',
     *   documents: [
     *     'Document about AI...',
     *     'Document about machine learning...',
     *     'Document about unrelated topic...'
     *   ],
     *   reorder_results: true
     * });
     * 
     * console.log('Top result:', response.results[0].document.text);
     * ```
     * 
     * @throws {Error} When API request fails
     */
    async rerank(request: RerankRequest): Promise<RerankResponse> {
        try {
            const response = await this.apiClient.POST<RerankResponse>(`${this.getUri()}/rerank`, request);
            return response.data || response as RerankResponse;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Generate embeddings using this model
     * 
     * Generates vector embeddings for text input using this model.
     * 
     * @param request - Embedding request parameters
     * @param request.input - Single string or array of strings to generate embeddings for
     * @param request.model - Optional model identifier override
     * @returns Promise resolving to the embedding response
     * 
     * @example
     * ```typescript
     * // Generate embedding for single text
     * const response = await model.embeddings({
     *   input: 'Text to embed'
     * });
     * 
     * // Generate embeddings for multiple texts
     * const response = await model.embeddings({
     *   input: ['Text 1', 'Text 2', 'Text 3']
     * });
     * 
     * console.log('First embedding:', response.data[0].embedding);
     * ```
     * 
     * @throws {Error} When API request fails
     */
    async embeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
        try {
            const response = await this.apiClient.POST<EmbeddingResponse>(`${this.getUri()}/embeddings`, request);
            return response.data || response as EmbeddingResponse;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Like or unlike this model
     * 
     * Toggles the like status of this model. If the model is already liked,
     * it will be unliked, and vice versa.
     * 
     * @returns Promise that resolves to the updated model instance
     * 
     * @example
     * ```typescript
     * await model.like();
     * console.log('Model liked:', model.liked);
     * ```
     * 
     * @throws {Error} When API request fails
     */
    async like(): Promise<Model> {
        try {
            const response = await this.apiClient.POST<GetModelPayload>(`${this.getUri()}/like`);
            if (!response || !response.data) {
                throw new Error('Invalid response from API');
            }
            this.update(response.data);
            return this;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
}