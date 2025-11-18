"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
class DashboardController {
    static async getDashboard(req, res) {
        try {
            console.log('[DashboardController] getDashboard - Iniciando busca de dados completos');
            const data = await dashboard_service_1.DashboardService.getDashboardData();
            console.log('[DashboardController] getDashboard - Dados encontrados:', {
                hasUser: !!data.user,
                hasCategories: !!data.categories,
                hasEvolution: !!data.evolution,
                categoriesCount: data.categories?.length || 0
            });
            res.json(data);
        }
        catch (error) {
            console.error('❌ Error in getDashboard:', error);
            res.status(500).json({
                message: 'Failed to load dashboard data',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getEvolutionGeneral(req, res) {
        try {
            console.log('[DashboardController] getEvolutionGeneral - Iniciando busca de evolução geral');
            const data = await dashboard_service_1.DashboardService.getEvolutionGeneralData();
            console.log('[DashboardController] getEvolutionGeneral - Dados encontrados:', {
                hasData: !!data.data,
                dataLength: data.data?.length || 0,
                hasPerformance: !!data.performance
            });
            res.json(data);
        }
        catch (error) {
            console.error('❌ Error in getEvolutionGeneral:', error);
            res.status(500).json({
                message: 'Failed to load general evolution data',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getEvolutionCategories(req, res) {
        try {
            console.log('[DashboardController] getEvolutionCategories - Iniciando busca de evolução por categorias');
            const data = await dashboard_service_1.DashboardService.getEvolutionCategoriesData();
            console.log('[DashboardController] getEvolutionCategories - Dados encontrados:', {
                hasData: !!data.data,
                dataLength: data.data?.length || 0,
                hasPerformance: !!data.performance
            });
            res.json(data);
        }
        catch (error) {
            console.error('❌ Error in getEvolutionCategories:', error);
            res.status(500).json({
                message: 'Failed to load categories evolution data',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getPerformanceGeneral(req, res) {
        try {
            console.log('[DashboardController] getPerformanceGeneral - Iniciando busca de performance geral');
            const data = await dashboard_service_1.DashboardService.getPerformanceGeneralData();
            console.log('[DashboardController] getPerformanceGeneral - Dados encontrados:', {
                percentage: data.percentage,
                trend: data.trend,
                period: data.period
            });
            res.json(data);
        }
        catch (error) {
            console.error('❌ Error in getPerformanceGeneral:', error);
            res.status(500).json({
                message: 'Failed to load general performance data',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getPerformanceCategory(req, res) {
        try {
            const { categoryId } = req.params;
            console.log('[DashboardController] getPerformanceCategory - Iniciando busca de performance para categoria:', categoryId);
            const data = await dashboard_service_1.DashboardService.getPerformanceCategoryData(categoryId);
            console.log('[DashboardController] getPerformanceCategory - Dados encontrados:', {
                categoryId,
                percentage: data.percentage,
                trend: data.trend,
                period: data.period
            });
            res.json(data);
        }
        catch (error) {
            console.error('❌ Error in getPerformanceCategory:', error);
            res.status(500).json({
                message: 'Failed to load category performance data',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getLevelLabels(req, res) {
        try {
            console.log('[DashboardController] getLevelLabels - Buscando levelLabels...');
            const data = await dashboard_service_1.DashboardService.getDashboardData();
            const levelLabels = data.evolution?.levelLabels || [];
            console.log('[DashboardController] getLevelLabels - LevelLabels encontrados:', levelLabels);
            res.json({ levelLabels });
        }
        catch (error) {
            console.error('❌ Error in getLevelLabels:', error);
            res.status(500).json({
                message: 'Failed to load level labels',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map