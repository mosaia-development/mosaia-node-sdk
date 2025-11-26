import {
    ModelInterface,
    GetModelsPayload,
    GetModelPayload
} from '../types';
import { Model } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Models API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing AI models in the Mosaia platform.
 * Models represent different AI/ML models that can be used by agents for
 * various tasks such as text generation, analysis, and decision-making.
 * 
 * This class inherits from BaseCollection and provides the following functionality:
 * - Retrieve AI models with filtering and pagination
 * - Create new model configurations
 * - Manage model providers and configurations
 * - Handle model-specific parameters and metadata
 * 
 * @example
 * ```typescript
 * import { Mosaia } from 'mosaia-node-sdk';
 * 
 * const mosaia = new Mosaia({ apiKey: 'your-api-key' });
 * const models = mosaia.models;
 * 
 * // Get all AI models
 * const allModels = await models.get();
 * 
 * // Get a specific model
 * const model = await models.get({}, 'model-id');
 * 
 * // Create a new model configuration
 * const newModel = await models.create({
 *   name: 'GPT-4 Configuration',
 *   short_description: 'Custom GPT-4 configuration for customer support',
 *   provider: 'openai',
 *   model_id: 'gpt-4',
 *   max_tokens: 4000,
 *   temperature: 0.7
 * });
 * 
 * // Chat completion with a model (via model instance)
 * const chatResponse = await model.chat.completions.create({
 *   messages: [
 *     { role: 'user', content: 'Hello!' }
 *   ]
 * });
 * 
 * // Rerank documents (via model instance)
 * const rerankResponse = await model.rerank({
 *   query: 'What is AI?',
 *   documents: ['Document 1...', 'Document 2...']
 * });
 * 
 * // Generate embeddings (via model instance)
 * const embeddingResponse = await model.embeddings({
 *   input: 'Text to embed'
 * });
 * ```
 * 
 * @extends BaseCollection<ModelInterface, Model, GetModelsPayload, GetModelPayload>
 */
export default class Models extends BaseCollection<
    ModelInterface,
    Model,
    GetModelsPayload,
    GetModelPayload
> {
    /**
     * Creates a new Models API client instance
     * 
     * Initializes the models client with the appropriate endpoint URI
     * and model class for handling AI model operations.
     * 
     * The constructor sets up the API endpoint to `/model` (or `${uri}/model` if a base URI is provided),
     * which corresponds to the Mosaia API's models endpoint.
     * 
     * @param uri - Optional base URI path. If provided, the endpoint will be `${uri}/model`.
     *              If not provided, defaults to `/model`.
     * 
     * @example
     * ```typescript
     * // Create with default endpoint (/model)
     * const models = new Models();
     * 
     * // Create with custom base URI
     * const models = new Models('/api/v1');
     * // This will use endpoint: /api/v1/model
     * ```
     */
    constructor(uri = '') {
        super(`${uri}/model`, Model);
    }
}