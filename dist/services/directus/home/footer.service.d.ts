import { FullFooterData } from '../../../contracts';
import { DirectusBaseService } from '../base/directus-base.service';
export declare class FooterService extends DirectusBaseService {
    protected serviceName: string;
    getFullFooter(previewToken?: string): Promise<FullFooterData>;
}
//# sourceMappingURL=footer.service.d.ts.map