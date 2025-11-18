/**
 * Rotas para enriquecimento de dados do usuário
 */

import { Router } from 'express';
import { enrichedUserController } from '../controllers/enriched-user.controller';

const router = Router();

/**
 * POST /api/auth/enrich-user-data
 * Enriquece dados do usuário com informações da empresa
 * Headers: Authorization: Bearer {keycloak.idToken}
 */
router.post('/enrich-user-data', async (req, res) => {
  await enrichedUserController.enrichUserData(req, res);
});

/**
 * GET /api/auth/enrich-user-status
 * Verifica status dos serviços de enriquecimento
 */
router.get('/enrich-user-status', async (req, res) => {
  await enrichedUserController.getServiceStatus(req, res);
});

export default router;
