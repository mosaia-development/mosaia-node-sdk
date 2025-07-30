import {
    OrganizationInterface
} from '../types';
import { BaseModel } from './base';
import {
    Agents,
    Apps
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
}