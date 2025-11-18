"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const directus_base_service_1 = require("../directus/base/directus-base.service");
class CompaniesService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'user_companies';
        this.endpoint = '/items/user_companies';
    }
    async getUserCompanies(userId) {
        try {
            const response = await this.fetch({
                filter: { user_id: { _eq: userId } },
                sort: ['-is_principal', 'created_at'],
                fields: ['*', 'company_id.*']
            });
            return response;
        }
        catch (error) {
            console.error('[CompaniesService] Erro ao buscar empresas:', error);
            return [];
        }
    }
    async getUserPrincipalCompany(userId) {
        console.log('[CompaniesService] Buscando empresa principal do usuário:', userId);
        try {
            const response = await this.fetch({
                filter: {
                    user_id: { _eq: userId },
                    is_principal: { _eq: true }
                },
                limit: 1
            });
            const company = response[0] || null;
            console.log('[CompaniesService] Empresa principal encontrada:', !!company);
            return company;
        }
        catch (error) {
            console.error('[CompaniesService] Erro ao buscar empresa principal:', error);
            return null;
        }
    }
    async createRealCompany(userId, companyData) {
        console.log('[CompaniesService] Criando empresa real:', { userId, ...companyData });
        try {
            const normalizedCnpj = companyData.cnpj.replace(/[^\d]/g, '');
            console.log('[CompaniesService] CNPJ original:', companyData.cnpj);
            console.log('[CompaniesService] CNPJ normalizado:', normalizedCnpj);
            const company = {
                cnpj: normalizedCnpj,
                nome: companyData.nome
            };
            const createdCompany = await this.makeRequest('items/companies', {
                method: 'POST',
                data: company
            });
            console.log('[CompaniesService] Empresa criada na collection companies:', createdCompany.data.id);
            const userCompanyData = {
                user_id: userId,
                company_id: createdCompany.data.id,
                is_principal: true,
                cod_status_empresa: 'REVISAR',
                des_tipo_vinculo: 'NÃO VINCULADO'
            };
            const userCompany = await this.makeRequest('items/user_companies', {
                method: 'POST',
                data: userCompanyData
            });
            console.log('[CompaniesService] Relacionamento criado na collection user_companies:', userCompany.data.id);
            return createdCompany.data;
        }
        catch (error) {
            console.error('[CompaniesService] Erro ao criar empresa real:', error);
            throw error;
        }
    }
    async createFictitiousCompany(userId, userCpf, userName) {
        console.log('[CompaniesService] Criando empresa fictícia:', { userId, userCpf, userName });
        const fictitiousCnpj = `00000${userCpf}`;
        try {
            const companyData = {
                cnpj: fictitiousCnpj,
                nome: userName
            };
            console.log('[CompaniesService] Dados da empresa a ser criada:', companyData);
            const createdCompany = await this.makeRequest('items/companies', {
                method: 'POST',
                data: companyData
            });
            console.log('[CompaniesService] Empresa criada na collection companies:', createdCompany.data.id);
            const userCompanyData = {
                user_id: userId,
                company_id: createdCompany.data.id,
                is_principal: true,
                cod_status_empresa: 'FICTICIO',
                des_tipo_vinculo: 'NÃO VINCULADO'
            };
            console.log('[CompaniesService] Dados do relacionamento a ser criado:', userCompanyData);
            const userCompany = await this.makeRequest('items/user_companies', {
                method: 'POST',
                data: userCompanyData
            });
            console.log('[CompaniesService] Relacionamento criado na collection user_companies:', userCompany.data.id);
            return createdCompany.data;
        }
        catch (error) {
            console.error('[CompaniesService] Erro ao criar empresa fictícia:', error);
            console.error('[CompaniesService] Detalhes do erro:', {
                message: error instanceof Error ? error.message : 'Erro desconhecido',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }
    async hasUserCompanies(userId) {
        console.log('[CompaniesService] Verificando se usuário tem empresas:', userId);
        try {
            const response = await this.fetch({
                filter: { user_id: { _eq: userId } },
                limit: 1
            });
            const hasCompanies = response.length > 0;
            console.log('[CompaniesService] Usuário tem empresas:', hasCompanies);
            return hasCompanies;
        }
        catch (error) {
            console.error('[CompaniesService] Erro ao verificar empresas:', error);
            return false;
        }
    }
    async setPrincipalCompany(userId, companyId) {
        console.log('[CompaniesService] Definindo empresa como principal:', { userId, companyId });
        try {
            const companies = await this.getUserCompanies(userId);
            console.log('[CompaniesService] Empresas do usuário:', companies.map(c => ({
                user_companies_id: c.id,
                companies_id: c.company_id.id,
                nome: c.company_id.nome
            })));
            for (const company of companies) {
                if (company.is_principal) {
                    console.log('[CompaniesService] Removendo is_principal de:', company.id);
                    await this.makeRequest(`items/user_companies/${company.id}`, {
                        method: 'PATCH',
                        data: { is_principal: false }
                    });
                }
            }
            const targetCompany = companies.find(c => c.company_id.id === companyId);
            if (!targetCompany) {
                console.error('[CompaniesService] Empresa não encontrada:', {
                    userId,
                    companyId,
                    availableCompanies: companies.map(c => ({
                        user_companies_id: c.id,
                        companies_id: c.company_id.id,
                        nome: c.company_id.nome
                    }))
                });
                throw new Error(`Empresa não encontrada para o usuário. Company ID: ${companyId}`);
            }
            console.log('[CompaniesService] Definindo empresa como principal:', {
                user_companies_id: targetCompany.id,
                companies_id: targetCompany.company_id.id,
                nome: targetCompany.company_id.nome
            });
            await this.makeRequest(`items/user_companies/${targetCompany.id}`, {
                method: 'PATCH',
                data: { is_principal: true }
            });
            console.log('[CompaniesService] Empresa definida como principal com sucesso');
        }
        catch (error) {
            console.error('[CompaniesService] Erro ao definir empresa principal:', error);
            throw error;
        }
    }
}
exports.CompaniesService = CompaniesService;
//# sourceMappingURL=companies.service.js.map