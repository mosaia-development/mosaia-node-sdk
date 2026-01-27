import { VectorIndexInterface, ReindexFilesResponse, RAGSearchResponse, RAGSearchDocument, PagingInterface } from '../types';
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

    /**
     * Reindexes all files associated with this VectorIndex
     * 
     * This method triggers asynchronous reindexing of all files in the VectorIndex:
     * - Deletes all existing Vector documents for this index
     * - Queues a reindex job to storage-manager via SQS
     * - Storage-manager finds all files (recursively if folder-based) and sends to document-parser
     * - Returns immediately after queuing (async processing)
     * 
     * The reindex operation will process:
     * - If folder is set: All files recursively in that folder (folder takes precedence over drive)
     * - If drive is set (and no folder): All files in that drive
     * - Only ACTIVE FILE type DriveItems are processed
     * 
     * @returns Promise resolving to reindex result with status and deleted vectors count
     * 
     * @throws {Error} When VectorIndex instance has no ID
     * @throws {Error} When API request fails
     * 
     * @example
     * ```typescript
     * // Reindex all files in a folder-level index
     * const vectorIndex = await vectorIndexes.getById('index-id');
     * const result = await vectorIndex.reindexFiles();
     * // Returns: { deletedVectors: 100, status: "queued", message: "Reindex job has been queued..." }
     * ```
     * 
     * @example
     * ```typescript
     * // Reindex all files in a drive-level index
     * const vectorIndex = await vectorIndexes.getById('index-id');
     * const result = await vectorIndex.reindexFiles();
     * console.log(`Deleted ${result.deletedVectors} vectors, status: ${result.status}`);
     * ```
     */
    async reindexFiles(): Promise<ReindexFilesResponse> {
        try {
            const response = await this.apiClient.POST<{ data: ReindexFilesResponse }>(`${this.getUri()}/reindex`);
            if (!response) {
                throw new Error('Invalid response from API');
            }
            // Handle both { data: {...} } and direct response structures
            return (response as any).data || response as ReindexFilesResponse;
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }

    /**
     * Performs RAG (Retrieval-Augmented Generation) search within this VectorIndex
     * 
     * This method performs a complete RAG pipeline: generates embeddings for a query,
     * searches the vector index for relevant documents, and reranks the results using
     * a reranking model. It searches only within this VectorIndex.
     * 
     * @param {string} query - The search query to process
     * @param {Object} [options={}] - Search options
     * @param {number} [options.limit=10] - Maximum number of results to return
     * @param {Object} [options.params] - Additional metadata filters for vector search
     * @param {string[]} [options.exclude] - Array of document IDs or content to exclude from results
     * @param {string} [options.embeddingModelId] - Custom embedding model ID to use (optional)
     * @param {string} [options.rerankModelId] - Custom reranking model ID to use (optional)
     * @returns Promise resolving to RAG search results with documents and paging
     * 
     * @throws {Error} When VectorIndex instance has no ID
     * @throws {Error} When API request fails
     * 
     * @example
     * ```typescript
     * // Basic RAG search
     * const vectorIndex = await vectorIndexes.getById('index-id');
     * const results = await vectorIndex.search('machine learning algorithms');
     * // Returns: { documents: [{ document: "...", index: 0, relevance_score: 0.95 }, ...], paging: {...} }
     * ```
     * 
     * @example
     * ```typescript
     * // RAG search with options
     * const results = await vectorIndex.search('AI best practices', {
     *   limit: 20,
     *   params: { category: 'technical' },
     *   exclude: ['doc-id-1', 'doc-id-2'],
     *   embeddingModelId: 'custom-embedding-model',
     *   rerankModelId: 'custom-rerank-model'
     * });
     * 
     * results.documents.forEach((doc, idx) => {
     *   console.log(`Result ${idx}: ${doc.document.substring(0, 100)}... (score: ${doc.relevance_score})`);
     * });
     * ```
     */
    async search(
        query: string,
        options: {
            limit?: number;
            params?: Record<string, any>;
            exclude?: string[];
            embeddingModelId?: string;
            rerankModelId?: string;
        } = {}
    ): Promise<RAGSearchResponse> {
        try {
            if (!this.hasId()) {
                throw new Error('VectorIndex instance must have an ID before performing search. Call getById() first.');
            }

            const {
                limit = 10,
                params = {},
                exclude = [],
                embeddingModelId,
                rerankModelId
            } = options;

            // Build query parameters
            const queryParams: Record<string, any> = {
                query,
                limit: limit.toString()
            };

            // Add optional parameters
            if (Object.keys(params).length > 0) {
                queryParams.params = JSON.stringify(params);
            }
            if (exclude.length > 0) {
                queryParams.exclude = JSON.stringify(exclude);
            }
            if (embeddingModelId) {
                queryParams.embeddingModelId = embeddingModelId;
            }
            if (rerankModelId) {
                queryParams.rerankModelId = rerankModelId;
            }

            // Call GET endpoint with query parameters
            const response = await this.apiClient.GET<{ data: RAGSearchDocument[]; paging?: PagingInterface }>(
                this.getUri(),
                queryParams
            );

            if (!response) {
                throw new Error('Invalid response from API');
            }

            // Handle both { data: {...}, paging: {...} } and direct response structures
            const documents = (response as any).data || response as RAGSearchDocument[];
            const paging = (response as any).paging;

            return {
                documents: Array.isArray(documents) ? documents : [],
                paging
            };
        } catch (error) {
            if ((error as any).message) {
                throw new Error(String((error as any).message || 'Unknown error'));
            }
            throw new Error('Unknown error occurred');
        }
    }
}

