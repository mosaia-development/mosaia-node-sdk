import { Apps } from './apis';
import { MosiaConfig } from './types';

class Mosaia {
    private config: MosiaConfig;
    
    constructor(config: MosiaConfig) {
        const baseURL = `${config.baseURL || 'https://api.mosaia.ai'}/v${config.version || 1}`;

        this.config  = {
            ...config,
            baseURL,
        };
    }

    get apps() {
        return new Apps(this.config);
    }
}

// Export types
export * from './types';
// Export APIs
export * from './apis';

// Export default SDK
export default Mosaia;