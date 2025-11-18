import { DashboardResponse } from '../contracts/dashboard/dashboard.types';
export declare class DashboardService {
    static getDashboardData(): Promise<DashboardResponse>;
    static getEvolutionGeneralData(): Promise<{
        data: Array<{
            month: string;
            level: number;
            levelLabel: string;
            score: number;
            delta: number;
        }>;
        performance: {
            percentage: number;
            trend: "up" | "down" | "flat";
            period: string;
        };
    }>;
    static getEvolutionCategoriesData(): Promise<{
        data: Array<{
            month: string;
            topCategories: Array<{
                id: string;
                name: string;
                level: number;
                levelLabel: string;
                score: number;
                delta: number;
                color: string;
            }>;
        }>;
        performance: Record<string, {
            percentage: number;
            trend: "up" | "down" | "flat";
            period: string;
        }>;
    }>;
    static getPerformanceGeneralData(): Promise<{
        percentage: number;
        trend: "up" | "down" | "flat";
        period: string;
    }>;
    static getPerformanceCategoryData(categoryId: string): Promise<{
        percentage: number;
        trend: "up" | "down" | "flat";
        period: string;
    }>;
    private static loadMockData;
    static calculatePerformanceMetrics(data: any[]): {
        percentage: number;
        trend: "up" | "down" | "flat";
        period: string;
    };
    static filterDataByPeriod(data: any[], period: string): any[];
    static getTopCategories(monthData: any, limit?: number): any;
}
//# sourceMappingURL=dashboard.service.d.ts.map