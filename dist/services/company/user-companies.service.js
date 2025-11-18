"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCompaniesService = void 0;
const directus_base_service_1 = require("../directus/base/directus-base.service");
class UserCompaniesService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'user_companies';
        this.endpoint = '/items/user_companies';
    }
    async getUserCompanyRelations(userId) {
        console.log('[UserCompaniesService] Buscando relacionamentos do usuário:', userId);
        try {
            const response = await this.fetch({
                filter: { user_id: { _eq: userId } },
                sort: ['-is_principal', 'created_at']
            });
            console.log('[UserCompaniesService] Relacionamentos encontrados:', response.length);
            return response;
        }
        catch (error) {
            console.error('[UserCompaniesService] Erro ao buscar relacionamentos:', error);
            return [];
        }
    }
    async createUserCompanyRelation(userId, companyId, isPrincipal = false) {
        console.log('[UserCompaniesService] Criando relacionamento:', { userId, companyId, isPrincipal });
        const relation = {
            user_id: userId,
            company_id: companyId,
            is_principal: isPrincipal
        };
        try {
            const createdRelation = await this.create(relation);
            console.log('[UserCompaniesService] Relacionamento criado:', createdRelation.id);
            return createdRelation;
        }
        catch (error) {
            console.error('[UserCompaniesService] Erro ao criar relacionamento:', error);
            throw error;
        }
    }
    async hasUserCompanyRelations(userId) {
        console.log('[UserCompaniesService] Verificando relacionamentos do usuário:', userId);
        try {
            const relations = await this.getUserCompanyRelations(userId);
            const hasRelations = relations.length > 0;
            console.log('[UserCompaniesService] Usuário tem relacionamentos:', hasRelations);
            return hasRelations;
        }
        catch (error) {
            console.error('[UserCompaniesService] Erro ao verificar relacionamentos:', error);
            return false;
        }
    }
}
exports.UserCompaniesService = UserCompaniesService;
//# sourceMappingURL=user-companies.service.js.map