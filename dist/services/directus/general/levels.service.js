"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelsService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class LevelsService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'levels';
        this.endpoint = '/items/levels';
    }
    async getLevels(previewToken) {
        console.log('[LevelsService] getLevels:', {
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
exports.LevelsService = LevelsService;
//# sourceMappingURL=levels.service.js.map