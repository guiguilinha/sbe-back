"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsService = void 0;
const category_level_service_1 = require("./results/category-level.service");
const maturity_level_service_1 = require("./results/maturity-level.service");
class ResultsService {
    static async calculateResult(payload) {
        const { answers } = payload;
        console.log('🔍 ResultsService - Iniciando cálculo:', {
            answersCount: answers.length,
            totalScore: answers.reduce((acc, curr) => acc + curr.score, 0)
        });
        const totalScore = answers.reduce((acc, curr) => acc + curr.score, 0);
        console.log('🔍 ResultsService - Pontuação total:', totalScore);
        const categoryScores = new Map();
        for (const answer of answers) {
            const current = categoryScores.get(answer.category_id) || 0;
            categoryScores.set(answer.category_id, current + answer.score);
        }
        console.log('🔍 ResultsService - Pontuações por categoria:', Object.fromEntries(categoryScores));
        console.log('🔍 ResultsService - Buscando nível geral...');
        const maturityService = new maturity_level_service_1.MaturityLevelsRangeService();
        const generalLevel = await maturityService.getLevelByScore(totalScore);
        console.log(' ResultsService - Nível geral encontrado:', generalLevel);
        console.log('🔍 ResultsService - Buscando níveis por categoria...');
        const categoryLevels = [];
        const categoryService = new category_level_service_1.CategoryLevelsRangeService();
        for (const [categoryId, score] of categoryScores.entries()) {
            console.log(`🔍 ResultsService - Buscando nível para categoria ${categoryId} com pontuação ${score}`);
            const level = await categoryService.getLevelForCategory(categoryId, score);
            console.log(` ResultsService - Nível encontrado para categoria ${categoryId}:`, level);
            if (level) {
                categoryLevels.push({ category_id: categoryId, score, level });
            }
        }
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
exports.ResultsService = ResultsService;
//# sourceMappingURL=results.service.js.map