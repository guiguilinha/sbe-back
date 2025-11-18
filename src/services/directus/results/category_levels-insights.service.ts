import { DirectusBaseService } from '../base/directus-base.service';
import { CategoryLevelsInsights } from '../../../contracts/results/results-categories.types';

export class CategoryLevelsInsightsService extends DirectusBaseService<CategoryLevelsInsights> {
    protected serviceName = 'category_levels_insights';

    async getCategoryInsight(categoryId: number, levelId: number, previewToken?: string): Promise<CategoryLevelsInsights | null> {
        try {
          console.log('[CategoryLevelsInsightsService] getCategoryInsight:', {
            categoryId,
            levelId,
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
          });

          let insights;
          if (previewToken) {
            insights = await this.fetchWithPreview(previewToken, {
              filter: { 
                category_id: { _eq: categoryId },
                level_id: { _eq: levelId }
              },
              limit: 1
            });
          } else {
            insights = await this.fetch({
              filter: { 
                category_id: { _eq: categoryId },
                level_id: { _eq: levelId }
              },
              limit: 1
            });
          }

          const [insight] = insights;
          return insight || null;
        } catch (error) {
          console.error('❌ Error in getCategoryInsight:', error);
          return null;
        }
    }
}