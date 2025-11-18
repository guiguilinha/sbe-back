import type { QuizHeader } from './header.types';
import type { QuizQuestion } from './questions.types';
import type { QuizAnswer } from './answers.types';
export * from './header.types';
export * from './questions.types';
export * from './answers.types';
export interface FullQuizData {
    header: QuizHeader;
    questions: QuizQuestion[];
    answers: QuizAnswer[];
}
//# sourceMappingURL=quiz.types.d.ts.map