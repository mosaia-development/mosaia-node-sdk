import { AppInterface } from '../types';
import { BaseModel } from './base';

export default class App extends BaseModel<AppInterface> {
    constructor(data: Partial<AppInterface>, uri?: string) {
        super(data, uri || '/app');
    }
}