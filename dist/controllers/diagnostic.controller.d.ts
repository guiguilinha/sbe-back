import { Request, Response } from 'express';
export declare class DiagnosticController {
    private persistenceService;
    private diagnosticsService;
    saveDiagnostic(req: Request, res: Response): Promise<void>;
    getUserDiagnostics(req: Request, res: Response): Promise<void>;
    getDiagnosticById(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=diagnostic.controller.d.ts.map