"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResultsService = void 0;
const results_text_service_1 = require("./results-text.service");
const results_hero_service_1 = require("./results-hero.service");
const results_level_insights_service_1 = require("./results-level-insights.service");
const results_categories_service_1 = require("./results-categories.service");
const categories_service_1 = require("../general/categories.service");
const courses_service_1 = require("../general/courses.service");
const cta_service_1 = require("../general/cta.service");
const mg_region_service_1 = require("../general/mg-region.service");
const category_levels_insights_service_1 = require("./category_levels-insights.service");
const results_courses_service_1 = require("./results-courses.service");
const content_courses_service_1 = require("./content-courses.service");
const results_trail_service_1 = require("./results-trail.service");
class UserResultsService {
    static async getUserResults(calculatedResult, previewToken) {
        console.log('[UserResultsService] getUserResults:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0,
            calculatedResultLevel: calculatedResult.general_level.title
        });
        const resultsTextService = new results_text_service_1.ResultsTextService();
        const resultsHeroService = new results_hero_service_1.ResultsHeroService();
        const resultsLevelInsightsService = new results_level_insights_service_1.ResultsLevelInsightsService();
        const resultsCategoriesService = new results_categories_service_1.ResultsCategoriesService();
        const categoriesService = new categories_service_1.CategoriesService();
        const coursesService = new courses_service_1.CoursesService();
        const mgRegionService = new mg_region_service_1.MGRegionService();
        const categoryLevelsInsightsService = new category_levels_insights_service_1.CategoryLevelsInsightsService();
        const resultsCoursesService = new results_courses_service_1.ResultsCoursesService();
        const contentCoursesService = new content_courses_service_1.ContentCoursesService();
        const ctaService = new cta_service_1.CTAService();
        const resultsTrailService = new results_trail_service_1.ResultsTrailService();
        try {
            const resultsText = await resultsTextService.getResultsText(previewToken);
            const heroInsight = await resultsHeroService.getRandomHeroInsight(calculatedResult.general_level.id, previewToken);
            const levelInsight = await resultsLevelInsightsService.getLevelInsight(calculatedResult.general_level.id, previewToken);
            const categories = await categoriesService.getCategories(previewToken);
            console.log('🔍 UserResultsService - Buscando trail para level_id:', calculatedResult.general_level.id, 'title:', calculatedResult.general_level.title);
            let trail = await resultsTrailService.getTrailByLevelId(calculatedResult.general_level.id, previewToken);
            console.log('🔍 UserResultsService - Trail encontrado:', trail);
            if (!trail) {
                console.log('🔍 UserResultsService - Trail não encontrado, buscando primeiro disponível...');
                const allTrails = await resultsTrailService.getAllTrails(previewToken);
                console.log('🔍 UserResultsService - Todos os trails:', allTrails);
                trail = allTrails[0] || null;
                console.log('🔍 UserResultsService - Usando trail fallback:', trail);
            }
            const ctas = await ctaService.getCTAs(previewToken);
            const resultsCTA = ctas.find(cta => cta.page === 'results') || ctas[0];
            const allCourses = await contentCoursesService.getAllCourses(previewToken);
            console.log('🔍 UserResultsService - Cursos encontrados:', allCourses.length);
            if (allCourses.length > 0) {
                console.log('🔍 UserResultsService - Primeiro curso:', JSON.stringify(allCourses[0], null, 2));
            }
            const mgRegions = await mgRegionService.getMGRegions(previewToken);
            const categoryItems = [];
            for (const category of calculatedResult.categories) {
                const categoryData = categories.find(c => c.id === category.category_id);
                const categorySummary = await resultsCategoriesService.getRandomCategorySummary(category.category_id, category.level.id, previewToken);
                const categoryInsight = await categoryLevelsInsightsService.getCategoryInsight(category.category_id, category.level.id, previewToken);
                const categoryCourses = await resultsCoursesService.getCategoryCourses(category.category_id, category.level.id, previewToken);
                categoryItems.push({
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
                });
            }
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
                    "content-courses": allCourses.map(course => {
                        console.log('🔍 UserResultsService - Mapeando curso:', course.title);
                        console.log('🔍 UserResultsService - Levels:', course.levels);
                        console.log('🔍 UserResultsService - Categories:', course.categories);
                        return {
                            "content-course-title": course.title,
                            "content-course-description": course.description,
                            "content-course-image": course.image || '',
                            "content-course-image_alt": course.image_alt || '',
                            "content-course-link": course.url,
                            "content-course-levels": course.levels?.map(l => l.level_id.title) || [],
                            "content-course-categories": course.categories?.map(c => c.category_id.title) || []
                        };
                    })
                },
                "map-section": {
                    "map-title": resultsText?.region_title || "",
                    "map-content": resultsText?.region_content || "",
                    "map-region": mgRegions.flatMap(region => region.phones.map(phone => ({
                        "map-region-title": region.region.title,
                        "map-region-city-title": region.city,
                        "map-region-phone-number": phone
                    })))
                }
            };
        }
        catch (error) {
            console.error('❌ UserResultsService - Erro:', error);
            throw error;
        }
    }
}
exports.UserResultsService = UserResultsService;
//# sourceMappingURL=user-results.service.js.map