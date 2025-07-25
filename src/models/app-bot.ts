import { AppBotInterface } from '../types';
import { AppBots } from '../apis';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

export default class AppBot {
    private appBots: AppBots;
    public props: AppBotInterface;
    private openai: OpenAI | null;

    constructor(bots: AppBots, bot: AppBotInterface) {
        this.props = bot;
        this.appBots = bots;
        this.openai = null;
    }

    auth(apiKey: string) {
        const { config } = this.appBots;

        this.openai = new OpenAI({
            apiKey: apiKey,
            baseURL: config.apiURL,
        });
    }

    private noAuthError(): never {
        throw new Error('Run bot.auth($YOUR_MOSAIA_BOT_KEY) first');
    }

    get chat() {
        if(this.openai === null) this.noAuthError();

        return {
            completions: {
                create: (messages: ChatCompletionMessageParam[]) => {
                    if(this.openai === null) this.noAuthError();

                    return this.openai.chat.completions.create({
                        messages,
                        model: ''//this.props.model,
                    });
                }
            }
        }
    }
}