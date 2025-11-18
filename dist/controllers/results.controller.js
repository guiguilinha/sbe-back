"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsController = void 0;
const results_service_1 = require("../services/directus/results.service");
const user_results_service_1 = require("../services/directus/results/user-results.service");
const results_trail_service_1 = require("../services/directus/results/results-trail.service");
class ResultsController {
    static async calculate(req, res) {
        try {
            const { answers } = req.body;
            const previewToken = req.query.token;
            console.log('🔍 ResultsController.calculate() payload:', {
                answers: answers.length,
                hasAnswers: answers.length > 0,
                firstAnswer: answers[0],
                hasPreviewToken: !!previewToken,
                previewTokenLength: previewToken?.length || 0
            });
            console.log('🔍 ResultsController.calculate() Todas as respostas:', JSON.stringify(answers, null, 2));
            if (!Array.isArray(answers) || answers.length === 0) {
                return res.status(400).json({ error: 'Payload inválido: respostas ausentes' });
            }
            console.log('🔍 ResultsController.calculate() answers:', answers);
            const calculatedResult = await results_service_1.ResultsService.calculateResult({ answers });
            console.log('🔍 ResultsController.calculate() calculatedResult:', calculatedResult);
            console.log('🔍 ResultsController.calculate() general_level:', calculatedResult.general_level);
            console.log('🔍 ResultsController.calculate() level_id que será usado para trail:', calculatedResult.general_level.id);
            console.log('🔍 ResultsController.calculate() chamando UserResultsService.getUserResults...');
            try {
                const userResults = await user_results_service_1.UserResultsService.getUserResults(calculatedResult, previewToken);
                console.log('🔍 ResultsController.calculate() userResults gerados com sucesso:', userResults);
                return res.status(200).json({
                    success: true,
                    data: userResults,
                    calculatedResult: calculatedResult
                });
            }
            catch (userResultsError) {
                console.error('❌ Erro ao gerar userResults:', userResultsError);
                return res.status(200).json({
                    success: true,
                    data: null,
                    calculatedResult: calculatedResult,
                    error: 'Erro ao gerar dados completos'
                });
            }
        }
        catch (error) {
            console.error('Erro ao calcular resultado:', {
                message: error instanceof Error ? error.message : 'Erro desconhecido',
                stack: error instanceof Error ? error.stack : 'Não disponível',
                name: error instanceof Error ? error.name : 'Erro desconhecido',
            });
            return res.status(500).json({ error: 'Erro interno ao calcular resultado' });
        }
    }
    static async debugTrails(req, res) {
        try {
            const previewToken = req.query.token;
            console.log('🔍 [DEBUG] Verificando todos os trails...');
            const trailService = new results_trail_service_1.ResultsTrailService();
            const allTrails = await trailService.getAllTrails(previewToken);
            console.log('🔍 [DEBUG] Todos os trails encontrados:', allTrails);
            res.json({
                success: true,
                totalTrails: allTrails.length,
                trails: allTrails,
                message: `Encontrados ${allTrails.length} trails na collection`
            });
        }
        catch (error) {
            console.error('❌ [DEBUG] Erro ao verificar trails:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao verificar trails',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
}
exports.ResultsController = ResultsController;
//# sourceMappingURL=results.controller.js.map