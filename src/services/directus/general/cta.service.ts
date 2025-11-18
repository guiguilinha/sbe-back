// cta.service.ts
import { CTAItem } from '../../../contracts/general/cta.types';
import { DirectusBaseService } from '../base/directus-base.service';

export class CTAService extends DirectusBaseService {
  protected serviceName = 'cta';

  async getCTAs(previewToken?: string): Promise<CTAItem[]> {
    console.log('[CTAService] getCTAs:', {
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