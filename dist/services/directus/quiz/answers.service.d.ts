import { QuizAnswer } from '../../../contracts';
import { DirectusBaseService } from '../base/directus-base.service';
export declare class AnswersService extends DirectusBaseService {
    protected serviceName: string;
    getAnswers(previewToken?: string): Promise<QuizAnswer[]>;
}
//# sourceMappingURL=answers.service.d.ts.map