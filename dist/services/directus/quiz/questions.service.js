"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class QuestionsService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'quiz_questions';
    }
    async getQuestions(previewToken) {
        console.log('[QuestionsService] getQuestions:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        if (previewToken) {
            return this.fetchWithPreview(previewToken);
        }
        else {
            return this.fetch();
        }
    }
}
exports.QuestionsService = QuestionsService;
//# sourceMappingURL=questions.service.js.map