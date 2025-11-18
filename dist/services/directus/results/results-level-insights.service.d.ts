import { DirectusBaseService } from '../base/directus-base.service';
import { MaturityLevelsInsights } from '../../../contracts/results/results-level-insights.types';
export declare class ResultsLevelInsightsService extends DirectusBaseService<MaturityLevelsInsights> {
    protected serviceName: string;
    getLevelInsight(levelId: number, previewToken?: string): Promise<MaturityLevelsInsights | null>;
}
//# sourceMappingURL=results-level-insights.service.d.ts.map