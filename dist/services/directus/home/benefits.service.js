"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenefitsService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class BenefitsService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'home_benefits';
    }
    async getFullBenefits(previewToken) {
        console.log('[BenefitsService] getFullBenefits:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        const result = await this.fetchSectionWithExtras({
            cards: { endpoint: 'items/home_benefits_cards', sort: 'order' },
        }, {
            token: previewToken
        });
        return {
            section: result.section,
            cards: result.cards
        };
    }
}
exports.BenefitsService = BenefitsService;
//# sourceMappingURL=benefits.service.js.map