import { DirectusBaseService } from '../base/directus-base.service';
import { FullBenefitsData } from '../../../contracts';
export declare class BenefitsService extends DirectusBaseService {
    protected serviceName: string;
    getFullBenefits(previewToken?: string): Promise<FullBenefitsData>;
}
//# sourceMappingURL=benefits.service.d.ts.map