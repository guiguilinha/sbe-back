"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class CategoriesService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'categories';
        this.endpoint = '/items/categories';
    }
    async getCategories(previewToken) {
        console.log('[CategoriesService] getCategories:', {
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
exports.CategoriesService = CategoriesService;
//# sourceMappingURL=categories.service.js.map