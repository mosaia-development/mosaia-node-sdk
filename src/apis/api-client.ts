import axios, { AxiosInstance, AxiosError } from 'axios';
import { MosiaConfig, APIResponse, ErrorResponse } from '../types';
import { DEFAULT_CONFIG } from '../config';

export default class APIClient {
    private client: AxiosInstance;
    private config: MosiaConfig;

    constructor(config: MosiaConfig) {
        this.config = config;
        this.client = axios.create({
            baseURL: config.baseURL,
            headers: {
                'Authorization': `${DEFAULT_CONFIG.AUTH.TOKEN_PREFIX} ${config.apiKey}`,
                'Content-Type': DEFAULT_CONFIG.API.CONTENT_TYPE,
            },
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => this.handleError(error)
        );
    }

    private handleError(error: AxiosError): Promise<never> {
        const errorResponse: ErrorResponse = {
            message: error.message || DEFAULT_CONFIG.ERRORS.UNKNOWN_ERROR,
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status || DEFAULT_CONFIG.ERRORS.DEFAULT_STATUS_CODE,
        };
        return Promise.reject(errorResponse);
    }

    async GET<T>(path: string, params?: object): Promise<APIResponse<T>> {
        try {
            const res = await this.client.get(path, { params });

            return Promise.resolve(res.data);
        } catch (error) { 
            return Promise.reject(error);
        }
    }

    async POST<T>(path: string, data?: object): Promise<APIResponse<T>> {
        try {
            const res = await this.client.post(path, data);

            return Promise.resolve(res.data);
        } catch (error) { 
            return Promise.reject(error);
        }
    }
    
    async PUT<T>(path: string, data?: object): Promise<APIResponse<T>> {
        try {
            const res = await this.client.put(path, data);

            return Promise.resolve(res.data);
        } catch (error) { 
            return Promise.reject(error);
        }
    }

    async DELETE<T>(path: string, params?: object): Promise<APIResponse<T>> {
        try {
            const res = await this.client.delete(path, { params });

            return Promise.resolve(res.data);
        } catch (error) { 
            return Promise.reject(error);
        }
    }
}