import { DirectusBaseService } from '../base/directus-base.service';
import { Category } from '../../../contracts/general/general.types';

export class CategoriesService extends DirectusBaseService<Category> {
  protected serviceName = 'categories';
  protected endpoint = '/items/categories';

  async getCategories(previewToken?: string): Promise<Category[]> {
    console.log('[CategoriesService] getCategories:', {
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
