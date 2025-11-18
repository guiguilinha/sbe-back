import { CategoriesService, LevelsService, QuestionsService, QuizHeaderService, AnswersService } from '.';
import { QuizHeader, QuizQuestion, QuizAnswer} from './../../contracts/quiz/quiz.types';
import { Category, Levels } from './../../contracts/general/general.types';

interface QuizData {
  header: QuizHeader;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  categories: Category[];
  levels: Levels[];
}

export class QuizService {
  static async getData(previewToken?: string): Promise<QuizData> {
    console.log('[QuizService] getData:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });

    const [
      headerResults,
      questions,
      answers,
      categories,
      levels
    ] = await Promise.all([
      new QuizHeaderService().getQuizHeader(previewToken),
      new QuestionsService().getQuestions(previewToken),
      new AnswersService().getAnswers(previewToken),
      new CategoriesService().getCategories(previewToken),
      new LevelsService().getLevels(previewToken)
    ]);

    // Tratar o null
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
