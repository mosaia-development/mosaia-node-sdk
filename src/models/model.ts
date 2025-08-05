import { Chat } from '../functions/chat';
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
     * Get the chat function
     * 
     * @returns The chat function
     */
    get chat() {
        return new Chat(this.getUri());
    }
}