"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizHeaderService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class QuizHeaderService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'quiz_header';
    }
    async getQuizHeader(previewToken) {
        try {
            console.log('[QuizHeaderService] getQuizHeader:', {
                hasPreviewToken: !!previewToken,
                previewTokenLength: previewToken?.length || 0
            });
            if (previewToken) {
                const response = await this.makeRequestWithPreview('items/quiz_header', previewToken, {
                    params: { fields: '*' }
                });
                return response.data;
            }
            else {
                const response = await this.makeRequest('items/quiz_header?fields=*');
                return response.data;
            }
        }
        catch (error) {
            console.error('❌ Error in getQuizHeader:', error);
            return null;
        }
    }
}
exports.QuizHeaderService = QuizHeaderService;
//# sourceMappingURL=header.service.js.map