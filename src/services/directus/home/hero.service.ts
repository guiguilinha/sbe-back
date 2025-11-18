// hero.service.ts
import { DirectusBaseService } from '../base/directus-base.service';
import { HeroData } from '../../../contracts';

export class HeroService extends DirectusBaseService {
  protected serviceName = 'home_hero';

  async getHero(previewToken?: string): Promise<HeroData> {
    console.log('[HeroService] getHero:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });

    if (previewToken) {
      // Usar o novo método para preview token
      const response = await this.makeRequestWithPreview<HeroData>('items/home_hero', previewToken, {
        params: { fields: '*' }
      });
      return response.data;
    } else {
      // Usar o método normal
      const response = await this.makeRequest<HeroData>('items/home_hero', {
        params: { fields: '*' }
      });
      return response.data;
    }
  }
}