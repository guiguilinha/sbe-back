"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswersGivenService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class AnswersGivenService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'answers_given';
    }
    async saveAnswers(answersData, token) {
        console.log('[AnswersGivenService] Salvando respostas:', answersData.length);
        return this.createMany(answersData, token);
    }
    async getAnswersByDiagnosticCategory(diagnosticCategoryId, token) {
        console.log('[AnswersGivenService] Buscando respostas da categoria:', diagnosticCategoryId);
        return this.fetch({
            filter: { diagnostic_category_id: { _eq: diagnosticCategoryId } },
            token
        });
    }
    async getAnswersByDiagnostic(diagnosticId, token) {
        console.log('[AnswersGivenService] Buscando todas as respostas do diagnóstico:', diagnosticId);
        return [];
    }
}
exports.AnswersGivenService = AnswersGivenService;
//# sourceMappingURL=answers-given.service.js.map