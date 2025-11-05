import { PlanInterface } from '../types';
import { BaseModel } from './base';

/**
 * Plan class for managing task plans
 * 
 * This class represents a task plan in the Mosaia platform.
 * 
 * @extends BaseModel<PlanInterface>
 * @category Models
 */
export default class Plan extends BaseModel<PlanInterface> {
    constructor(data: Partial<PlanInterface>, uri?: string) {
        super(data, uri || '/plan');
    }
}

