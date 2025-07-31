import {
    APIResponse,
    ChatCompletionRequest,
    ChatCompletionResponse,
    ModelInterface
} from '../types';
import { BaseModel } from './base';

/**
 * Model class for managing AI model instances in the Mosaia SDK
 * 
 * Represents an AI model configuration that can be used by agents for various tasks
 * such as text generation, analysis, and decision-making. This class provides
 * methods for interacting with AI models and performing chat completions.
 * 
 * This class inherits from BaseModel and provides the following functionality:
 * - Model data management and validation
 * - Chat completion operations (synchronous and asynchronous)
 * - Model configuration and parameter management
 * - Integration with the Mosaia API for model operations
 * 
 * @example
 * ```typescript
 * import { Model } from 'mosaia-node-sdk';
 * 
 * // Create a model instance
 * const model = new Model({
 *   name: 'GPT-4 Configuration',
 *   provider: 'openai',
 *   model_id: 'gpt-4',
 *   max_tokens: 4000,
 *   temperature: 0.7
 * });
 * 
 * // Perform a chat completion
 * const response = await model.chatCompletion({
 *   model: 'gpt-4',
 *   messages: [
 *     { role: 'user', content: 'What is the capital of France?' }
 *   ]
 * });
 * 
 * // Perform an asynchronous chat completion
 * const asyncResponse = await model.chatCompletion({
 *   model: 'gpt-4',
 *   messages: [
 *     { role: 'user', content: 'Generate a long story.' }
 *   ]
 * }, true);
 * ```
 * 
 * @extends BaseModel<ModelInterface>
 */
export default class Model extends BaseModel<ModelInterface> {
    /**
     * Creates a new Model instance
     * 
     * Initializes a model with the provided configuration data and optional URI.
     * The model represents an AI model configuration that can be used for
     * various AI-powered tasks.
     * 
     * @param data - Model configuration data
     * @param uri - Optional URI path for the model endpoint. Defaults to '/model'
     * 
     * @example
     * ```typescript
     * const model = new Model({
     *   name: 'Custom GPT-4',
     *   provider: 'openai',
     *   model_id: 'gpt-4'
     * });
     * ```
     */
    constructor(data: Partial<ModelInterface>, uri?: string) {
        super(data, uri || '/model');
    }

    /**
     * Perform a chat completion with the model
     * 
     * Sends a chat completion request to the AI model and returns the generated response.
     * Supports both synchronous and asynchronous completion modes.
     * 
     * @param request - Chat completion request parameters including model, messages, and options
     * @param isAsync - Whether to perform an asynchronous completion. Defaults to false.
     * @returns Promise that resolves to the chat completion response
     * 
     * @example
     * ```typescript
     * // Synchronous completion
     * const response = await model.chatCompletion({
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'system', content: 'You are a helpful assistant.' },
     *     { role: 'user', content: 'What is 2+2?' }
     *   ],
     *   max_tokens: 100,
     *   temperature: 0.7
     * });
     * 
     * // Asynchronous completion for long-running tasks
     * const asyncResponse = await model.chatCompletion({
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'user', content: 'Write a comprehensive essay about AI.' }
     *   ]
     * }, true);
     * ```
     */
    async chatCompletion(request: ChatCompletionRequest, isAsync: boolean = false): Promise<APIResponse<ChatCompletionResponse>> {
        let uri = '/chat/completions';

        if (isAsync) uri += '?type=async';
        return this.apiClient.POST<ChatCompletionResponse>(`${this.getUri()}${uri}`, request);
    }
}