export interface AuthProvider {
    name: string;
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
export declare class KeycloakAuthProvider implements AuthProvider {
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
export declare class LocalAuthProvider implements AuthProvider {
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
export declare class AuthService {
    private static instance;
    private providers;
    private currentProvider;
    private constructor();
    static getInstance(): AuthService;
    private registerProvider;
    private setDefaultProvider;
    getCurrentProvider(): AuthProvider | null;
    getProvider(name: string): AuthProvider | null;
    getAllProviders(): AuthProvider[];
    getConfig(): Record<string, any> | null;
    getStatus(): {
        status: string;
        provider: string;
        isValid: boolean;
        errors?: string[];
    };
    validateConfig(): {
        isValid: boolean;
        errors: string[];
    };
    switchProvider(providerName: string): boolean;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map