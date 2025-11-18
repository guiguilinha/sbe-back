import { DirectusBaseService } from '../base/directus-base.service';
import { Levels } from '../../../contracts/general/general.types';

export class LevelsService extends DirectusBaseService<Levels> {
  protected serviceName = 'levels';
  protected endpoint = '/items/levels';

  async getLevels(previewToken?: string): Promise<Levels[]> {
    console.log('[LevelsService] getLevels:', {
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
