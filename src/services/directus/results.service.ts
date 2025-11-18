// ResultsService - Cálculo de Resultado Consolidado
import { LevelsService } from './general/levels.service';
import { CategoriesService } from './general/categories.service';
import { CategoryLevelsRangeService } from './results/category-level.service';
import { MaturityLevelsRangeService } from './results/maturity-level.service';
import { AnswerPayload, CalculatedCategoryLevel, CalculatedResult, MaturityLevelsRange, CategoryLevelsRange } from '../../contracts';



export class ResultsService {
  static async calculateResult(payload: { answers: AnswerPayload[] }): Promise<CalculatedResult> {
    const { answers } = payload;

    console.log('🔍 ResultsService - Iniciando cálculo:', {
      answersCount: answers.length,
      totalScore: answers.reduce((acc, curr) => acc + curr.score, 0)
    });

    // 1. Calcular pontuação total geral
    const totalScore = answers.reduce((acc, curr) => acc + curr.score, 0);
    console.log('🔍 ResultsService - Pontuação total:', totalScore);

    // 2. Calcular pontuação por categoria
    const categoryScores = new Map<number, number>();
    for (const answer of answers) {
      const current = categoryScores.get(answer.category_id) || 0;
      categoryScores.set(answer.category_id, current + answer.score);
    }
    console.log('🔍 ResultsService - Pontuações por categoria:', Object.fromEntries(categoryScores));

    // 3. Buscar nível geral com base na pontuação total
    console.log('🔍 ResultsService - Buscando nível geral...');
    const maturityService = new MaturityLevelsRangeService();
    const generalLevel = await maturityService.getLevelByScore(totalScore);
    console.log(' ResultsService - Nível geral encontrado:', generalLevel);

    // 4. Buscar nível por categoria
    console.log('🔍 ResultsService - Buscando níveis por categoria...');
    const categoryLevels: CalculatedCategoryLevel[] = [];
    const categoryService = new CategoryLevelsRangeService();

    for (const [categoryId, score] of categoryScores.entries()) {
      console.log(`🔍 ResultsService - Buscando nível para categoria ${categoryId} com pontuação ${score}`);
      const level = await categoryService.getLevelForCategory(categoryId, score);
      console.log(` ResultsService - Nível encontrado para categoria ${categoryId}:`, level);
      if (level) {
        categoryLevels.push({ category_id: categoryId, score, level });
      }
    }

    // 5. Retornar estrutura consolidada
    if (!generalLevel) {
      throw new Error(`Nível geral não encontrado para a pontuação total ${totalScore}`);
    }

    const result = {
      total_score: totalScore,
      general_level: generalLevel,
      categories: categoryLevels,
    };

    console.log('✅ ResultsService - Resultado final:', result);
    return result;
  }
}
