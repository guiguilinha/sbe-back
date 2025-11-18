import { Router } from 'express';
import { getQuizData } from '../controllers/quiz.controller';

const router = Router();

router.get('/', getQuizData);

export default router;
