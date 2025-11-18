import { DirectusBaseService } from '../base/directus-base.service';
import { MGRegionPhone, MGRegion } from '../../../contracts/general/mg-region.types';
export declare class MGRegionService extends DirectusBaseService<MGRegionPhone> {
    protected serviceName: string;
    getMGRegions(previewToken?: string): Promise<MGRegion[]>;
}
//# sourceMappingURL=mg-region.service.d.ts.map