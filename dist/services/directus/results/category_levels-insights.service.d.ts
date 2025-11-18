import { DirectusBaseService } from '../base/directus-base.service';
import { CategoryLevelsInsights } from '../../../contracts/results/results-categories.types';
export declare class CategoryLevelsInsightsService extends DirectusBaseService<CategoryLevelsInsights> {
    protected serviceName: string;
    getCategoryInsight(categoryId: number, levelId: number, previewToken?: string): Promise<CategoryLevelsInsights | null>;
}
//# sourceMappingURL=category_levels-insights.service.d.ts.map