import { BaseFunctions } from './base-functions';
import { Completions } from './completions';

export class Chat extends BaseFunctions {
  constructor(uri: string = "") {
    super(`${uri}/chat`); // Pass the chat endpoint URI to the base class    
  }

  // Add chat-related methods here
  get completions() {
    return new Completions(this.uri);
  }
} 