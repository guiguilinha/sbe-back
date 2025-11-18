"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsCoursesService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class ResultsCoursesService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'courses';
    }
    async getCategoryCourses(categoryId, levelId, previewToken) {
        try {
            console.log('[ResultsCoursesService] getCategoryCourses:', {
                categoryId,
                levelId,
                hasPreviewToken: !!previewToken,
                previewTokenLength: previewToken?.length || 0
            });
            let allCourses;
            if (previewToken) {
                allCourses = await this.fetchWithPreview(previewToken, {
                    fields: ['*', 'levels.level_id.*', 'categories.category_id.*']
                });
            }
            else {
                allCourses = await this.fetch({
                    fields: ['*', 'levels.level_id.*', 'categories.category_id.*']
                });
            }
            const filteredCourses = allCourses.filter(course => {
                const hasCategory = course.categories?.some(cat => cat.category_id?.id === categoryId);
                const hasLevel = course.levels?.some(level => level.level_id?.id === levelId);
                return hasCategory && hasLevel;
            });
            return filteredCourses.slice(0, 4);
        }
        catch (error) {
            console.error('❌ Error in getCategoryCourses:', error);
            return [];
        }
    }
}
exports.ResultsCoursesService = ResultsCoursesService;
//# sourceMappingURL=results-courses.service.js.map