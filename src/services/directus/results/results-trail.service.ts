import { DirectusBaseService } from '../base/directus-base.service';
import { ResultsLevelsTrail } from '../../../contracts/results/results-level-trail.types';

export class ResultsTrailService extends DirectusBaseService<ResultsLevelsTrail> {
  protected serviceName = 'Maturity_Levels_Trails';

  async getAllTrails(previewToken?: string): Promise<ResultsLevelsTrail[]> {
    try {
      if (previewToken) {
        return await this.fetchWithPreview(previewToken);
      } else {
        return await this.fetch();
      }
    } catch (error) {
      console.error('❌ Error in getAllTrails:', error);
      return [];
    }
  }

  async getTrailByLevelId(levelId: number, previewToken?: string): Promise<ResultsLevelsTrail | null> {
    try {
      console.log('🔍 [ResultsTrailService] getTrailByLevelId:', {
        levelId,
        hasPreviewToken: !!previewToken,
        previewTokenLength: previewToken?.length || 0
      });

      // 🔍 DEBUG: Buscar TODOS os trails primeiro
      console.log('🔍 [ResultsTrailService] Buscando TODOS os trails para debug...');
      const allTrails = await this.fetch();
      console.log('🔍 [ResultsTrailService] Todos os trails encontrados:', allTrails);

      // 🔍 DEBUG: Verificar se existe trail para este level_id
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
      } else {
        const [result] = await this.fetch({
          filter: {
            level_id: { _eq: levelId }
          },
          limit: 1
        });
        console.log('🔍 [ResultsTrailService] Resultado sem preview token:', result);
        return result || null;
      }
    } catch (error) {
      console.error('❌ Error in getTrailByLevelId:', error);
      return null;
    }
  }
}