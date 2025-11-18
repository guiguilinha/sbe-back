import { DirectusBaseService } from '../base/directus-base.service';
import { Course } from '../../../contracts/general/general.types';

export class ResultsCoursesService extends DirectusBaseService<Course> {
    protected serviceName = 'courses';

  async getCategoryCourses(categoryId: number, levelId: number, previewToken?: string): Promise<Course[]> {
    try {
      console.log('[ResultsCoursesService] getCategoryCourses:', {
        categoryId,
        levelId,
        hasPreviewToken: !!previewToken,
        previewTokenLength: previewToken?.length || 0
      });

      // Buscar todos os cursos primeiro
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
      
      // Filtrar manualmente
      const filteredCourses = allCourses.filter(course => {
        const hasCategory = course.categories?.some(cat => cat.category_id?.id === categoryId);
        const hasLevel = course.levels?.some(level => level.level_id?.id === levelId);
        return hasCategory && hasLevel;
      });
      
      return filteredCourses.slice(0, 4); // Limitar a 4 cursos
    } catch (error) {
      console.error('❌ Error in getCategoryCourses:', error);
      return [];
    }
  }
}