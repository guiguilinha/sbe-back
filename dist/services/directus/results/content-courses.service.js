"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentCoursesService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class ContentCoursesService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'courses';
    }
    async getAllCourses(previewToken) {
        try {
            console.log('🔍 ContentCoursesService - Buscando todos os cursos:', {
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
            console.log(`✅ ContentCoursesService - Encontrados ${allCourses.length} cursos`);
            return allCourses;
        }
        catch (error) {
            console.error('❌ Error in ContentCoursesService.getAllCourses:', error);
            return [];
        }
    }
}
exports.ContentCoursesService = ContentCoursesService;
//# sourceMappingURL=content-courses.service.js.map