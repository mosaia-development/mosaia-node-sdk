import APIClient from './api-client';
import { MosiaConfig, WalletInterface, MeterInterface, GetWalletsPayload, GetWalletPayload, GetMetersPayload, GetMeterPayload, APIResponse } from '../types';

export default class Billing {
    private client: APIClient;

    constructor(config: MosiaConfig) {
        this.client = new APIClient(config);
    }

    // Wallet operations
    async getWallets(params?: {
        limit?: number;
        offset?: number;
        org?: string;
        user?: string;
    }): Promise<APIResponse<GetWalletsPayload>> {
        return this.client.GET<GetWalletsPayload>('/billing/wallet', params);
    }

    async getWallet(id: string): Promise<APIResponse<GetWalletPayload>> {
        return this.client.GET<GetWalletPayload>(`/billing/wallet/${id}`);
    }

    async createWallet(wallet: Omit<WalletInterface, 'id'>): Promise<APIResponse<GetWalletPayload>> {
        return this.client.POST<GetWalletPayload>('/billing/wallet', wallet);
    }

    async updateWallet(id: string, wallet: Partial<WalletInterface>): Promise<APIResponse<GetWalletPayload>> {
        return this.client.PUT<GetWalletPayload>(`/billing/wallet/${id}`, wallet);
    }

    async deleteWallet(id: string): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/billing/wallet/${id}`);
    }

    // Meter operations
    async getMeters(params?: {
        limit?: number;
        offset?: number;
        org?: string;
        user?: string;
        type?: string;
    }): Promise<APIResponse<GetMetersPayload>> {
        return this.client.GET<GetMetersPayload>('/billing/meter', params);
    }

    async getMeter(id: string): Promise<APIResponse<GetMeterPayload>> {
        return this.client.GET<GetMeterPayload>(`/billing/meter/${id}`);
    }

    async createMeter(meter: Omit<MeterInterface, 'id'>): Promise<APIResponse<GetMeterPayload>> {
        return this.client.POST<GetMeterPayload>('/billing/meter', meter);
    }

    async updateMeter(id: string, meter: Partial<MeterInterface>): Promise<APIResponse<GetMeterPayload>> {
        return this.client.PUT<GetMeterPayload>(`/billing/meter/${id}`, meter);
    }

    async deleteMeter(id: string): Promise<APIResponse<void>> {
        return this.client.DELETE<void>(`/billing/meter/${id}`);
    }
} 