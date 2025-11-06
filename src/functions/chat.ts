import { BaseFunctions } from './base-functions';
import { Completions } from './completions';

/**
 * Chat functions class for managing chat-related operations
 * 
 * This class provides functionality for chat operations, including access to
 * chat completions. It extends BaseFunctions to inherit standard CRUD operations
 * while adding chat-specific functionality.
 * 
 * @example
 * ```typescript
 * // Create a chat instance
 * const chat = new Chat('/agent/123');
 * 
 * // Access completions
 * const completions = chat.completions;
 * 
 * // Create a chat completion
 * const response = await completions.create({
 *   messages: [
 *     { role: 'user', content: 'Hello, how are you?' }
 *   ],
 *   max_tokens: 100,
 *   temperature: 0.7
 * });
 * ```
 * 
 * @category Functions
 */
export class Chat extends BaseFunctions {
  /**
   * Creates a new Chat instance
   * 
   * @param uri - Base URI for the chat endpoint (e.g., '/agent/123')
   * 
   * @example
   * ```typescript
   * // For agent chat
   * const agentChat = new Chat('/agent/agent-id');
   * 
   * // For model chat
   * const modelChat = new Chat('/model/model-id');
   * 
   * // For agent group chat
   * const groupChat = new Chat('/agent-group/group-id');
   * ```
   */
  constructor(uri: string = "") {
    super(`${uri}/chat`); // Pass the chat endpoint URI to the base class    
  }

  /**
   * Get the completions instance for this chat
   * 
   * This getter provides access to the Completions class, which handles
   * chat completion requests to AI models.
   * 
   * @returns A new Completions instance configured for this chat endpoint
   * 
   * @example
   * ```typescript
   * const chat = new Chat('/agent/123');
   * const completions = chat.completions;
   * 
   * // Use completions to generate responses
   * const response = await completions.create({
   *   messages: [
   *     { role: 'user', content: 'What is the weather like?' }
   *   ]
   * });
   * ```
   */
  get completions() {
    return new Completions(this.uri);
  }
} 