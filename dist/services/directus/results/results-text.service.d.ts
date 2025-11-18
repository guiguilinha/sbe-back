import { DirectusBaseService } from '../base/directus-base.service';
import { ResultsText } from '../../../contracts/results/results-text.types';
export declare class ResultsTextService extends DirectusBaseService<ResultsText> {
    protected serviceName: string;
    getResultsText(previewToken?: string): Promise<ResultsText | null>;
}
//# sourceMappingURL=results-text.service.d.ts.map