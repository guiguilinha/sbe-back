"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class DiagnosticsService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'diagnostics';
    }
    async createDiagnostic(diagnosticData, token) {
        console.log('[DiagnosticsService] Criando novo diagnóstico:', {
            user_id: diagnosticData.user_id,
            company_id: diagnosticData.company_id
        });
        return this.create(diagnosticData, token);
    }
    async getUserDiagnostics(userId, token) {
        console.log('[DiagnosticsService] Buscando diagnósticos do usuário:', userId);
        return this.fetch({
            filter: { user_id: { _eq: userId } },
            sort: ['-performed_at'],
            token
        });
    }
    async getUserDiagnosticsWithDetails(userId, token) {
        console.log('[DiagnosticsService] Buscando diagnósticos completos do usuário:', userId);
        console.log('[DiagnosticsService] Token recebido:', token ? 'Presente' : 'Ausente');
        console.log('[DiagnosticsService] Token (primeiros 20 chars):', token ? token.substring(0, 20) + '...' : 'N/A');
        try {
            console.log('[DiagnosticsService] Executando query no Directus...');
            const diagnostics = await this.fetch({
                filter: { user_id: { _eq: userId } },
                sort: ['-performed_at'],
                token
            });
            console.log('[DiagnosticsService] Diagnósticos encontrados:', diagnostics.length);
            console.log('[DiagnosticsService] Primeiro diagnóstico:', diagnostics[0] || 'Nenhum');
            console.log('[DiagnosticsService] Buscando dados relacionados...');
            const diagnosticsWithDetails = await Promise.all(diagnostics.map(async (diagnostic) => {
                try {
                    console.log(`[DiagnosticsService] Processando diagnóstico ${diagnostic.id}...`);
                    const company = await this.getCompanyById(diagnostic.company_id, token);
                    const categories = await this.getDiagnosticCategories(diagnostic.id, token);
                    const categoriesWithAnswers = await Promise.all(categories.map(async (category) => {
                        const answers = await this.getCategoryAnswers(category.id, token);
                        return {
                            ...category,
                            respostas: answers
                        };
                    }));
                    return {
                        ...diagnostic,
                        company,
                        categorias: categoriesWithAnswers
                    };
                }
                catch (error) {
                    console.error(`[DiagnosticsService] Erro ao buscar detalhes do diagnóstico ${diagnostic.id}:`, error);
                    return {
                        ...diagnostic,
                        company: null,
                        categorias: []
                    };
                }
            }));
            console.log('[DiagnosticsService] Diagnósticos com detalhes processados:', diagnosticsWithDetails.length);
            return diagnosticsWithDetails;
        }
        catch (error) {
            console.error('[DiagnosticsService] Erro ao buscar diagnósticos:', error);
            console.error('[DiagnosticsService] Detalhes do erro:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            throw error;
        }
    }
    async getCompanyById(companyId, token) {
        console.log('[DiagnosticsService] Buscando dados da empresa:', companyId);
        try {
            const response = await this.makeRequest('items/companies', {
                method: 'GET',
                params: {
                    filter: { id: { _eq: companyId } },
                    fields: ['id', 'nome', 'cnpj', 'created_at', 'updated_at']
                },
                token
            });
            console.log('[DiagnosticsService] Resposta da empresa:', response);
            return response.data?.[0] || null;
        }
        catch (error) {
            console.error('[DiagnosticsService] Erro ao buscar empresa:', error);
            return null;
        }
    }
    async getDiagnosticCategories(diagnosticId, token) {
        console.log('[DiagnosticsService] Buscando categorias do diagnóstico:', diagnosticId);
        try {
            const response = await this.makeRequest('items/diagnostic_categories', {
                method: 'GET',
                params: {
                    filter: { diagnostic_id: { _eq: diagnosticId } },
                    fields: [
                        'id',
                        'diagnostic_id',
                        'category_id',
                        'level_id',
                        'score',
                        'insight',
                        'tip'
                    ]
                },
                token
            });
            console.log('[DiagnosticsService] Categorias encontradas:', response.data?.length || 0);
            return response.data || [];
        }
        catch (error) {
            console.error('[DiagnosticsService] Erro ao buscar categorias:', error);
            return [];
        }
    }
    async getCategoryAnswers(categoryId, token) {
        console.log('[DiagnosticsService] Buscando respostas da categoria:', categoryId);
        try {
            const response = await this.makeRequest('items/answers_given', {
                method: 'GET',
                params: {
                    filter: { diagnostic_category_id: { _eq: categoryId } },
                    fields: [
                        'id',
                        'diagnostic_category_id',
                        'question_id',
                        'answer_id',
                        'score'
                    ]
                },
                token
            });
            console.log('[DiagnosticsService] Respostas encontradas:', response.data?.length || 0);
            return response.data || [];
        }
        catch (error) {
            console.error('[DiagnosticsService] Erro ao buscar respostas:', error);
            return [];
        }
    }
    async getCompanyDiagnostics(companyId, token) {
        console.log('[DiagnosticsService] Buscando diagnósticos da empresa:', companyId);
        return this.fetch({
            filter: { company_id: { _eq: companyId } },
            sort: ['-performed_at'],
            token
        });
    }
    async getDiagnosticById(id, token) {
        console.log('[DiagnosticsService] Buscando diagnóstico por ID:', id);
        return this.getById(id, token);
    }
    async updateDiagnosticStatus(id, status, token) {
        console.log('[DiagnosticsService] Atualizando status do diagnóstico:', { id, status });
        return this.update(id, { status }, token);
    }
}
exports.DiagnosticsService = DiagnosticsService;
//# sourceMappingURL=diagnostics.service.js.map