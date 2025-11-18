import { Request, Response } from 'express';
import { ContentCoursesService } from '../services/directus/results/content-courses.service';

export class CoursesController {
  static async getAllCourses(req: Request, res: Response) {
    try {
      const contentCoursesService = new ContentCoursesService();
      const courses = await contentCoursesService.getAllCourses();
      
      console.log('🔍 CoursesController - Cursos encontrados:', courses.length);
      if (courses.length > 0) {
        console.log('🔍 CoursesController - Primeiro curso:', JSON.stringify(courses[0], null, 2));
      }
      
      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('❌ CoursesController - Erro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar cursos'
      });
    }
  }
} 