"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTAService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class CTAService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'cta';
    }
    async getCTAs(previewToken) {
        console.log('[CTAService] getCTAs:', {
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
exports.CTAService = CTAService;
//# sourceMappingURL=cta.service.js.map