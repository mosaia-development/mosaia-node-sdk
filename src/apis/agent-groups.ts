import {
    AgentGroupInterface,
    GetAgentGroupsPayload,
    GetAgentGroupPayload
} from '../types';
import { AgentGroup } from '../models';
import { BaseAPI } from './base-api';

export default class AgentGroups extends BaseAPI<
    AgentGroupInterface,
    AgentGroup,
    GetAgentGroupsPayload,
    GetAgentGroupPayload
> {
    constructor(uri = '') {
        super(`${uri}/group`, AgentGroup);
    }
} 