"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswersService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class AnswersService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'quiz_answers';
    }
    async getAnswers(previewToken) {
        console.log('[AnswersService] getAnswers:', {
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
exports.AnswersService = AnswersService;
//# sourceMappingURL=answers.service.js.map