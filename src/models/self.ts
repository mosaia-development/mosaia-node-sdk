import {
    MosiaConfig,
    SelfInterface,
    UserInterface
} from '../types';
import { BaseModel } from './base';
import User from './user';

export default class Self extends BaseModel<SelfInterface> {
    constructor(data: Partial<SelfInterface>) {
        super(data);
    }

    get user(): User | null {
        if (this.data.user) {
            return new User(this.data.user);
        }
        return null;
    }

    set user(user: UserInterface) {
        this.data.user = user;
    }

    // get org(): Organization | null {
    //     if (this.data.org) {
    //         return new Organization(this.data.org, this.config);
    //     }
    //     return null;
    // }

    // get orgUser(): OrgUser | null {
    //     if (this.data.orgUser) {
    //         return new OrgUser(this.data.orgUser, this.config);
    //     }
    //     return null;
    // }

    // get client(): Client | null {
    //     if (this.data.client) {
    //         return new Client(this.data.client, this.config);
    //     }
    //     return null;
    // }
}