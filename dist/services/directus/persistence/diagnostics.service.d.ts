import { DirectusBaseService } from '../base/directus-base.service';
import { Diagnostic } from '../../../contracts/persistence/persistence.types';
export declare class DiagnosticsService extends DirectusBaseService<Diagnostic> {
    protected serviceName: string;
    createDiagnostic(diagnosticData: {
        user_id: number;
        company_id: number;
        performed_at: string;
        overall_level_id: number;
        overall_score: number;
        overall_insight: string;
        status: string;
    }, token?: string): Promise<Diagnostic>;
    getUserDiagnostics(userId: number, token?: string): Promise<Diagnostic[]>;
    getUserDiagnosticsWithDetails(userId: number, token?: string): Promise<any[]>;
    private getCompanyById;
    private getDiagnosticCategories;
    private getCategoryAnswers;
    getCompanyDiagnostics(companyId: number, token?: string): Promise<Diagnostic[]>;
    getDiagnosticById(id: number, token?: string): Promise<Diagnostic>;
    updateDiagnosticStatus(id: number, status: string, token?: string): Promise<Diagnostic>;
}
//# sourceMappingURL=diagnostics.service.d.ts.map