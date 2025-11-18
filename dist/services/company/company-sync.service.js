"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanySyncService = void 0;
const axios_1 = __importDefault(require("axios"));
const cpe_backend_service_1 = require("../cpe-backend.service");
const companies_service_1 = require("./companies.service");
const users_service_1 = require("../directus/persistence/users.service");
const user_companies_service_1 = require("../directus/persistence/user-companies.service");
const keycloak_validation_service_1 = require("../keycloak-validation.service");
class CompanySyncService {
    constructor() {
        this.cpeBackendService = new cpe_backend_service_1.CpeBackendService();
        this.companiesService = new companies_service_1.CompaniesService();
        this.usersService = new users_service_1.UsersService();
        this.userCompaniesService = new user_companies_service_1.UserCompaniesService();
    }
    async syncUserCompanies(cpf, userId) {
        try {
            const cpeCompanies = await this.fetchCpeCompanies(cpf);
            const directusCompanies = await this.fetchDirectusCompanies(userId);
            const syncResult = await this.performSync(userId, cpeCompanies, directusCompanies);
            const action = this.determineAction(syncResult.companies);
            const finalResult = {
                hasCompanies: syncResult.companies.length > 0,
                companies: syncResult.companies,
                companiesCount: syncResult.companies.length,
                source: this.determineSource(cpeCompanies, directusCompanies),
                action,
                syncPerformed: syncResult.syncPerformed
            };
            return finalResult;
        }
        catch (error) {
            console.error('❌ [CompanySync] Erro na sincronização:', error);
            throw error;
        }
    }
    async fetchCpeCompanies(cpf) {
        try {
            const keycloakService = (0, keycloak_validation_service_1.getKeycloakValidationService)();
            const serviceToken = await keycloakService.getServiceToken();
            if (!serviceToken) {
                return [];
            }
            const rawData = await this.cpeBackendService.getRawEmpresaData(cpf, serviceToken);
            if (!rawData || !Array.isArray(rawData)) {
                return [];
            }
            const normalizedCompanies = rawData.map((empresa) => ({
                cnpj: empresa.cnpj,
                nome: empresa.nome || 'Empresa',
                isPrincipal: empresa.isPrincipal || false,
                codStatusEmpresa: empresa.codStatusEmpresa || '',
                desTipoVinculo: empresa.desTipoVinculo || '',
                source: 'cpe',
                cpeData: empresa
            }));
            return normalizedCompanies;
        }
        catch (error) {
            console.error('❌ Erro ao buscar no CPE:', error);
            return [];
        }
    }
    async fetchDirectusCompanies(userId) {
        try {
            const companies = await this.companiesService.getUserCompanies(userId);
            const normalizedCompanies = companies.map(company => {
                const cnpj = company.company_id.cnpj;
                const nome = company.company_id.nome;
                return {
                    ...company,
                    cnpj,
                    nome,
                    source: 'directus'
                };
            });
            return normalizedCompanies;
        }
        catch (error) {
            console.error('❌ Erro ao buscar no Directus:', error);
            return [];
        }
    }
    async performSync(userId, cpeCompanies, directusCompanies) {
        let syncPerformed = false;
        let finalCompanies = [...directusCompanies];
        if (cpeCompanies.length > 0) {
            for (const cpeCompany of cpeCompanies) {
                const existingDirectus = directusCompanies.find(d => this.normalizeCnpj(d.company_id?.cnpj || d.cnpj) === this.normalizeCnpj(cpeCompany.cnpj));
                if (existingDirectus) {
                    const needsUpdate = this.compareCompanyData(cpeCompany, existingDirectus);
                    if (needsUpdate) {
                        await this.updateCompanyInDirectus(existingDirectus, cpeCompany);
                        syncPerformed = true;
                        const directusIndex = finalCompanies.findIndex(d => this.normalizeCnpj(d.company_id?.cnpj || d.cnpj) === this.normalizeCnpj(cpeCompany.cnpj));
                        if (directusIndex !== -1) {
                            finalCompanies[directusIndex] = {
                                ...finalCompanies[directusIndex],
                                is_principal: cpeCompany.isPrincipal || false,
                                cod_status_empresa: cpeCompany.codStatusEmpresa || '',
                                des_tipo_vinculo: cpeCompany.desTipoVinculo || ''
                            };
                        }
                    }
                }
                else {
                    const newCompany = await this.createCompanyFromCpe(userId, cpeCompany);
                    finalCompanies.push(newCompany);
                    syncPerformed = true;
                }
            }
        }
        return {
            companies: finalCompanies,
            syncPerformed
        };
    }
    compareCompanyData(cpeCompany, directusCompany) {
        const nomeChanged = cpeCompany.nome !== (directusCompany.company_id?.nome || directusCompany.nome);
        const principalChanged = cpeCompany.isPrincipal !== directusCompany.is_principal;
        const statusChanged = cpeCompany.codStatusEmpresa !== directusCompany.cod_status_empresa;
        const vinculoChanged = cpeCompany.desTipoVinculo !== directusCompany.des_tipo_vinculo;
        return nomeChanged || principalChanged || statusChanged || vinculoChanged;
    }
    async updateCompanyInDirectus(directusCompany, cpeCompany) {
        try {
            const companyId = directusCompany.company_id?.id || directusCompany.id;
            const companyName = directusCompany.company_id?.nome || directusCompany.nome;
            if (companyName !== cpeCompany.nome) {
                const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
                const directusToken = process.env.DIRECTUS_TOKEN;
                await axios_1.default.patch(`${directusUrl}/items/companies/${companyId}`, { nome: cpeCompany.nome }, { headers: { Authorization: `Bearer ${directusToken}` } });
            }
            const updateData = {
                is_principal: cpeCompany.isPrincipal || false,
                cod_status_empresa: cpeCompany.codStatusEmpresa || '',
                des_tipo_vinculo: cpeCompany.desTipoVinculo || ''
            };
            const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
            const directusToken = process.env.DIRECTUS_TOKEN;
            await axios_1.default.patch(`${directusUrl}/items/user_companies/${directusCompany.id}`, updateData, { headers: { Authorization: `Bearer ${directusToken}` } });
        }
        catch (error) {
            console.error('❌ Erro ao atualizar empresa:', error);
            throw error;
        }
    }
    async createCompanyFromCpe(userId, cpeCompany) {
        try {
            const companyData = {
                cnpj: this.normalizeCnpj(cpeCompany.cnpj),
                nome: cpeCompany.nome
            };
            const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
            const directusToken = process.env.DIRECTUS_TOKEN;
            const createdCompany = await axios_1.default.post(`${directusUrl}/items/companies`, companyData, { headers: { Authorization: `Bearer ${directusToken}` } });
            const userCompanyData = {
                user_id: userId,
                company_id: createdCompany.data.data.id,
                is_principal: cpeCompany.isPrincipal || false,
                cod_status_empresa: cpeCompany.codStatusEmpresa || '',
                des_tipo_vinculo: cpeCompany.desTipoVinculo || ''
            };
            const userCompany = await axios_1.default.post(`${directusUrl}/items/user_companies`, userCompanyData, { headers: { Authorization: `Bearer ${directusToken}` } });
            return {
                id: userCompany.data.data.id,
                user_id: userId,
                company_id: createdCompany.data.data.id,
                cnpj: createdCompany.data.data.cnpj,
                nome: createdCompany.data.data.nome,
                is_principal: userCompanyData.is_principal,
                cod_status_empresa: userCompanyData.cod_status_empresa,
                des_tipo_vinculo: userCompanyData.des_tipo_vinculo,
                source: 'cpe'
            };
        }
        catch (error) {
            console.error('❌ Erro ao criar empresa do CPE:', error);
            throw error;
        }
    }
    determineSource(cpeCompanies, directusCompanies) {
        const hasCpe = cpeCompanies.length > 0;
        const hasDirectus = directusCompanies.length > 0;
        if (hasCpe && hasDirectus)
            return 'both';
        if (hasCpe)
            return 'cpe';
        if (hasDirectus)
            return 'directus';
        return 'none';
    }
    determineAction(companies) {
        if (companies.length === 0) {
            return 'CREATE_COMPANY';
        }
        else if (companies.length === 1) {
            return 'USE_SINGLE_COMPANY';
        }
        else {
            return 'SELECT_COMPANY';
        }
    }
    normalizeCnpj(cnpj) {
        return cnpj ? cnpj.replace(/[^\d]/g, '') : '';
    }
}
exports.CompanySyncService = CompanySyncService;
//# sourceMappingURL=company-sync.service.js.map