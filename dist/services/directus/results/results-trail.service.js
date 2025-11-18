"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsTrailService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class ResultsTrailService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'Maturity_Levels_Trails';
    }
    async getAllTrails(previewToken) {
        try {
            if (previewToken) {
                return await this.fetchWithPreview(previewToken);
            }
            else {
                return await this.fetch();
            }
        }
        catch (error) {
            console.error('❌ Error in getAllTrails:', error);
            return [];
        }
    }
    async getTrailByLevelId(levelId, previewToken) {
        try {
            console.log('🔍 [ResultsTrailService] getTrailByLevelId:', {
                levelId,
                hasPreviewToken: !!previewToken,
                previewTokenLength: previewToken?.length || 0
            });
            console.log('🔍 [ResultsTrailService] Buscando TODOS os trails para debug...');
            const allTrails = await this.fetch();
            console.log('🔍 [ResultsTrailService] Todos os trails encontrados:', allTrails);
            const trailForLevel = allTrails.find(trail => trail.level_id === levelId);
            console.log('🔍 [ResultsTrailService] Trail encontrado para level_id', levelId, ':', trailForLevel);
            if (previewToken) {
                const [result] = await this.fetchWithPreview(previewToken, {
                    filter: {
                        level_id: { _eq: levelId }
                    },
                    limit: 1
                });
                console.log('🔍 [ResultsTrailService] Resultado com preview token:', result);
                return result || null;
            }
            else {
                const [result] = await this.fetch({
                    filter: {
                        level_id: { _eq: levelId }
                    },
                    limit: 1
                });
                console.log('🔍 [ResultsTrailService] Resultado sem preview token:', result);
                return result || null;
            }
        }
        catch (error) {
            console.error('❌ Error in getTrailByLevelId:', error);
            return null;
        }
    }
}
exports.ResultsTrailService = ResultsTrailService;
//# sourceMappingURL=results-trail.service.js.map