import { DirectusBaseService } from '../base/directus-base.service';
import { Levels } from '../../../contracts/general/general.types';
export declare class LevelsService extends DirectusBaseService<Levels> {
    protected serviceName: string;
    protected endpoint: string;
    getLevels(previewToken?: string): Promise<Levels[]>;
}
//# sourceMappingURL=levels.service.d.ts.map