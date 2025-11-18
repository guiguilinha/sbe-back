"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaturityLevelsService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class MaturityLevelsService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'home_maturity_explanation';
    }
    async getFullMaturityLevels(previewToken) {
        console.log('[MaturityLevelsService] getFullMaturityLevels:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        const result = await this.fetchSectionWithExtras({
            cards: { endpoint: 'items/home_maturity_explanation_cards', sort: 'order' }
        }, {
            token: previewToken
        });
        return {
            section: result.section,
            cards: result.cards
        };
    }
}
exports.MaturityLevelsService = MaturityLevelsService;
//# sourceMappingURL=maturity-levels.service.js.map