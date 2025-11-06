import { ChatCompletionRequest, ChatCompletionResponse } from "../types";
import { BaseFunctions } from "./base-functions";

/**
 * Completions functions class for managing chat completion operations
 * 
 * This class handles chat completion requests to AI models, providing a
 * standardized interface for generating AI responses. It extends BaseFunctions
 * to inherit standard CRUD operations while specializing in chat completions.
 * 
 * The class is typically accessed through the Chat class rather than
 * instantiated directly.
 * 
 * @example
 * ```typescript
 * // Access through Chat class (recommended)
 * const chat = new Chat('/agent/123');
 * const completions = chat.completions;
 * 
 * // Create a chat completion
 * const response = await completions.create({
 *   messages: [
 *     { role: 'system', content: 'You are a helpful assistant.' },
 *     { role: 'user', content: 'Hello, how are you?' }
 *   ],
 *   max_tokens: 150,
 *   temperature: 0.7,
 *   stream: false
 * });
 * 
 * console.log('AI Response:', response.choices[0].message.content);
 * ```
 * 
 * @category Functions
 */
export class Completions extends BaseFunctions<ChatCompletionRequest, any, ChatCompletionResponse> {
  /**
   * Creates a new Completions instance
   * 
   * @param uri - Base URI for the completions endpoint (typically set by Chat class)
   * 
   * @example
   * ```typescript
   * // Usually accessed through Chat class
   * const chat = new Chat('/agent/123');
   * const completions = chat.completions; // This calls the constructor internally
   * 
   * // Direct instantiation (less common)
   * const completions = new Completions('/agent/123/chat');
   * ```
   */
  constructor(uri: string = "") {
    super(`${uri}/completions`); // Pass the chat endpoint URI to the base class
  }
} 