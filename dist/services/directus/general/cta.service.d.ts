import { CTAItem } from '../../../contracts/general/cta.types';
import { DirectusBaseService } from '../base/directus-base.service';
export declare class CTAService extends DirectusBaseService {
    protected serviceName: string;
    getCTAs(previewToken?: string): Promise<CTAItem[]>;
}
//# sourceMappingURL=cta.service.d.ts.map