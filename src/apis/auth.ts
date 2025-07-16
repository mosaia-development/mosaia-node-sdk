import APIClient from './api-client';
import { MosiaConfig, AuthRequest, AuthResponse, APIResponse } from '../types';

export default class Auth {
    private client: APIClient;

    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    /**
     * Sign in with password
     */
    async signInWithPassword(email: string, password: string, clientId: string): Promise<APIResponse<AuthResponse>> {
        const request: AuthRequest = {
            grant_type: 'password',
            email,
            password,
            client_id: clientId
        };
        return this.client.POST<AuthResponse>('/auth/signin', request);
    }

    /**
     * Sign in with client credentials
     */
    async signInWithClient(clientId: string, clientSecret: string): Promise<APIResponse<AuthResponse>> {
        const request: AuthRequest = {
            grant_type: 'client',
            client_id: clientId,
            client_secret: clientSecret
        };
        return this.client.POST<AuthResponse>('/auth/signin', request);
    }

    /**
     * Refresh token
     */
    async refreshToken(refreshToken: string): Promise<APIResponse<AuthResponse>> {
        const request: AuthRequest = {
            grant_type: 'refresh',
            refresh_token: refreshToken
        };
        return this.client.POST<AuthResponse>('/auth/signin', request);
    }

    /**
     * Sign out
     */
    async signOut(token?: string): Promise<APIResponse<void>> {
        if (token) {
            return this.client.DELETE<void>('/auth/signout', { token });
        }
        return this.client.DELETE<void>('/auth/signout');
    }

    /**
     * Get session info
     */
    async getSession(): Promise<APIResponse<any>> {
        return this.client.GET<any>('/session');
    }

    /**
     * Get self info
     */
    async getSelf(): Promise<APIResponse<any>> {
        return this.client.GET<any>('/self');
    }
} 