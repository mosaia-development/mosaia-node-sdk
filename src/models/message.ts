import { MessageInterface } from '../types';
import { BaseModel } from './base';

/**
 * Message class for managing log messages
 * 
 * This class represents a log message in the Mosaia platform.
 * 
 * @extends BaseModel<MessageInterface>
 * @category Models
 */
export default class Message extends BaseModel<MessageInterface> {
    constructor(data: Partial<MessageInterface>, uri?: string) {
        super(data, uri || '/message');
    }
}

