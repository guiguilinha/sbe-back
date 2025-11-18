// maturity-levels.service.ts
import { DirectusBaseService } from '../base/directus-base.service';
import { MaturityLevelSection, MaturityExplanationCard, FullMaturityData } from '../../../contracts';

export class MaturityLevelsService extends DirectusBaseService {
  protected serviceName = 'home_maturity_explanation';

  async getFullMaturityLevels(previewToken?: string): Promise<FullMaturityData> {
    console.log('[MaturityLevelsService] getFullMaturityLevels:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });

    const result = await this.fetchSectionWithExtras<MaturityLevelSection, MaturityExplanationCard>({
      cards: { endpoint: 'items/home_maturity_explanation_cards', sort: 'order' }
    }, {
      token: previewToken
    });

    return {
      section: result.section,
      cards: result.cards
    };
  }
}