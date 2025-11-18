"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsTextService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class ResultsTextService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'results_text';
    }
    async getResultsText(previewToken) {
        try {
            console.log('[ResultsTextService] getResultsText:', {
                hasPreviewToken: !!previewToken,
                previewTokenLength: previewToken?.length || 0
            });
            if (previewToken) {
                const response = await this.makeRequestWithPreview('items/results_text', previewToken, {
                    params: { fields: '*' }
                });
                return response.data;
            }
            else {
                const response = await this.makeRequest('items/results_text?fields=*');
                return response.data;
            }
        }
        catch (error) {
            console.error('❌ Error in getResultsText:', error);
            return null;
        }
    }
}
exports.ResultsTextService = ResultsTextService;
//# sourceMappingURL=results-text.service.js.map