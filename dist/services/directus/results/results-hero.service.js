"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsHeroService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class ResultsHeroService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'results_hero_insights';
    }
    async getRandomHeroInsight(levelId, previewToken) {
        try {
            console.log('[ResultsHeroService] getRandomHeroInsight:', {
                levelId,
                hasPreviewToken: !!previewToken,
                previewTokenLength: previewToken?.length || 0
            });
            let allInsights;
            if (previewToken) {
                allInsights = await this.fetchWithPreview(previewToken, {
                    filter: { level_id: { _eq: levelId } }
                });
            }
            else {
                allInsights = await this.fetch({
                    filter: { level_id: { _eq: levelId } }
                });
            }
            if (allInsights.length === 0)
                return null;
            const randomIndex = Math.floor(Math.random() * allInsights.length);
            return allInsights[randomIndex];
        }
        catch (error) {
            console.error('❌ Error in getRandomHeroInsight:', error);
            return null;
        }
    }
}
exports.ResultsHeroService = ResultsHeroService;
//# sourceMappingURL=results-hero.service.js.map