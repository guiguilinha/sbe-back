"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticCategoriesService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class DiagnosticCategoriesService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'diagnostic_categories';
    }
    async createCategoryResult(categoryData, token) {
        console.log('[DiagnosticCategoriesService] Criando resultado de categoria:', {
            diagnostic_id: categoryData.diagnostic_id,
            category_id: categoryData.category_id
        });
        return this.create(categoryData, token);
    }
    async createCategoryResults(categoriesData, token) {
        console.log('[DiagnosticCategoriesService] Criando múltiplos resultados:', categoriesData.length);
        return this.createMany(categoriesData, token);
    }
    async getDiagnosticCategories(diagnosticId, token) {
        console.log('[DiagnosticCategoriesService] Buscando categorias do diagnóstico:', diagnosticId);
        return this.fetch({
            filter: { diagnostic_id: { _eq: diagnosticId } },
            token
        });
    }
}
exports.DiagnosticCategoriesService = DiagnosticCategoriesService;
//# sourceMappingURL=diagnostic-categories.service.js.map