import { ToolInterface } from '../types';
import { BaseModel } from './base';

export default class Tool extends BaseModel<ToolInterface> {
    constructor(data: Partial<ToolInterface>, uri?: string) {
        super(data, uri || '/tool');
    }
} 