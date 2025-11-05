import {
    VectorIndexInterface,
    GetVectorIndexesPayload,
    GetVectorIndexPayload
} from '../types';
import { VectorIndex } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Vector Indexes API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing vector indexes in the Mosaia platform.
 * Vector indexes enable semantic search and similarity matching across documents.
 * 
 * @extends BaseCollection<VectorIndexInterface, VectorIndex, GetVectorIndexesPayload, GetVectorIndexPayload>
 */
export default class VectorIndexes extends BaseCollection<
    VectorIndexInterface,
    VectorIndex,
    GetVectorIndexesPayload,
    GetVectorIndexPayload
> {
    constructor(uri = '') {
        super(`${uri}/index`, VectorIndex);
    }
}

