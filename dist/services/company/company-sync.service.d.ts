export interface CompanySyncResult {
    hasCompanies: boolean;
    companies: any[];
    companiesCount: number;
    source: 'cpe' | 'directus' | 'both' | 'none';
    action: 'USE_EXISTING' | 'SELECT_COMPANY' | 'CREATE_COMPANY' | 'USE_SINGLE_COMPANY';
    syncPerformed: boolean;
}
export declare class CompanySyncService {
    private cpeBackendService;
    private companiesService;
    private usersService;
    private userCompaniesService;
    syncUserCompanies(cpf: string, userId: number): Promise<CompanySyncResult>;
    private fetchCpeCompanies;
    private fetchDirectusCompanies;
    private performSync;
    private compareCompanyData;
    private updateCompanyInDirectus;
    private createCompanyFromCpe;
    private determineSource;
    private determineAction;
    private normalizeCnpj;
}
//# sourceMappingURL=company-sync.service.d.ts.map