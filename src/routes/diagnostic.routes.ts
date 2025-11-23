import { Router } from 'express';
import { DiagnosticController } from '../controllers/diagnostic.controller';

const router = Router();
const diagnosticController = new DiagnosticController();

// POST /api/diagnostics - Salvar diagnóstico completo
router.post('/', (req, res) => diagnosticController.saveDiagnostic(req, res));

// GET /api/diagnostics/user - Listar diagnósticos do usuário autenticado (userId extraído do token)
router.get('/user', (req, res) => diagnosticController.getUserDiagnostics(req, res));

// GET /api/diagnostics/:id - Buscar diagnóstico específico
router.get('/:id', (req, res) => diagnosticController.getDiagnosticById(req, res));

export default router;
