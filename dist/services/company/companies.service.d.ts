import { DirectusBaseService } from '../directus/base/directus-base.service';
import { Company } from '../../contracts/persistence/persistence.types';
interface UserCompanyWithDetails {
    id: number;
    user_id: number;
    company_id: Company;
    is_principal: boolean;
    cod_status_empresa: string;
    des_tipo_vinculo: string;
}
export declare class CompaniesService extends DirectusBaseService<Company> {
    protected serviceName: string;
    protected endpoint: string;
    getUserCompanies(userId: number): Promise<UserCompanyWithDetails[]>;
    getUserPrincipalCompany(userId: number): Promise<Company | null>;
    createRealCompany(userId: number, companyData: {
        cnpj: string;
        nome: string;
    }): Promise<Company>;
    createFictitiousCompany(userId: number, userCpf: string, userName: string): Promise<Company>;
    hasUserCompanies(userId: number): Promise<boolean>;
    setPrincipalCompany(userId: number, companyId: number): Promise<void>;
}
export {};
//# sourceMappingURL=companies.service.d.ts.map