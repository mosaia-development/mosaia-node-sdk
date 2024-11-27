import { AppBotInterface } from '../types';
import { AppBots } from '../apis';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

export default class AppBot {
    private appBots: AppBots;
    public props: AppBotInterface;
    private openai: OpenAI;

    constructor(bots: AppBots, bot: AppBotInterface) {
        this.props = bot;
        this.appBots = bots;
        const { config } = this.appBots;

        this.openai = new OpenAI({
            apiKey: this.props.api_key,
            baseURL: config.baseURL,
        })
    }

    get chat() {
        return {
            completions: {
                create: (messages: ChatCompletionMessageParam[]) => {
                    return this.openai.chat.completions.create({
                        messages,
                        model: this.props.model,
                    });
                }
            }
        }
    }
}