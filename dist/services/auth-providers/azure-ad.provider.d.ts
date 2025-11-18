import { AuthProvider } from '../auth.service';
export declare class AzureADAuthProvider implements AuthProvider {
    name: string;
    private config;
    constructor();
    isConfigured(): boolean;
    getConfig(): Record<string, any>;
    validateConfig(): {
        isValid: boolean;
        errors: string[];
    };
    getStatus(): {
        status: string;
        provider: string;
        isValid: boolean;
        errors?: string[];
    };
}
//# sourceMappingURL=azure-ad.provider.d.ts.map