import { VectorInterface } from '../types';
import { BaseModel } from './base';

/**
 * Vector class for managing individual vector embeddings
 * 
 * This class represents an individual vector embedding in the Mosaia platform, which belongs
 * to a VectorIndex container. Vectors contain the actual embedding arrays and content.
 * 
 * @extends BaseModel<VectorInterface>
 * @category Models
 */
export default class Vector extends BaseModel<VectorInterface> {
    constructor(data: Partial<VectorInterface>, uri?: string) {
        super(data, uri || '/vector');
    }
}
