import { LegacyQuizRequest, LegacyQuizResponse } from '../contracts/legacy-quiz.types';
export declare class LegacyQuizService {
    private answersCache;
    saveQuizData(request: LegacyQuizRequest, previewToken?: string): Promise<LegacyQuizResponse>;
    private mapAnswersToLegacyFormat;
    private getAnswerText;
}
//# sourceMappingURL=legacy-quiz.service.d.ts.map