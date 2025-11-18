import { DirectusBaseService } from '../base/directus-base.service';
import { AnswerGiven } from '../../../contracts/persistence/persistence.types';
export declare class AnswersGivenService extends DirectusBaseService<AnswerGiven> {
    protected serviceName: string;
    saveAnswers(answersData: Array<{
        diagnostic_category_id: number;
        question_id: number;
        answer_id: number;
        score: number;
    }>, token?: string): Promise<AnswerGiven[]>;
    getAnswersByDiagnosticCategory(diagnosticCategoryId: number, token?: string): Promise<AnswerGiven[]>;
    getAnswersByDiagnostic(diagnosticId: number, token?: string): Promise<AnswerGiven[]>;
}
//# sourceMappingURL=answers-given.service.d.ts.map