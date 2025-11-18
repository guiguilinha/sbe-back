import { MaturityLevelsRange } from '../../../contracts/results/maturity-level-range.types';
import { DirectusBaseService } from '../base/directus-base.service';
import { LevelsService } from '../general/levels.service';
import { Levels } from '../../../contracts/general/general.types';

export class MaturityLevelsRangeService extends DirectusBaseService<MaturityLevelsRange> {
  protected serviceName = 'maturity_levels_range';

  async getLevelByScore(score: number, previewToken?: string): Promise<{ id: number; title: string;} | null> {
    console.log(`🔍 MaturityLevelsRangeService - Buscando nível para pontuação ${score}:`, {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });
    
    try {
      let match: MaturityLevelsRange | undefined;
      if (previewToken) {
        const [result] = await this.fetchWithPreview(previewToken, {
          filter: {
            min_score: { _lte: score },
            max_score: { _gte: score }
          },
          limit: 1
        });
        match = result;
      } else {
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

      // Se encontrou uma faixa, buscar o nível correspondente
      if (match?.level_id) {
        // Buscar o nível no serviço de níveis
        const levelsService = new LevelsService();
        const levels: Levels[] = await levelsService.getLevels(previewToken);
        const level = levels.find((l: Levels) => l.id === match?.level_id);
        
        if (level) {
          return {
            id: level.id,
            title: level.title
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ MaturityLevelsRangeService - Erro:`, error);
      throw error;
    }
  }
}
