import { DirectusBaseService } from '../base/directus-base.service';
import { Company } from '../../../contracts/persistence/persistence.types';
export declare class CompaniesService extends DirectusBaseService<Company> {
    protected serviceName: string;
    createCompany(companyData: {
        cnpj: string;
        nome: string;
    }, token?: string): Promise<Company>;
    getCompanyByCnpj(cnpj: string, token?: string): Promise<Company | null>;
    updateCompany(id: number, companyData: Partial<Company>, token?: string): Promise<Company>;
    getCompanyById(id: number, token?: string): Promise<Company>;
    findOrCreateCompany(companyData: {
        cnpj: string;
        nome: string;
    }, token?: string): Promise<Company>;
}
//# sourceMappingURL=companies.service.d.ts.map