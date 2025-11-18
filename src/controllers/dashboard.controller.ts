import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  /**
   * GET /api/dashboard
   * Retorna dados completos do dashboard
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      console.log('[DashboardController] getDashboard - Iniciando busca de dados completos');
      
      const data = await DashboardService.getDashboardData();
      
      console.log('[DashboardController] getDashboard - Dados encontrados:', {
        hasUser: !!data.user,
        hasCategories: !!data.categories,
        hasEvolution: !!data.evolution,
        categoriesCount: data.categories?.length || 0
      });
      
      res.json(data);
    } catch (error) {
      console.error('❌ Error in getDashboard:', error);
      res.status(500).json({ 
        message: 'Failed to load dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/dashboard/evolution/general
   * Retorna dados de evolução geral
   */
  static async getEvolutionGeneral(req: Request, res: Response) {
    try {
      console.log('[DashboardController] getEvolutionGeneral - Iniciando busca de evolução geral');
      
      const data = await DashboardService.getEvolutionGeneralData();
      
      console.log('[DashboardController] getEvolutionGeneral - Dados encontrados:', {
        hasData: !!data.data,
        dataLength: data.data?.length || 0,
        hasPerformance: !!data.performance
      });
      
      res.json(data);
    } catch (error) {
      console.error('❌ Error in getEvolutionGeneral:', error);
      res.status(500).json({ 
        message: 'Failed to load general evolution data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/dashboard/evolution/categories
   * Retorna dados de evolução por categorias
   */
  static async getEvolutionCategories(req: Request, res: Response) {
    try {
      console.log('[DashboardController] getEvolutionCategories - Iniciando busca de evolução por categorias');
      
      const data = await DashboardService.getEvolutionCategoriesData();
      
      console.log('[DashboardController] getEvolutionCategories - Dados encontrados:', {
        hasData: !!data.data,
        dataLength: data.data?.length || 0,
        hasPerformance: !!data.performance
      });
      
      res.json(data);
    } catch (error) {
      console.error('❌ Error in getEvolutionCategories:', error);
      res.status(500).json({ 
        message: 'Failed to load categories evolution data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/dashboard/performance/general
   * Retorna dados de performance geral
   */
  static async getPerformanceGeneral(req: Request, res: Response) {
    try {
      console.log('[DashboardController] getPerformanceGeneral - Iniciando busca de performance geral');
      
      const data = await DashboardService.getPerformanceGeneralData();
      
      console.log('[DashboardController] getPerformanceGeneral - Dados encontrados:', {
        percentage: data.percentage,
        trend: data.trend,
        period: data.period
      });
      
      res.json(data);
    } catch (error) {
      console.error('❌ Error in getPerformanceGeneral:', error);
      res.status(500).json({ 
        message: 'Failed to load general performance data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/dashboard/performance/category/:categoryId
   * Retorna dados de performance por categoria específica
   */
  static async getPerformanceCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      
      console.log('[DashboardController] getPerformanceCategory - Iniciando busca de performance para categoria:', categoryId);
      
      const data = await DashboardService.getPerformanceCategoryData(categoryId);
      
      console.log('[DashboardController] getPerformanceCategory - Dados encontrados:', {
        categoryId,
        percentage: data.percentage,
        trend: data.trend,
        period: data.period
      });
      
      res.json(data);
    } catch (error) {
      console.error('❌ Error in getPerformanceCategory:', error);
      res.status(500).json({ 
        message: 'Failed to load category performance data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/dashboard/level-labels
   * Retorna apenas os levelLabels do sistema
   */
  static async getLevelLabels(req: Request, res: Response) {
    try {
      console.log('[DashboardController] getLevelLabels - Buscando levelLabels...');
      
      const data = await DashboardService.getDashboardData();
      const levelLabels = data.evolution?.levelLabels || [];
      
      console.log('[DashboardController] getLevelLabels - LevelLabels encontrados:', levelLabels);
      
      res.json({ levelLabels });
    } catch (error) {
      console.error('❌ Error in getLevelLabels:', error);
      res.status(500).json({ 
        message: 'Failed to load level labels',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}