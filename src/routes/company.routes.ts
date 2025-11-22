/**
 * Rotas para criação de empresas
 */

import { Router } from 'express';
import { companyController } from '../controllers/company.controller';

const router = Router();

/**
 * POST /api/company/create
 * Cria uma empresa (real ou fictícia)
 * Headers: Authorization: Bearer {keycloak.idToken}
 * Body: { type: 'real' | 'fictitious', companyData?: { cnpj: string, nome: string } }
 */
router.post('/create', async (req, res) => {
  await companyController.createCompany(req, res);
});

export default router;

