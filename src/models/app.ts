import { AppInterface } from '../types';
import {
    Apps,
    AppBots
} from '../apis';

export default class App {
    private apps: Apps;
    public props: AppInterface;

    constructor(apps: Apps, app: AppInterface) {
        this.apps = apps;
        this.props = app;
    }

    get bots(): AppBots {
        return new AppBots(this.apps, this.props);
    }
}