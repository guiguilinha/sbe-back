import { DirectusBaseService } from '../base/directus-base.service';
import { ResultsHeroInsights } from '../../../contracts/results/results-hero.types';
export declare class ResultsHeroService extends DirectusBaseService<ResultsHeroInsights> {
    protected serviceName: string;
    getRandomHeroInsight(levelId: number, previewToken?: string): Promise<ResultsHeroInsights | null>;
}
//# sourceMappingURL=results-hero.service.d.ts.map