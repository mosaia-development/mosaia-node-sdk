import { VectorIndexInterface } from '../types';
import { BaseModel } from './base';

/**
 * VectorIndex class for managing vector indexes
 * 
 * This class represents a vector index in the Mosaia platform, which is used
 * for semantic search and similarity matching.
 * 
 * @extends BaseModel<VectorIndexInterface>
 * @category Models
 */
export default class VectorIndex extends BaseModel<VectorIndexInterface> {
    constructor(data: Partial<VectorIndexInterface>, uri?: string) {
        super(data, uri || '/index');
    }
}

