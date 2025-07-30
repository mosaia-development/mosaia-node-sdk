import {
    OrganizationInterface,
    GetOrgsPayload,
    GetOrgPayload
} from '../types';
import { Organization } from '../models';
import { BaseAPI } from './base-api';

export default class Organizations extends BaseAPI<
    OrganizationInterface,
    Organization,
    GetOrgsPayload,    
    GetOrgPayload
> {
    constructor(uri = '') {
        super(`${uri}/org`, Organization);
    }
}