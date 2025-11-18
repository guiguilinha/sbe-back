"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsLevelInsightsService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class ResultsLevelInsightsService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'maturity_levels_insights';
    }
    async getLevelInsight(levelId, previewToken) {
        try {
            console.log('[ResultsLevelInsightsService] getLevelInsight:', {
                levelId,
                hasPreviewToken: !!previewToken,
                previewTokenLength: previewToken?.length || 0
            });
            let insights;
            if (previewToken) {
                insights = await this.fetchWithPreview(previewToken, {
                    filter: { level_id: { _eq: levelId } },
                    limit: 1
                });
            }
            else {
                insights = await this.fetch({
                    filter: { level_id: { _eq: levelId } },
                    limit: 1
                });
            }
            const [insight] = insights;
            return insight || null;
        }
        catch (error) {
            console.error('❌ Error in getLevelInsight:', error);
            return null;
        }
    }
}
exports.ResultsLevelInsightsService = ResultsLevelInsightsService;
//# sourceMappingURL=results-level-insights.service.js.map