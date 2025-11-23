import { Request } from 'express';
import { getKeycloakValidationService } from '../services/keycloak-validation.service';
import { UsersService } from '../services/directus/persistence/users.service';
import { UnauthorizedError, NotFoundError } from './AppError';

/**
 * Helper compartilhado para extrair userId do Directus a partir do token Keycloak
 * Usado por múltiplos controllers que precisam identificar o usuário autenticado
 * 
 * @param req - Request do Express com header Authorization
 * @returns ID do usuário no Directus
 * @throws UnauthorizedError se token não fornecido ou inválido
 * @throws NotFoundError se usuário não encontrado no Directus
 */
export async function extractUserIdFromToken(req: Request): Promise<number> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de autorização não fornecido ou formato inválido');
  }

  const idToken = authHeader.replace('Bearer ', '');
  const keycloakValidationService = getKeycloakValidationService();

  let keycloakUserData;
  try {
    keycloakUserData = await keycloakValidationService.validateIdToken(idToken);
  } catch (err) {
    throw new UnauthorizedError('Token inválido ou expirado');
  }

  const cpf = keycloakValidationService.extractCpfFromToken(keycloakUserData);

  const usersService = new UsersService();
  const directusToken = process.env.DIRECTUS_TOKEN;
  const user = await usersService.getUserByCpf(cpf, directusToken);

  if (!user) {
    throw new NotFoundError('Usuário não encontrado. Por favor, realize um diagnóstico primeiro.');
  }

  return user.id;
}

