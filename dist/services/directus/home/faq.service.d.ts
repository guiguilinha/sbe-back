import { FullFaqData } from '../../../contracts';
import { DirectusBaseService } from '../base/directus-base.service';
export declare class FaqService extends DirectusBaseService {
    protected serviceName: string;
    getFullFaq(previewToken?: string): Promise<FullFaqData>;
}
//# sourceMappingURL=faq.service.d.ts.map