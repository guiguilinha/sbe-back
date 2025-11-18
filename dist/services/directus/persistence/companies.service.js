"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class CompaniesService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'companies';
    }
    async createCompany(companyData, token) {
        console.log('[CompaniesService] Criando nova empresa:', { cnpj: companyData.cnpj });
        return this.create(companyData, token);
    }
    async getCompanyByCnpj(cnpj, token) {
        console.log('[CompaniesService] Buscando empresa por CNPJ:', cnpj);
        const companies = await this.fetch({
            filter: { cnpj: { _eq: cnpj } },
            limit: 1,
            token
        });
        return companies[0] || null;
    }
    async updateCompany(id, companyData, token) {
        console.log('[CompaniesService] Atualizando empresa:', id);
        return this.update(id, companyData, token);
    }
    async getCompanyById(id, token) {
        console.log('[CompaniesService] Buscando empresa por ID:', id);
        return this.getById(id, token);
    }
    async findOrCreateCompany(companyData, token) {
        console.log('[CompaniesService] Verificando existência da empresa...');
        const existingCompany = await this.getCompanyByCnpj(companyData.cnpj, token);
        if (existingCompany) {
            console.log('[CompaniesService] Empresa já existe, retornando existente');
            return existingCompany;
        }
        console.log('[CompaniesService] Empresa não existe, criando nova');
        return this.createCompany(companyData, token);
    }
}
exports.CompaniesService = CompaniesService;
//# sourceMappingURL=companies.service.js.map