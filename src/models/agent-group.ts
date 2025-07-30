import { AgentGroupInterface } from '../types';
import { BaseModel } from './base';

export default class AgentGroup extends BaseModel<AgentGroupInterface> {
    constructor(data: Partial<AgentGroupInterface>, uri?: string) {
        super(data, uri || '/group');
    }
} 