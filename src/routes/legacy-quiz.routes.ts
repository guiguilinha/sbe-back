import { Router } from 'express';
import { LegacyQuizController } from '../controllers/legacy-quiz.controller';

const router = Router();

// Rota principal para processar quiz legado
router.post('/legacy-quiz', LegacyQuizController.processQuiz);

// Rota de health check
router.get('/legacy-quiz/health', LegacyQuizController.healthCheck);

export default router;

