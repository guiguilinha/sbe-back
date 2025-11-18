"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
class DashboardService {
    static async getDashboardData() {
        try {
            console.log('[DashboardService] getDashboardData - Carregando dados completos do dashboard');
            const mockData = await this.loadMockData();
            console.log('[DashboardService] getDashboardData - Dados carregados com sucesso');
            return mockData;
        }
        catch (error) {
            console.error('[DashboardService] getDashboardData - Erro:', error);
            throw error;
        }
    }
    static async getEvolutionGeneralData() {
        try {
            console.log('[DashboardService] getEvolutionGeneralData - Carregando evolução geral');
            const mockData = await this.loadMockData();
            const evolutionData = mockData.evolution?.general;
            if (!evolutionData) {
                throw new Error('Dados de evolução geral não encontrados');
            }
            console.log('[DashboardService] getEvolutionGeneralData - Dados carregados:', {
                dataLength: evolutionData.data?.length || 0,
                hasPerformance: !!evolutionData.performance
            });
            return evolutionData;
        }
        catch (error) {
            console.error('[DashboardService] getEvolutionGeneralData - Erro:', error);
            throw error;
        }
    }
    static async getEvolutionCategoriesData() {
        try {
            console.log('[DashboardService] getEvolutionCategoriesData - Carregando evolução por categorias');
            const mockData = await this.loadMockData();
            const evolutionData = mockData.evolution?.categories;
            if (!evolutionData) {
                throw new Error('Dados de evolução por categorias não encontrados');
            }
            console.log('[DashboardService] getEvolutionCategoriesData - Dados carregados:', {
                dataLength: evolutionData.data?.length || 0,
                hasPerformance: !!evolutionData.performance
            });
            return evolutionData;
        }
        catch (error) {
            console.error('[DashboardService] getEvolutionCategoriesData - Erro:', error);
            throw error;
        }
    }
    static async getPerformanceGeneralData() {
        try {
            console.log('[DashboardService] getPerformanceGeneralData - Carregando performance geral');
            const mockData = await this.loadMockData();
            const performanceData = mockData.evolution?.general?.performance;
            if (!performanceData) {
                throw new Error('Dados de performance geral não encontrados');
            }
            console.log('[DashboardService] getPerformanceGeneralData - Dados carregados:', {
                percentage: performanceData.percentage,
                trend: performanceData.trend,
                period: performanceData.period
            });
            return performanceData;
        }
        catch (error) {
            console.error('[DashboardService] getPerformanceGeneralData - Erro:', error);
            throw error;
        }
    }
    static async getPerformanceCategoryData(categoryId) {
        try {
            console.log('[DashboardService] getPerformanceCategoryData - Carregando performance para categoria:', categoryId);
            const mockData = await this.loadMockData();
            const categoryPerformance = mockData.evolution?.categories?.performance?.[categoryId];
            if (!categoryPerformance) {
                throw new Error(`Dados de performance para categoria ${categoryId} não encontrados`);
            }
            console.log('[DashboardService] getPerformanceCategoryData - Dados carregados:', {
                categoryId,
                percentage: categoryPerformance.percentage,
                trend: categoryPerformance.trend,
                period: categoryPerformance.period
            });
            return categoryPerformance;
        }
        catch (error) {
            console.error('[DashboardService] getPerformanceCategoryData - Erro:', error);
            throw error;
        }
    }
    static async loadMockData() {
        try {
            const fs = require('fs');
            const path = require('path');
            const mockPath = path.join(__dirname, '../../server/mock/dashboard.mock.json');
            console.log('[DashboardService] loadMockData - Carregando arquivo:', mockPath);
            const rawData = fs.readFileSync(mockPath, 'utf8');
            const mockData = JSON.parse(rawData);
            console.log('[DashboardService] loadMockData - Arquivo carregado com sucesso');
            return mockData;
        }
        catch (error) {
            console.error('[DashboardService] loadMockData - Erro ao carregar mock:', error);
            throw new Error('Erro ao carregar dados mock do dashboard');
        }
    }
    static calculatePerformanceMetrics(data) {
        if (!data || data.length === 0) {
            return {
                percentage: 0,
                trend: 'flat',
                period: 'último mês'
            };
        }
        const latest = data[data.length - 1];
        const previous = data[data.length - 2];
        if (!latest || !previous) {
            return {
                percentage: 0,
                trend: 'flat',
                period: 'último mês'
            };
        }
        const delta = latest.score - previous.score;
        const percentage = previous.score > 0 ? (delta / previous.score) * 100 : 0;
        return {
            percentage: Math.round(percentage * 10) / 10,
            trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
            period: 'último mês'
        };
    }
    static filterDataByPeriod(data, period) {
        const periods = {
            '3m': 3,
            '6m': 6,
            '12m': 12
        };
        const months = periods[period] || 12;
        return data.slice(-months);
    }
    static getTopCategories(monthData, limit = 3) {
        if (!monthData?.topCategories) {
            return [];
        }
        return monthData.topCategories
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map