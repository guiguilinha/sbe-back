import { QuizHeader } from '../../../contracts';
import { DirectusBaseService } from '../base/directus-base.service';
export declare class QuizHeaderService extends DirectusBaseService {
    protected serviceName: string;
    getQuizHeader(previewToken?: string): Promise<QuizHeader | null>;
}
//# sourceMappingURL=header.service.d.ts.map