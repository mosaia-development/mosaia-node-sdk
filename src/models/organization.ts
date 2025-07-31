import { OrganizationInterface, GetUserPayload } from '../types';
import { BaseModel } from './base';
import {
    Agents,
    Apps,
    Clients,
    AgentGroups,
    Models,
    OrgUsers,
    Tools
} from '../apis';

export default class Organization extends BaseModel<OrganizationInterface> {
    constructor(data: Partial<OrganizationInterface>, uri?: string) {
        super(data, uri || '/org');
    }

    get agents(): Agents {
        return new Agents(this.getUri());
    }

    get apps(): Apps {
        return new Apps(this.getUri());
    }

    /**
     * Commented out for later implementation
     */
    // get billing(): Billing {
    //     return new Billing(this.getUri());
    // }

    get clients(): Clients {
        return new Clients(this.getUri());
    }

    get groups(): AgentGroups {
        return new AgentGroups(this.getUri());
    }

    /**
     * Placeholder to be implemented later in the future
     */
    // get iam() {
    //     return new Iam(this.getUri());
    // }

    get models(): Models {
        return new Models(this.getUri());
    }

    get orgs(): OrgUsers {
        return new OrgUsers(this.getUri());
    }

    get tools(): Tools {
        return new Tools(this.getUri());
    }

    /**
     * Upload profile image
     * 
     * @param file - Image file to upload
     * @returns Promise that resolves to the updated user data
     */
    async uploadProfileImage(file: File): Promise<Organization> {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const {
                data,
                error
            } = await this.apiClient.POST<GetUserPayload>(`${this.getUri}/profile/image/upload`, formData);
            
            if (error) {
                throw new Error(error.message);
            }
            this.update(data as any);
    
            return this;
        } catch (error) {
            if ((error as any).message) {
                throw new Error((error as any).message);
            }
            throw new Error('Unknown error occurred');
        }
    }
}