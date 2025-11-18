import { Request, Response } from 'express';
export declare class DashboardController {
    static getDashboard(req: Request, res: Response): Promise<void>;
    static getEvolutionGeneral(req: Request, res: Response): Promise<void>;
    static getEvolutionCategories(req: Request, res: Response): Promise<void>;
    static getPerformanceGeneral(req: Request, res: Response): Promise<void>;
    static getPerformanceCategory(req: Request, res: Response): Promise<void>;
    static getLevelLabels(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map