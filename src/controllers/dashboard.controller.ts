import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { extractUserIdFromToken } from '../utils/user-extraction';
import { UnauthorizedError, NotFoundError } from '../utils/AppError';

export class DashboardController {
  /**
   * GET /api/dashboard
   * Retorna dados completos do dashboard
   * Requer autenticação via token Keycloak
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      const userId = await extractUserIdFromToken(req);
      const directusToken = process.env.DIRECTUS_TOKEN;
      const data = await DashboardService.getDashboardData(userId, directusToken);

      res.json(data);
    } catch (error) {
      DashboardController.handleError(res, error, 'Failed to load dashboard data');
    }
  }

  /**
   * GET /api/dashboard/evolution/general
   * Retorna dados de evolução geral
   */
  static async getEvolutionGeneral(req: Request, res: Response) {
    try {
      const userId = await extractUserIdFromToken(req);
      const directusToken = process.env.DIRECTUS_TOKEN;
      const data = await DashboardService.getEvolutionGeneralData(userId, directusToken);

      res.json(data);
    } catch (error) {
      DashboardController.handleError(res, error, 'Failed to load general evolution data');
    }
  }

  /**
   * GET /api/dashboard/evolution/categories
   * Retorna dados de evolução por categorias
   */
  static async getEvolutionCategories(req: Request, res: Response) {
    try {
      const userId = await extractUserIdFromToken(req);
      const directusToken = process.env.DIRECTUS_TOKEN;
      const data = await DashboardService.getEvolutionCategoriesData(userId, directusToken);

      res.json(data);
    } catch (error) {
      DashboardController.handleError(res, error, 'Failed to load categories evolution data');
    }
  }

  /**
   * GET /api/dashboard/performance/general
   * Retorna dados de performance geral
   */
  static async getPerformanceGeneral(req: Request, res: Response) {
    try {
      const userId = await extractUserIdFromToken(req);
      const directusToken = process.env.DIRECTUS_TOKEN;
      const data = await DashboardService.getPerformanceGeneralData(userId, directusToken);

      res.json(data);
    } catch (error) {
      DashboardController.handleError(res, error, 'Failed to load general performance data');
    }
  }

  /**
   * GET /api/dashboard/performance/category/:categoryId
   * Retorna dados de performance por categoria específica
   */
  static async getPerformanceCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const userId = await extractUserIdFromToken(req);
      const directusToken = process.env.DIRECTUS_TOKEN;
      const data = await DashboardService.getPerformanceCategoryData(categoryId, userId, directusToken);

      res.json(data);
    } catch (error) {
      DashboardController.handleError(res, error, 'Failed to load category performance data');
    }
  }

  /**
   * GET /api/dashboard/level-labels
   * Retorna apenas os levelLabels do sistema
   */
  static async getLevelLabels(req: Request, res: Response) {
    try {
      const userId = await extractUserIdFromToken(req);
      const directusToken = process.env.DIRECTUS_TOKEN;
      const data = await DashboardService.getDashboardData(userId, directusToken);
      const levelLabels = data.evolution?.levelLabels || [];

      res.json({ levelLabels });
    } catch (error) {
      DashboardController.handleError(res, error, 'Failed to load level labels');
    }
  }

  private static handleError(res: Response, error: any, defaultMessage: string) {
    console.error(`❌ Error: ${defaultMessage}`, error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
        error: error.name
      });
    }

    return res.status(500).json({
      message: defaultMessage,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}