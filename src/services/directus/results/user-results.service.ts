import { ResultsTextService } from './results-text.service';
import { ResultsHeroService } from './results-hero.service';
import { ResultsLevelInsightsService } from './results-level-insights.service';
import { ResultsCategoriesService } from './results-categories.service';
import { CategoriesService } from '../general/categories.service';
import { CoursesService } from '../general/courses.service';
import { CTAService } from '../general/cta.service';
import { MGRegionService } from '../general/mg-region.service';
import { UserResultsData } from '../../../contracts/results/user-results.types';
import { CalculatedResult } from '../../../contracts/results/calculated-result.types';
import { CategoryLevelsInsightsService } from './category_levels-insights.service';
import { ResultsCoursesService } from './results-courses.service';
import { ContentCoursesService } from './content-courses.service';
import { ResultsTrailService } from './results-trail.service';

export class UserResultsService {
  static async getUserResults(calculatedResult: CalculatedResult, previewToken?: string): Promise<UserResultsData> {

    const resultsTextService = new ResultsTextService();
    const resultsHeroService = new ResultsHeroService();
    const resultsLevelInsightsService = new ResultsLevelInsightsService();
    const resultsCategoriesService = new ResultsCategoriesService();
    const categoriesService = new CategoriesService();
    const coursesService = new CoursesService();
    const mgRegionService = new MGRegionService();
    const categoryLevelsInsightsService = new CategoryLevelsInsightsService();
    const resultsCoursesService = new ResultsCoursesService();
    const contentCoursesService = new ContentCoursesService();
    const ctaService = new CTAService();
    const resultsTrailService = new ResultsTrailService();

    try {
      // Buscar dados básicos em paralelo (grupo 1)
      const [resultsText, heroInsight, levelInsight, categories] = await Promise.all([
        resultsTextService.getResultsText(previewToken),
        resultsHeroService.getRandomHeroInsight(calculatedResult.general_level.id, previewToken),
        resultsLevelInsightsService.getLevelInsight(calculatedResult.general_level.id, previewToken),
        categoriesService.getCategories(previewToken)
      ]);
      
      // Buscar trail do nível
      let trail = await resultsTrailService.getTrailByLevelId(calculatedResult.general_level.id, previewToken);
      
      // Fallback - Se não encontrar, buscar o primeiro trail disponível
      if (!trail) {
        const allTrails = await resultsTrailService.getAllTrails(previewToken);
        trail = allTrails[0] || null;
      }
      
      // Buscar dados adicionais em paralelo (grupo 2)
      const [ctas, allCourses, mgRegions] = await Promise.all([
        ctaService.getCTAs(previewToken),
        contentCoursesService.getAllCourses(previewToken),
        mgRegionService.getMGRegions(previewToken)
      ]);
      
      const resultsCTA = ctas.find(cta => cta.page === 'results') || ctas[0];

      // Processar dados por categoria em paralelo
      const categoryItems = await Promise.all(
        calculatedResult.categories.map(async (category) => {
          const categoryData = categories.find(c => c.id === category.category_id);
          
          // Buscar dados da categoria em paralelo
          const [categorySummary, categoryInsight, categoryCourses] = await Promise.all([
            resultsCategoriesService.getRandomCategorySummary(
              category.category_id, 
              category.level.id,
              previewToken
            ),
            categoryLevelsInsightsService.getCategoryInsight(
              category.category_id, 
              category.level.id,
              previewToken
            ),
            resultsCoursesService.getCategoryCourses(
              category.category_id, 
              category.level.id,
              previewToken
            )
          ]);

          return {
            "category-item-title": categoryData?.title || `Categoria ${category.category_id}`,
            "category-item-level": category.level.title,
            "category-item-score": category.score.toString(),
            "category-item-percent": Math.round((category.score / 12) * 100).toString(),
            "category-item-advice": categoryInsight?.description || '',
            "category-item-insight": categorySummary?.title || '',
            "category-item-recomendations": categoryCourses.map(course => ({
              "content-course-title": course.title,
              "content-course-description": course.description,
              "content-course-image": course.image || '',
              "content-course-image_alt": course.image_alt || '',
              "content-course-link": course.url,
              "content-course-levels": course.levels?.map(l => l.level_id.title) || [],
              "content-course-categories": course.categories?.map(c => c.category_id.title) || []
            }))
          };
        })
      );

      // Montar estrutura final
      return {
        "hero-section": {
          "hero-start": resultsText?.hero_start || '',
          "hero-content": resultsText?.hero_content || '',
          "hero-general-level": calculatedResult.general_level.title,
          "hero-insight": heroInsight?.description || '',
          "hero-icon": resultsText?.hero_icon || '',
          "hero-score-text": resultsText?.hero_score_text || '',
          "hero-score": calculatedResult.total_score.toString(),
          "hero-percent": Math.round((calculatedResult.total_score / 60) * 100).toString(),
          "hero-image": levelInsight?.image || ''
        },
        "advice-section": {
          "advice-title": resultsText?.insight_title || '',
          "advice-general-level": calculatedResult.general_level.title,
          "advice-content": levelInsight?.description || ''
        },
        "category-section": {
          "category-title": resultsText?.category_title || "Análise por Categoria",
          "category-itens": categoryItems
        },
        "cta-section": {
          "cta-title": resultsCTA?.title || "",
          "cta-content": resultsCTA?.description || "",
          "cta-button-text": resultsCTA?.label_button || "",
          "cta-general-level": calculatedResult.general_level.title,
          "trail-link": trail?.link_trilha || ""
        },
        "conclusion-section": {
          "conclusion-title": resultsText?.conclusion_title || "",
          "conclusion-positive-feedback": resultsText?.conclusion_positive_feedback || "",
          "conclusion-attention-feeback": resultsText?.conclusion_attention_feedback || "",
          "conclusion-advice": resultsText?.conclusion_advice || ""
        },
        "content-section": {
          "content-title": resultsText?.content_title || "",
          "content-text": resultsText?.content_description || "",
          "content-general-level": calculatedResult.general_level.title,
          "content-courses": allCourses.map(course => ({
            "content-course-title": course.title,
            "content-course-description": course.description,
            "content-course-image": course.image || '',
            "content-course-image_alt": course.image_alt || '',
            "content-course-link": course.url,
            "content-course-levels": course.levels?.map(l => l.level_id.title) || [],
            "content-course-categories": course.categories?.map(c => c.category_id.title) || []
          }))
        },
        "map-section": {
          "map-title": resultsText?.region_title || "",
          "map-content": resultsText?.region_content || "",
          "map-region": mgRegions.flatMap(region => 
            region.phones.map(phone => ({
              "map-region-title": region.region.title,
              "map-region-city-title": region.city,
              "map-region-phone-number": phone
            }))
          )
        }
      };
    } catch (error) {
      console.error('❌ UserResultsService - Erro:', error);
      throw error;
    }
  }
}