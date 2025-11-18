import { Router } from 'express';
import { ResultsController } from '../controllers/results.controller';

const router = Router();

// Rota de cálculo de resultado
router.post('/calculate', ResultsController.calculate);

export default router;
