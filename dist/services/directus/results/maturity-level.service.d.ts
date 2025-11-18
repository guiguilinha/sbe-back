import { MaturityLevelsRange } from '../../../contracts/results/maturity-level-range.types';
import { DirectusBaseService } from '../base/directus-base.service';
export declare class MaturityLevelsRangeService extends DirectusBaseService<MaturityLevelsRange> {
    protected serviceName: string;
    getLevelByScore(score: number, previewToken?: string): Promise<{
        id: number;
        title: string;
    } | null>;
}
//# sourceMappingURL=maturity-level.service.d.ts.map