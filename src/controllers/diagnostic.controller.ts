import { Request, Response } from 'express';
import { DiagnosticPersistenceService } from '../services/directus/persistence/diagnostic-persistence.service';
import { DiagnosticsService } from '../services/directus/persistence/diagnostics.service';
import { CompleteDiagnosticRequest } from '../contracts/persistence/persistence.types';

export class DiagnosticController {
  private persistenceService = new DiagnosticPersistenceService();
  private diagnosticsService = new DiagnosticsService();

  /**
   * POST /api/diagnostics
   * Salva diagnóstico completo
   */
  async saveDiagnostic(req: Request, res: Response) {
    try {
      const requestData: CompleteDiagnosticRequest = req.body;
      const keycloakToken = req.headers.authorization?.replace('Bearer ', '');
      const directusToken = process.env.DIRECTUS_TOKEN;

      // Nota: O token do Keycloak é usado para autenticação do usuário no frontend.
      // O token do Directus é usado para acesso ao banco de dados.
      // A validação do token Keycloak pode ser adicionada no futuro se necessário para autorização.

      const result = await this.persistenceService.saveCompleteDiagnostic(
        requestData, 
        directusToken,
        keycloakToken // Passar token do Keycloak para Meta Sebrae
      );

      res.status(201).json(result);
    } catch (error) {
      console.error('[DiagnosticController] Erro ao salvar diagnóstico:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/diagnostics/user/:userId
   * Lista diagnósticos de um usuário com dados completos
   * Query params: page (número da página, padrão: 1), limit (itens por página, padrão: 10)
   */
  async getUserDiagnostics(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const keycloakToken = req.headers.authorization?.replace('Bearer ', '');
      const directusToken = process.env.DIRECTUS_TOKEN;

      // Nota: O token do Keycloak é usado para autenticação do usuário no frontend.
      // O token do Directus é usado para acesso ao banco de dados.
      // A validação do token Keycloak pode ser adicionada no futuro se necessário para autorização.

      // Validar parâmetros de paginação
      if (page < 1) {
        return res.status(400).json({
          success: false,
          error: 'Página deve ser maior ou igual a 1'
        });
      }
      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: 'Limit deve estar entre 1 e 100'
        });
      }

      const result = await this.diagnosticsService.getUserDiagnosticsWithDetails(
        userId, 
        directusToken,
        page,
        limit
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('[DiagnosticController] Erro ao buscar diagnósticos:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/diagnostics/:id
   * Busca diagnóstico específico com dados completos (categorias e respostas)
   */
  async getDiagnosticById(req: Request, res: Response) {
    try {
      const diagnosticId = parseInt(req.params.id);
      const keycloakToken = req.headers.authorization?.replace('Bearer ', '');
      const directusToken = process.env.DIRECTUS_TOKEN;

      // Nota: O token do Keycloak é usado para autenticação do usuário no frontend.
      // O token do Directus é usado para acesso ao banco de dados.
      // A validação do token Keycloak pode ser adicionada no futuro se necessário para autorização.

      // 1. Buscar diagnóstico básico para obter userId
      const diagnosticBasic = await this.diagnosticsService.getDiagnosticById(diagnosticId, directusToken);
      
      if (!diagnosticBasic) {
        return res.status(404).json({
          success: false,
          error: 'Diagnóstico não encontrado'
        });
      }

      // 2. Buscar diagnóstico completo com categorias e respostas usando getUserDiagnosticsWithDetails
      // Usar paginação grande para garantir que o diagnóstico específico seja encontrado
      const result = await this.diagnosticsService.getUserDiagnosticsWithDetails(
        diagnosticBasic.user_id,
        directusToken,
        1,
        1000 // Buscar muitos itens para garantir que o diagnóstico específico esteja na lista
      );

      // 3. Filtrar diagnóstico específico da lista
      const diagnostic = result.data.find(d => d.id === diagnosticId);

      if (!diagnostic) {
        return res.status(404).json({
          success: false,
          error: 'Diagnóstico não encontrado'
        });
      }

      res.json({
        success: true,
        data: diagnostic
      });
    } catch (error) {
      console.error('[DiagnosticController] Erro ao buscar diagnóstico:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
