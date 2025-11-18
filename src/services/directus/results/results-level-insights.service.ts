import { DirectusBaseService } from '../base/directus-base.service';
import { MaturityLevelsInsights } from '../../../contracts/results/results-level-insights.types';

export class ResultsLevelInsightsService extends DirectusBaseService<MaturityLevelsInsights> {
  protected serviceName = 'maturity_levels_insights';

  async getLevelInsight(levelId: number, previewToken?: string): Promise<MaturityLevelsInsights | null> {
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
      } else {
        insights = await this.fetch({
          filter: { level_id: { _eq: levelId } },
          limit: 1
        });
      }
      
      const [insight] = insights;
      return insight || null;
    } catch (error) {
      console.error('❌ Error in getLevelInsight:', error);
      return null;
    }
  }
}