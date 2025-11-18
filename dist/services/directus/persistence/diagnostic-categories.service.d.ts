import { DirectusBaseService } from '../base/directus-base.service';
import { DiagnosticCategory } from '../../../contracts/persistence/persistence.types';
export declare class DiagnosticCategoriesService extends DirectusBaseService<DiagnosticCategory> {
    protected serviceName: string;
    createCategoryResult(categoryData: {
        diagnostic_id: number;
        category_id: number;
        level_id: number;
        score: number;
        insight: string;
        tip: string;
    }, token?: string): Promise<DiagnosticCategory>;
    createCategoryResults(categoriesData: Array<{
        diagnostic_id: number;
        category_id: number;
        level_id: number;
        score: number;
        insight: string;
        tip: string;
    }>, token?: string): Promise<DiagnosticCategory[]>;
    getDiagnosticCategories(diagnosticId: number, token?: string): Promise<DiagnosticCategory[]>;
}
//# sourceMappingURL=diagnostic-categories.service.d.ts.map