import { Request, Response } from 'express';
export declare class EnrichedUserController {
    enrichUserData(req: Request, res: Response): Promise<void>;
    debugEmpresaData(req: Request, res: Response): Promise<void>;
    getServiceStatus(req: Request, res: Response): Promise<void>;
    private sendError;
}
export declare const enrichedUserController: EnrichedUserController;
//# sourceMappingURL=enriched-user.controller.d.ts.map