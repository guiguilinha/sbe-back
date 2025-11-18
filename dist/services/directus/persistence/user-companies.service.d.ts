import { DirectusBaseService } from '../base/directus-base.service';
import { UserCompany } from '../../../contracts/persistence/persistence.types';
export declare class UserCompaniesService extends DirectusBaseService<UserCompany> {
    protected serviceName: string;
    linkUserToCompany(userId: number, companyId: number, linkData: {
        is_principal: boolean;
        cod_status_empresa: string;
        des_tipo_vinculo: string;
    }, token?: string): Promise<UserCompany>;
    getUserCompanyLink(userId: number, companyId: number, token?: string): Promise<UserCompany | null>;
    getUserCompanies(userId: number, token?: string): Promise<UserCompany[]>;
    getCompanyUsers(companyId: number, token?: string): Promise<UserCompany[]>;
    unlinkUserFromCompany(userId: number, companyId: number, token?: string): Promise<void>;
}
//# sourceMappingURL=user-companies.service.d.ts.map