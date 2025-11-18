import { DirectusBaseService } from '../base/directus-base.service';
import { ResultsLevelsTrail } from '../../../contracts/results/results-level-trail.types';
export declare class ResultsTrailService extends DirectusBaseService<ResultsLevelsTrail> {
    protected serviceName: string;
    getAllTrails(previewToken?: string): Promise<ResultsLevelsTrail[]>;
    getTrailByLevelId(levelId: number, previewToken?: string): Promise<ResultsLevelsTrail | null>;
}
//# sourceMappingURL=results-trail.service.d.ts.map