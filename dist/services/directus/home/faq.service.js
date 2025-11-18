"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class FaqService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'home_faq';
    }
    async getFullFaq(previewToken) {
        console.log('[FaqService] getFullFaq:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        const result = await this.fetchSectionWithExtras({
            items: { endpoint: 'items/home_faq_questions', sort: 'order' }
        }, {
            token: previewToken
        });
        return {
            section: result.section,
            items: result.items
        };
    }
}
exports.FaqService = FaqService;
//# sourceMappingURL=faq.service.js.map