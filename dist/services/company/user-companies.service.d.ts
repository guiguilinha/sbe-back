import { DirectusBaseService } from '../directus/base/directus-base.service';
import { UserCompany } from '../../contracts/persistence/persistence.types';
export declare class UserCompaniesService extends DirectusBaseService<UserCompany> {
    protected serviceName: string;
    protected endpoint: string;
    getUserCompanyRelations(userId: number): Promise<UserCompany[]>;
    createUserCompanyRelation(userId: number, companyId: number, isPrincipal?: boolean): Promise<UserCompany>;
    hasUserCompanyRelations(userId: number): Promise<boolean>;
}
//# sourceMappingURL=user-companies.service.d.ts.map