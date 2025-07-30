import {
    AuthResponse,
    OrganizationInterface,
    OrgUserInterface,
    UserInterface
} from '../types';
import { BaseModel } from './base';
import Mosaia from '../index';
import Organization from './organization';
import User from './user';

export default class OrgUser extends BaseModel<OrgUserInterface> {
    constructor(data: Partial<OrgUserInterface>, uri?: string) {
        super(data, uri || '/org');
    }

    get user(): User {
        if (!this.data.user) {
            throw new Error('User data not available');
        }
        return new User(this.data.user as Partial<UserInterface>);
    }

    set user(data: UserInterface) {
        this.update({ user: data as any });
    }

    get org(): Organization {
        if (!this.data.org) {
            throw new Error('Organization data not available');
        }
        return new Organization(this.data.org as Partial<OrganizationInterface>);
    }

    set org(data: OrganizationInterface) {
        this.update({ org: data as any });
    }

    async session(): Promise<Mosaia> {
        try {
            const {
                data,
                error
            } = await this.client.GET<AuthResponse>(`${this.uri}/session`);

            if (error) {
                throw new Error(error.message);
            }

            const config = {
                ...this.config,
                apiKey: data.access_token,
                refreshToken: data.refresh_token
            }
            return Promise.resolve(new Mosaia(config));
        } catch (error) {
            console.log('error:', error);
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }

    async disable(): Promise<void> {
        try {
            const { error } = await this.client.DELETE<void>(`${this.getUri()}`);

            if (error) {
                throw new Error(error.message);
            }
            return Promise.resolve();
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }
}