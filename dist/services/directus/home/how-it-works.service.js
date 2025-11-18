"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HowItWorksService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class HowItWorksService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'home_how_it_works';
    }
    async getFullHowItWorks(previewToken) {
        console.log('[HowItWorksService] getFullHowItWorks:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        const result = await this.fetchSectionWithExtras({
            cards: { endpoint: 'items/home_how_it_works_card', sort: 'order' }
        }, {
            token: previewToken
        });
        return {
            section: result.section,
            cards: result.cards
        };
    }
}
exports.HowItWorksService = HowItWorksService;
//# sourceMappingURL=how-it-works.service.js.map