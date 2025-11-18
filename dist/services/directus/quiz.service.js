"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const _1 = require(".");
class QuizService {
    static async getData(previewToken) {
        console.log('[QuizService] getData:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        const [headerResults, questions, answers, categories, levels] = await Promise.all([
            new _1.QuizHeaderService().getQuizHeader(previewToken),
            new _1.QuestionsService().getQuestions(previewToken),
            new _1.AnswersService().getAnswers(previewToken),
            new _1.CategoriesService().getCategories(previewToken),
            new _1.LevelsService().getLevels(previewToken)
        ]);
        if (!headerResults) {
            throw new Error('Quiz header não encontrado');
        }
        return {
            header: headerResults,
            questions,
            answers,
            categories,
            levels
        };
    }
}
exports.QuizService = QuizService;
//# sourceMappingURL=quiz.service.js.map