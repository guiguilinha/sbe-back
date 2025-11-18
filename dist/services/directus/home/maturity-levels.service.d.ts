import { DirectusBaseService } from '../base/directus-base.service';
import { FullMaturityData } from '../../../contracts';
export declare class MaturityLevelsService extends DirectusBaseService {
    protected serviceName: string;
    getFullMaturityLevels(previewToken?: string): Promise<FullMaturityData>;
}
//# sourceMappingURL=maturity-levels.service.d.ts.map