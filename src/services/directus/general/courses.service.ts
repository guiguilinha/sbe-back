import { DirectusBaseService } from '../base/directus-base.service';
import { Course } from '../../../contracts/general/general.types';

export class CoursesService extends DirectusBaseService<Course> {
  protected serviceName = 'courses';

  async getCourses(previewToken?: string): Promise<Course[]> {
    console.log('[CoursesService] getCourses:', {
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