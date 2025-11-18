import { CompleteDiagnosticRequest, CompleteDiagnosticResponse } from '../../../contracts/persistence/persistence.types';
export declare class DiagnosticPersistenceService {
    private usersService;
    private companiesService;
    private userCompaniesService;
    private diagnosticsService;
    private diagnosticCategoriesService;
    private answersGivenService;
    private levelsService;
    saveCompleteDiagnostic(requestData: CompleteDiagnosticRequest, token?: string): Promise<CompleteDiagnosticResponse>;
}
//# sourceMappingURL=diagnostic-persistence.service.d.ts.map