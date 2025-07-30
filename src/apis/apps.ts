import {
    AppInterface,
    GetAppsPayload,
    GetAppPayload
} from '../types';
import { App } from '../models';
import { BaseAPI } from './base-api';

export default class Apps extends BaseAPI<
    AppInterface,
    App,
    GetAppsPayload,
    GetAppPayload
> {
    constructor(uri = '') {
        super(`${uri}/app`, App);
    }
}