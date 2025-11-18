"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCompaniesService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class UserCompaniesService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'user_companies';
    }
    async linkUserToCompany(userId, companyId, linkData, token) {
        console.log('[UserCompaniesService] Vinculando usuário à empresa:', { userId, companyId });
        const existing = await this.getUserCompanyLink(userId, companyId, token);
        if (existing) {
            console.log('[UserCompaniesService] Vínculo já existe, retornando existente');
            return existing;
        }
        return this.create({
            user_id: userId,
            company_id: companyId,
            ...linkData
        }, token);
    }
    async getUserCompanyLink(userId, companyId, token) {
        const links = await this.fetch({
            filter: {
                user_id: { _eq: userId },
                company_id: { _eq: companyId }
            },
            limit: 1,
            token
        });
        return links[0] || null;
    }
    async getUserCompanies(userId, token) {
        console.log('[UserCompaniesService] Buscando empresas do usuário:', userId);
        return this.fetch({
            filter: { user_id: { _eq: userId } },
            token
        });
    }
    async getCompanyUsers(companyId, token) {
        console.log('[UserCompaniesService] Buscando usuários da empresa:', companyId);
        return this.fetch({
            filter: { company_id: { _eq: companyId } },
            token
        });
    }
    async unlinkUserFromCompany(userId, companyId, token) {
        console.log('[UserCompaniesService] Desvinculando usuário da empresa:', { userId, companyId });
        const link = await this.getUserCompanyLink(userId, companyId, token);
        if (link) {
            await this.delete(link.id, token);
        }
    }
}
exports.UserCompaniesService = UserCompaniesService;
//# sourceMappingURL=user-companies.service.js.map