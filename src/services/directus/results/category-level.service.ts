import { CategoryLevelsRangeWithLevel } from '../../../contracts/results/category-level-range.types';
import { DirectusBaseService } from '../base/directus-base.service';
import { LevelsService } from '../general/levels.service';
import { Levels } from '../../../contracts/general/general.types';

export class CategoryLevelsRangeService extends DirectusBaseService {
  protected serviceName = 'category_levels_range';

  async getLevelForCategory(categoryId: number, score: number, previewToken?: string): Promise<{ id: number; title: string;} | null> {
    console.log(`🔍 CategoryLevelsRangeService - Buscando categoria ${categoryId} com pontuação ${score}:`, {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });
    
    try {
      let ranges;
      if (previewToken) {
        ranges = await this.fetchWithPreview(previewToken, {
          filter: {
            // category_id não existe na collection - tabela genérica para todas as categorias
            min_score: { _lte: score },
            max_score: { _gte: score }
          },
          limit: 1
        });
      } else {
        ranges = await this.fetch({
          filter: {
            // category_id não existe na collection - tabela genérica para todas as categorias
            min_score: { _lte: score },
            max_score: { _gte: score }
          },
          limit: 1
        });
      }
      
      console.log(`🔍 CategoryLevelsRangeService - Resultado da busca:`, ranges);
      
      // Se encontrou uma faixa, buscar o nível correspondente
      if (ranges.length > 0) {
        const match = ranges[0];
        // Buscar o nível no serviço de níveis
        const levelsService = new LevelsService();
        const levels: Levels[] = await levelsService.getLevels(previewToken);
        const level = levels.find((l: Levels) => l.id === match.level_id);
        
        if (level) {
          return {
            id: level.id,
            title: level.title
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error(`❌ CategoryLevelsRangeService - Erro:`, error);
      throw error;
    }
  }
}
