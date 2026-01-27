import {
    VectorInterface,
    GetVectorsPayload,
    GetVectorPayload
} from '../types';
import { Vector } from '../models';
import { BaseCollection } from './base-collection';

/**
 * Vectors API client for the Mosaia SDK
 * 
 * Provides CRUD operations for managing individual vector embeddings in the Mosaia platform.
 * Vectors belong to VectorIndex containers and contain the actual embedding arrays and content.
 * 
 * @extends BaseCollection<VectorInterface, Vector, GetVectorsPayload, GetVectorPayload>
 */
export default class Vectors extends BaseCollection<
    VectorInterface,
    Vector,
    GetVectorsPayload,
    GetVectorPayload
> {
    constructor(uri = '') {
        super(`${uri}/vector`, Vector);
    }
}
