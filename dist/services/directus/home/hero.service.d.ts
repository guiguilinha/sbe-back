import { DirectusBaseService } from '../base/directus-base.service';
import { HeroData } from '../../../contracts';
export declare class HeroService extends DirectusBaseService {
    protected serviceName: string;
    getHero(previewToken?: string): Promise<HeroData>;
}
//# sourceMappingURL=hero.service.d.ts.map