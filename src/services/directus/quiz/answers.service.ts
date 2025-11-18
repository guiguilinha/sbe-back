import { QuizAnswer } from '../../../contracts';
import { DirectusBaseService } from '../base/directus-base.service';

export class AnswersService extends DirectusBaseService {
  protected serviceName = 'quiz_answers';
  
  async getAnswers(previewToken?: string): Promise<QuizAnswer[]> {
    console.log('[AnswersService] getAnswers:', {
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
