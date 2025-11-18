import { DirectusBaseService } from '../base/directus-base.service';
import { ResultsHeroInsights } from '../../../contracts/results/results-hero.types';

export class ResultsHeroService extends DirectusBaseService<ResultsHeroInsights> {
  protected serviceName = 'results_hero_insights';

  async getRandomHeroInsight(levelId: number, previewToken?: string): Promise<ResultsHeroInsights | null> {
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
      } else {
        allInsights = await this.fetch({
          filter: { level_id: { _eq: levelId } }
        });
      }
      
      if (allInsights.length === 0) return null;
      
      // Selecionar aleatoriamente
      const randomIndex = Math.floor(Math.random() * allInsights.length);
      return allInsights[randomIndex];
    } catch (error) {
      console.error('❌ Error in getRandomHeroInsight:', error);
      return null;
    }
  }
}