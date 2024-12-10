import {
    AppInterface,
    MosiaConfig
} from '../types';
import {
    Apps,
    AppBots
} from '../apis';

export default class App {
    private apps: Apps;
    public props: AppInterface;

    constructor(apps: Apps, app: AppInterface) {
        this.props = app;
        this.apps = apps;
    }

    get bots(): AppBots {
        return new AppBots(this.apps, this.props);
    }
}