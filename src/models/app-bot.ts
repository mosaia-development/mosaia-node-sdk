import { AppBotInterface } from '../types';
import { AppBots } from '../apis';

export default class AppBot {
    private appBots: AppBots;
    public props: AppBotInterface;

    constructor(bots: AppBots, bot: AppBotInterface) {
        this.appBots = bots;
        this.props = bot;
    }
}