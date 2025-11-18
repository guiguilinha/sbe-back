import { Router } from 'express';
import { listDiagnosticos, getDiagnosticoById } from '../controllers/diagnostico.controller';

const router = Router();
router.get('/', listDiagnosticos);
router.get('/:id', getDiagnosticoById);

export default router;
