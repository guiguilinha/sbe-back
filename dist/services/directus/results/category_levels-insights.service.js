"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryLevelsInsightsService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class CategoryLevelsInsightsService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'category_levels_insights';
    }
    async getCategoryInsight(categoryId, levelId, previewToken) {
        try {
            console.log('[CategoryLevelsInsightsService] getCategoryInsight:', {
                categoryId,
                levelId,
                hasPreviewToken: !!previewToken,
                previewTokenLength: previewToken?.length || 0
            });
            let insights;
            if (previewToken) {
                insights = await this.fetchWithPreview(previewToken, {
                    filter: {
                        category_id: { _eq: categoryId },
                        level_id: { _eq: levelId }
                    },
                    limit: 1
                });
            }
            else {
                insights = await this.fetch({
                    filter: {
                        category_id: { _eq: categoryId },
                        level_id: { _eq: levelId }
                    },
                    limit: 1
                });
            }
            const [insight] = insights;
            return insight || null;
        }
        catch (error) {
            console.error('❌ Error in getCategoryInsight:', error);
            return null;
        }
    }
}
exports.CategoryLevelsInsightsService = CategoryLevelsInsightsService;
//# sourceMappingURL=category_levels-insights.service.js.map