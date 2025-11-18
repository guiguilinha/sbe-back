import { Router } from 'express';
import homepageRoutes from './homepage.routes';
import quizRoutes from './quiz.routes';
import resultsRoutes from './results.routes';
import dashboardRoutes from './dashboard.routes';
import diagnosticosRoutes from './diagnosticos.routes';

const router = Router();

// Rotas ativas
router.use('/homepage', homepageRoutes);
router.use('/quiz', quizRoutes);
router.use('/results', resultsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/diagnosticos', diagnosticosRoutes);

export default router;
