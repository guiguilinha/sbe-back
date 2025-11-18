import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

// Rota principal - dados completos do dashboard
router.get('/', DashboardController.getDashboard);

// Rotas de evolução
router.get('/evolution/general', DashboardController.getEvolutionGeneral);
router.get('/evolution/categories', DashboardController.getEvolutionCategories);

// Rotas de performance
router.get('/performance/general', DashboardController.getPerformanceGeneral);
router.get('/performance/category/:categoryId', DashboardController.getPerformanceCategory);

// Rota para levelLabels
router.get('/level-labels', DashboardController.getLevelLabels);

export default router;