"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsCategoriesService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class ResultsCategoriesService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'results_category_details_summary';
    }
    async getRandomCategorySummary(categoryId, levelId, previewToken) {
        try {
            console.log('[ResultsCategoriesService] getRandomCategorySummary:', {
                categoryId,
                levelId,
                hasPreviewToken: !!previewToken,
                previewTokenLength: previewToken?.length || 0
            });
            let allSummaries;
            if (previewToken) {
                allSummaries = await this.fetchWithPreview(previewToken, {
                    filter: {
                        category_id: { _eq: categoryId },
                        level_id: { _eq: levelId }
                    }
                });
            }
            else {
                allSummaries = await this.fetch({
                    filter: {
                        category_id: { _eq: categoryId },
                        level_id: { _eq: levelId }
                    }
                });
            }
            if (allSummaries.length === 0)
                return null;
            const randomIndex = Math.floor(Math.random() * allSummaries.length);
            return allSummaries[randomIndex];
        }
        catch (error) {
            console.error('❌ Error in getRandomCategorySummary:', error);
            return null;
        }
    }
}
exports.ResultsCategoriesService = ResultsCategoriesService;
//# sourceMappingURL=results-categories.service.js.map