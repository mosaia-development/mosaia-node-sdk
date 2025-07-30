import {
    AppBotInterface,
    GetAppBotsPayload,
    GetAppBotPayload
} from '../types';
import { AppBot } from '../models';
import { BaseAPI } from './base-api';

export default class AppBots extends BaseAPI<
    AppBotInterface,
    AppBot,
    GetAppBotsPayload,
    GetAppBotPayload
> {
    constructor(uri = '') {
        super(`${uri}/bot`, AppBot);
    }
} 