import { QuizQuestion } from '../../../contracts';
import { DirectusBaseService } from '../base/directus-base.service';

export class QuestionsService extends DirectusBaseService {
  protected serviceName = 'quiz_questions';
  
  async getQuestions(previewToken?: string): Promise<QuizQuestion[]> {
    console.log('[QuestionsService] getQuestions:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });

    if (previewToken) {
      return this.fetchWithPreview(previewToken);
    } else {
      return this.fetch();
    }
  }
}
