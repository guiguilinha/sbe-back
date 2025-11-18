import { EmpresaData } from '../contracts/enriched-user.types';
export declare class CpeBackendService {
    private baseUrl;
    private timeout;
    constructor();
    private loadConfig;
    getEmpresaData(cpf: string, serviceToken: string): Promise<EmpresaData | null>;
    private validateEmpresaData;
    getRawEmpresaData(cpf: string, serviceToken: string): Promise<any>;
    isConfigured(): boolean;
    getConfigInfo(): {
        baseUrl: string;
        timeout: number;
        configured: boolean;
    };
}
export declare function getCpeBackendService(): CpeBackendService;
//# sourceMappingURL=cpe-backend.service.d.ts.map