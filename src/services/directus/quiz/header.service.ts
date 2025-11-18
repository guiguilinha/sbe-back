import { QuizHeader } from '../../../contracts';
import { DirectusBaseService } from '../base/directus-base.service';

export class QuizHeaderService extends DirectusBaseService {
  protected serviceName = 'quiz_header';
  
  async getQuizHeader(previewToken?: string): Promise<QuizHeader | null> {
    try {
      console.log('[QuizHeaderService] getQuizHeader:', {
        hasPreviewToken: !!previewToken,
        previewTokenLength: previewToken?.length || 0
      });

      if (previewToken) {
        const response = await this.makeRequestWithPreview<QuizHeader>('items/quiz_header', previewToken, {
          params: { fields: '*' }
        });
        return response.data;
      } else {
        const response = await this.makeRequest<QuizHeader>('items/quiz_header?fields=*');
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error in getQuizHeader:', error);
      return null;
    }
  }
}
