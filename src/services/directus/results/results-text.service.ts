import { DirectusBaseService } from '../base/directus-base.service';
import { ResultsText } from '../../../contracts/results/results-text.types';

export class ResultsTextService extends DirectusBaseService<ResultsText> {
  protected serviceName = 'results_text';

  async getResultsText(previewToken?: string): Promise<ResultsText | null> {
    try {
      console.log('[ResultsTextService] getResultsText:', {
        hasPreviewToken: !!previewToken,
        previewTokenLength: previewToken?.length || 0
      });

      if (previewToken) {
        const response = await this.makeRequestWithPreview<ResultsText>('items/results_text', previewToken, {
          params: { fields: '*' }
        });
        return response.data;
      } else {
        const response = await this.makeRequest<ResultsText>('items/results_text?fields=*');
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error in getResultsText:', error);
      return null;
    }
  }
}