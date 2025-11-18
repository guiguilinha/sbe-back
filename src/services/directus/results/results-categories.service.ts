import { DirectusBaseService } from '../base/directus-base.service';
import { ResultsCategoryDetailsSummary } from '../../../contracts/results/results-categories.types';

export class ResultsCategoriesService extends DirectusBaseService<ResultsCategoryDetailsSummary> {
  protected serviceName = 'results_category_details_summary';

  async getRandomCategorySummary(categoryId: number, levelId: number, previewToken?: string): Promise<ResultsCategoryDetailsSummary | null> {
    try {
      console.log('[ResultsCategoriesService] getRandomCategorySummary:', {
        categoryId,
        levelId,
        hasPreviewToken: !!previewToken,
        previewTokenLength: previewToken?.length || 0
      });

      let allSummaries;
      if (previewToken) {
        allSummaries = await this.fetchWithPreview(previewToken, {
          filter: { 
            category_id: { _eq: categoryId },
            level_id: { _eq: levelId }
          }
        });
      } else {
        allSummaries = await this.fetch({
          filter: { 
            category_id: { _eq: categoryId },
            level_id: { _eq: levelId }
          }
        });
      }
      
      if (allSummaries.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * allSummaries.length);
      return allSummaries[randomIndex];
    } catch (error) {
      console.error('❌ Error in getRandomCategorySummary:', error);
      return null;
    }
  }
}