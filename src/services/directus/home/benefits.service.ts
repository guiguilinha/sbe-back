// benefits.service.ts
import { DirectusBaseService } from '../base/directus-base.service';
import { BenefitsSection, BenefitCard, FullBenefitsData } from '../../../contracts';

export class BenefitsService extends DirectusBaseService {
  protected serviceName = 'home_benefits';

  async getFullBenefits(previewToken?: string): Promise<FullBenefitsData> {
    console.log('[BenefitsService] getFullBenefits:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });

    const result = await this.fetchSectionWithExtras<BenefitsSection, BenefitCard>({
      cards: { endpoint: 'items/home_benefits_cards', sort: 'order' },
    }, {
      token: previewToken
    });

    return {
      section: result.section,
      cards: result.cards
    };
  }
}
