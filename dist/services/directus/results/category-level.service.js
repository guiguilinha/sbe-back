"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryLevelsRangeService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
const levels_service_1 = require("../general/levels.service");
class CategoryLevelsRangeService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'category_levels_range';
    }
    async getLevelForCategory(categoryId, score, previewToken) {
        console.log(`🔍 CategoryLevelsRangeService - Buscando categoria ${categoryId} com pontuação ${score}:`, {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        try {
            let ranges;
            if (previewToken) {
                ranges = await this.fetchWithPreview(previewToken, {
                    filter: {
                        min_score: { _lte: score },
                        max_score: { _gte: score }
                    },
                    limit: 1
                });
            }
            else {
                ranges = await this.fetch({
                    filter: {
                        min_score: { _lte: score },
                        max_score: { _gte: score }
                    },
                    limit: 1
                });
            }
            console.log(`🔍 CategoryLevelsRangeService - Resultado da busca:`, ranges);
            if (ranges.length > 0) {
                const match = ranges[0];
                const levelsService = new levels_service_1.LevelsService();
                const levels = await levelsService.getLevels(previewToken);
                const level = levels.find((l) => l.id === match.level_id);
                if (level) {
                    return {
                        id: level.id,
                        title: level.title
                    };
                }
            }
            return null;
        }
        catch (error) {
            console.error(`❌ CategoryLevelsRangeService - Erro:`, error);
            throw error;
        }
    }
}
exports.CategoryLevelsRangeService = CategoryLevelsRangeService;
//# sourceMappingURL=category-level.service.js.map