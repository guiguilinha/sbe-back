import { DirectusBaseService } from '../base/directus-base.service';
import { Course } from '../../../contracts/general/general.types';

export class ContentCoursesService extends DirectusBaseService<Course> {
  protected serviceName = 'courses';

  async getAllCourses(previewToken?: string): Promise<Course[]> {
    try {
      console.log('🔍 ContentCoursesService - Buscando todos os cursos:', {
        hasPreviewToken: !!previewToken,
        previewTokenLength: previewToken?.length || 0
      });
      
      // Buscar todos os cursos com relacionamentos
      let allCourses;
      if (previewToken) {
        allCourses = await this.fetchWithPreview(previewToken, {
          fields: ['*', 'levels.level_id.*', 'categories.category_id.*']
        });
      } else {
        allCourses = await this.fetch({
          fields: ['*', 'levels.level_id.*', 'categories.category_id.*']
        });
      }
      
      console.log(`✅ ContentCoursesService - Encontrados ${allCourses.length} cursos`);
      
      return allCourses;
    } catch (error) {
      console.error('❌ Error in ContentCoursesService.getAllCourses:', error);
      return [];
    }
  }
} 