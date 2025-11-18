import { DirectusBaseService } from '../base/directus-base.service';
import { ResultsCategoryDetailsSummary } from '../../../contracts/results/results-categories.types';
export declare class ResultsCategoriesService extends DirectusBaseService<ResultsCategoryDetailsSummary> {
    protected serviceName: string;
    getRandomCategorySummary(categoryId: number, levelId: number, previewToken?: string): Promise<ResultsCategoryDetailsSummary | null>;
}
//# sourceMappingURL=results-categories.service.d.ts.map