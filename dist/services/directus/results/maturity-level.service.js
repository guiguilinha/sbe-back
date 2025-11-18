"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaturityLevelsRangeService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
const levels_service_1 = require("../general/levels.service");
class MaturityLevelsRangeService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'maturity_levels_range';
    }
    async getLevelByScore(score, previewToken) {
        console.log(`🔍 MaturityLevelsRangeService - Buscando nível para pontuação ${score}:`, {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        try {
            let match;
            if (previewToken) {
                const [result] = await this.fetchWithPreview(previewToken, {
                    filter: {
                        min_score: { _lte: score },
                        max_score: { _gte: score }
                    },
                    limit: 1
                });
                match = result;
            }
            else {
                const [result] = await this.fetch({
                    filter: {
                        min_score: { _lte: score },
                        max_score: { _gte: score }
                    },
                    limit: 1
                });
                match = result;
            }
            console.log(`🔍 MaturityLevelsRangeService - Resultado da busca:`, match);
            if (match?.level_id) {
                const levelsService = new levels_service_1.LevelsService();
                const levels = await levelsService.getLevels(previewToken);
                const level = levels.find((l) => l.id === match?.level_id);
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
            console.error(`❌ MaturityLevelsRangeService - Erro:`, error);
            throw error;
        }
    }
}
exports.MaturityLevelsRangeService = MaturityLevelsRangeService;
//# sourceMappingURL=maturity-level.service.js.map