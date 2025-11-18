// faq.service.ts
import { 
  FaqSection, 
  FaqItem, 
  FullFaqData 
} from '../../../contracts';
import { DirectusBaseService } from '../base/directus-base.service';

export class FaqService extends DirectusBaseService {
  protected serviceName = 'home_faq';

  async getFullFaq(previewToken?: string): Promise<FullFaqData> {
    console.log('[FaqService] getFullFaq:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });

    const result = await this.fetchSectionWithExtras<FaqSection, FaqItem>({
      items: { endpoint: 'items/home_faq_questions', sort: 'order' }
    }, {
      token: previewToken
    });

    return {
      section: result.section,
      items: result.items
    };
  }
}