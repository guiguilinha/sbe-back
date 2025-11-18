import { QuizQuestion } from '../../../contracts';
import { DirectusBaseService } from '../base/directus-base.service';
export declare class QuestionsService extends DirectusBaseService {
    protected serviceName: string;
    getQuestions(previewToken?: string): Promise<QuizQuestion[]>;
}
//# sourceMappingURL=questions.service.d.ts.map