import { ChatCompletionRequest, ChatCompletionResponse } from "../types";
import { BaseFunctions } from "./base-functions";

export class Completions extends BaseFunctions<ChatCompletionRequest, any, ChatCompletionResponse> {
  constructor(uri: string = "") {
    super(`${uri}/completions`); // Pass the chat endpoint URI to the base class
  }
} 