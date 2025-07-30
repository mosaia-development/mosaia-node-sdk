import {
    AgentInterface,
    ChatCompletionRequest,
    ChatCompletionResponse,
    APIResponse
} from '../types';
import { BaseModel } from './base';

export default class Agent extends BaseModel<AgentInterface> {
    constructor(data: Partial<AgentInterface>, uri?: string) {
        super(data, uri || '/agent');
    }

    /**
     * Chat completion with an agent
     * 
     * Sends a chat completion request to a specific agent and returns
     * the AI-generated response.
     * 
     * @param request - Chat completion request parameters
     * @param request.model - AI model to use for completion
     * @param request.messages - Array of chat messages
     * @param request.max_tokens - Maximum tokens for the response
     * @param request.temperature - Temperature setting (0-2)
     * @param request.stream - Whether to stream the response
     * @returns Promise that resolves to the chat completion response
     * 
     * @example
     * ```typescript
     * const completion = await agents.chatCompletion({
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'system', content: 'You are a helpful assistant.' },
     *     { role: 'user', content: 'What is the capital of France?' }
     *   ],
     *   max_tokens: 100,
     *   temperature: 0.7
     * });
     * 
     * console.log('Response:', completion.data.choices[0].message.content);
     * ```
     */
    async chatCompletion(request: ChatCompletionRequest): Promise<APIResponse<ChatCompletionResponse>> {
        return this.client.POST<ChatCompletionResponse>('/agent/chat/completions', request);
    }

    /**
     * Asynchronous chat completion with an agent
     * 
     * Sends an asynchronous chat completion request to a specific agent.
     * This is useful for long-running conversations or when you need
     * to handle the response asynchronously.
     * 
     * @param request - Chat completion request parameters with async type
     * @param request.type - Must be 'async' for asynchronous completion
     * @param request.model - AI model to use for completion
     * @param request.messages - Array of chat messages
     * @returns Promise that resolves to the chat completion response
     * 
     * @example
     * ```typescript
     * const completion = await agents.asyncChatCompletion({
     *   type: 'async',
     *   model: 'gpt-4',
     *   messages: [
     *     { role: 'user', content: 'Generate a long story for me.' }
     *   ]
     * });
     * 
     * console.log('Async response:', completion.data.choices[0].message.content);
     * ```
     */
    async asyncChatCompletion(request: ChatCompletionRequest & { type: 'async' }): Promise<APIResponse<ChatCompletionResponse>> {
        return this.client.POST<ChatCompletionResponse>('/agent/chat/completions', request);
    }


}