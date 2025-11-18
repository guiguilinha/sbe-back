"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizData = void 0;
const quiz_service_1 = require("../services/directus/quiz.service");
const getQuizData = async (req, res) => {
    try {
        const previewToken = req.query.token;
        console.log('[QuizController] Request:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0,
            queryParams: req.query
        });
        const data = await quiz_service_1.QuizService.getData(previewToken);
        return res.json({
            ...data
        });
    }
    catch (error) {
        console.error('[quiz.controller] Erro ao buscar dados do quiz:', error);
        return res.status(500).json({ error: 'Erro ao buscar dados do quiz' });
    }
};
exports.getQuizData = getQuizData;
//# sourceMappingURL=quiz.controller.js.map