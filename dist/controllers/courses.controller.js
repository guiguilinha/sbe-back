"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesController = void 0;
const content_courses_service_1 = require("../services/directus/results/content-courses.service");
class CoursesController {
    static async getAllCourses(req, res) {
        try {
            const contentCoursesService = new content_courses_service_1.ContentCoursesService();
            const courses = await contentCoursesService.getAllCourses();
            console.log('🔍 CoursesController - Cursos encontrados:', courses.length);
            if (courses.length > 0) {
                console.log('🔍 CoursesController - Primeiro curso:', JSON.stringify(courses[0], null, 2));
            }
            res.json({
                success: true,
                data: courses
            });
        }
        catch (error) {
            console.error('❌ CoursesController - Erro:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao buscar cursos'
            });
        }
    }
}
exports.CoursesController = CoursesController;
//# sourceMappingURL=courses.controller.js.map