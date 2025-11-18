"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FooterService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class FooterService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'home_footer';
    }
    async getFullFooter(previewToken) {
        console.log('[FooterService] getFullFooter:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        const result = await this.fetchSectionWithExtras({
            menu: { endpoint: 'items/home_footer_menu', sort: 'order' },
            phone: { endpoint: 'items/home_footer_phone' },
            social: { endpoint: 'items/home_footer_social' }
        }, {
            token: previewToken
        });
        return {
            section: result.section,
            menu: result.menu,
            phone: result.phone,
            social: result.social
        };
    }
}
exports.FooterService = FooterService;
//# sourceMappingURL=footer.service.js.map