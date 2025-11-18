"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class HeroService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'home_hero';
    }
    async getHero(previewToken) {
        console.log('[HeroService] getHero:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        if (previewToken) {
            const response = await this.makeRequestWithPreview('items/home_hero', previewToken, {
                params: { fields: '*' }
            });
            return response.data;
        }
        else {
            const response = await this.makeRequest('items/home_hero', {
                params: { fields: '*' }
            });
            return response.data;
        }
    }
}
exports.HeroService = HeroService;
//# sourceMappingURL=hero.service.js.map