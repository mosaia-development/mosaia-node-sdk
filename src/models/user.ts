import { GetUserPayload, UserInterface } from '../types';
import { BaseModel } from './base';
import {
    Agents,
    Apps,
    OrgUsers
} from '../apis';

export default class User extends BaseModel<UserInterface> {
    constructor(data: Partial<UserInterface>, uri?: string) {
        super(data, uri || '/user');
    }

    get agents(): Agents {
        return new Agents(this.getUri());
    }

    get apps(): Apps {
        return new Apps(this.getUri());
    }

    get orgUsers(): OrgUsers {
        return new OrgUsers(this.getUri());
    }

        /**
     * Upload profile image
     * 
     * @param id - User ID to upload image for
     * @param file - Image file to upload
     * @returns Promise that resolves to the updated user data
     */
    async uploadProfileImage(id: string, file: File): Promise<User> {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await this.client.POST<GetUserPayload>(`${this.getUri}/profile-image`, formData);
        if (!res || !res.data) {
            throw new Error('Invalid response from API');
        }

        (this.data as any).profile_image = (res.data as any).profile_image;
        return this;
    }
}