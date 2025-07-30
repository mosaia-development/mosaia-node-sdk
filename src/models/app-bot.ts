import { AppBotInterface } from '../types';
import { BaseModel } from './base';

export default class AppBot extends BaseModel<AppBotInterface> {
    constructor(data: Partial<AppBotInterface>, uri?: string) {
        super(data, uri || '/bot');
    }
} 