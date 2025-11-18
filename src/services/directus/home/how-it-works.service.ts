// how-it-works.service.ts
import { DirectusBaseService } from '../base/directus-base.service';
import { HowItWorksSection, HowItWorksCard, FullHowItWorksData } from '../../../contracts';

export class HowItWorksService extends DirectusBaseService {
  protected serviceName = 'home_how_it_works';

  async getFullHowItWorks(previewToken?: string): Promise<FullHowItWorksData> {
    console.log('[HowItWorksService] getFullHowItWorks:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });

    const result = await this.fetchSectionWithExtras<HowItWorksSection, HowItWorksCard>({
      cards: { endpoint: 'items/home_how_it_works_card', sort: 'order' }
    }, {
      token: previewToken
    });

    return {
      section: result.section,
      cards: result.cards
    };
  }
}