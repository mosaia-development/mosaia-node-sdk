import {
    OrgUserInterface,
    GetOrgUsersPayload,
    GetOrgUserPayload
} from '../types';
import { OrgUser } from '../models';
import { BaseAPI } from './base-api';

export default class OrgUsers extends BaseAPI<
    OrgUserInterface,
    OrgUser,
    GetOrgUsersPayload,    
    GetOrgUserPayload
> {
    constructor(uri = '') {
        super(`${uri}/org`, OrgUser);
    }
}