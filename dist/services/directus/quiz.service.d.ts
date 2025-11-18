import { QuizHeader, QuizQuestion, QuizAnswer } from './../../contracts/quiz/quiz.types';
import { Category, Levels } from './../../contracts/general/general.types';
interface QuizData {
    header: QuizHeader;
    questions: QuizQuestion[];
    answers: QuizAnswer[];
    categories: Category[];
    levels: Levels[];
}
export declare class QuizService {
    static getData(previewToken?: string): Promise<QuizData>;
}
export {};
//# sourceMappingURL=quiz.service.d.ts.map