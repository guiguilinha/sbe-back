"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class CoursesService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'courses';
    }
    async getCourses(previewToken) {
        console.log('[CoursesService] getCourses:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        if (previewToken) {
            return this.fetchWithPreview(previewToken);
        }
        else {
            return this.fetch();
        }
    }
}
exports.CoursesService = CoursesService;
//# sourceMappingURL=courses.service.js.map