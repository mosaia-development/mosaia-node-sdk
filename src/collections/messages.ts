import {
    MessageInterface,
    GetMessagesPayload,
    GetMessagePayload
} from '../types';
import { Message } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Messages API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing log messages in the Mosaia platform.
 * Log messages are associated with specific logs.
 * 
 * @extends BaseCollection<MessageInterface, Message, GetMessagesPayload, GetMessagePayload>
 */
export default class Messages extends BaseCollection<
    MessageInterface,
    Message,
    GetMessagesPayload,
    GetMessagePayload
> {
    constructor(uri = '') {
        super(`${uri}/message`, Message);
    }
}

