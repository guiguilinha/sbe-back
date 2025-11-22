/**
 * Controller para enriquecimento de dados do usuário
 * Endpoint: POST /api/auth/enrich-user-data
 */

import { Request, Response } from 'express';
import axios from 'axios';
import { getKeycloakValidationService } from '../services/keycloak-validation.service';
import { getCpeBackendService } from '../services/cpe-backend.service';
import { dataMappingService } from '../services/data-mapping.service';
import { CompanySyncService } from '../services/company/company-sync.service';
import { UsersService } from '../services/directus/persistence/users.service';
import { CompaniesService } from '../services/company/companies.service';
import { EnrichedUserData, EnrichUserDataResponse } from '../contracts/enriched-user.types';

export class EnrichedUserController {

  /**
   * Endpoint principal para enriquecimento de dados do usuário
   * POST /api/auth/enrich-user-data
   */
  async enrichUserData(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 1. Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.sendError(res, 401, 'Token de autorização não fornecido ou formato inválido');
        return;
    }

    const idToken = authHeader.replace('Bearer ', '');

          // 2. Validar token com Keycloak
    const keycloakValidationService = getKeycloakValidationService();
    const keycloakUserData = await keycloakValidationService.validateIdToken(idToken);
    
      // 3. Mapear dados do usuário
      const processedUserData = dataMappingService.mapKeycloakUserData(keycloakUserData);
      
      // 4. Validar dados essenciais do usuário
      if (!dataMappingService.validateUserData(processedUserData)) {
        this.sendError(res, 400, 'Dados do usuário inválidos ou incompletos');
        return;
      }

      // 5. Extrair CPF para busca da empresa
      const cpf = keycloakValidationService.extractCpfFromToken(keycloakUserData);
      
      // 6. Verificar/Atualizar/Criar usuário no Directus com comparação de dados
      console.log('👤 [EnrichedUser] Iniciando verificação/atualização de usuário no Directus...');
      console.log('👤 [EnrichedUser] Dados do Keycloak:', JSON.stringify({
        cpf: cpf,
        given_name: processedUserData.given_name,
        last_name: processedUserData.lastName,
        email: processedUserData.email,
        genero: processedUserData.genero,
        uf: processedUserData.uf,
        cidade: processedUserData.cidade,
        data_nascimento: processedUserData.dataNascimento
      }, null, 2));
      
      const usersService = new UsersService();
      const directusToken = process.env.DIRECTUS_TOKEN;
      
      const userDataForDirectus = {
        given_name: processedUserData.given_name || '',
        last_name: processedUserData.lastName || '',
        cpf: cpf,
        data_nascimento: processedUserData.dataNascimento || '',
        genero: processedUserData.genero || '',
        uf: processedUserData.uf || '',
        cidade: processedUserData.cidade || '',
        email: processedUserData.email || ''
      };
      
      const directusUser = await usersService.findOrUpdateUser(userDataForDirectus, directusToken);
      
      console.log('✅ [EnrichedUser] Usuário verificado/atualizado no Directus:', JSON.stringify({
        userId: directusUser.id,
        cpf: directusUser.cpf,
        given_name: directusUser.given_name,
        last_name: directusUser.last_name,
        email: directusUser.email
      }, null, 2));
      
      // 7. Sincronizar empresas CPE ↔ Directus
      console.log('🔄 [EnrichedUser] Iniciando sincronização de empresas CPE ↔ Directus...');
      console.log('🔄 [EnrichedUser] Parâmetros:', JSON.stringify({
        cpf: cpf,
        userId: directusUser.id
      }, null, 2));
      
      const companySyncService = new CompanySyncService();
      let syncResult;
      let empresasData: any[] = [];
      
      try {
        syncResult = await companySyncService.syncUserCompanies(cpf, directusUser.id);
        
        // Verificar se syncResult existe e tem companies
        if (!syncResult) {
          console.warn('⚠️ [EnrichedUser] syncResult é undefined');
          empresasData = [];
        } else if (!syncResult.companies) {
          console.warn('⚠️ [EnrichedUser] syncResult.companies é undefined');
          empresasData = [];
        } else {
          empresasData = Array.isArray(syncResult.companies) ? syncResult.companies : [];
        }
        
        console.log('🔄 [EnrichedUser] Sincronização de empresas realizada:', JSON.stringify({
          hasSyncResult: !!syncResult,
          hasCompanies: syncResult?.hasCompanies || false,
          companiesCount: syncResult?.companiesCount || 0,
          source: syncResult?.source || 'unknown',
          action: syncResult?.action || 'unknown',
          syncPerformed: syncResult?.syncPerformed || false,
          empresasDataIsArray: Array.isArray(empresasData),
          empresasDataLength: empresasData.length,
          empresas: (empresasData && Array.isArray(empresasData)) ? empresasData.map((emp: any) => ({
            // IMPORTANTE: Usar company_id.id (ID da empresa) e não emp.id (ID da relação user_companies)
            id: emp.company_id?.id || emp.id,
            cnpj: emp.cnpj || emp.company_id?.cnpj,
            nome: emp.nome || emp.company_id?.nome,
            isPrincipal: emp.is_principal || emp.isPrincipal
          })) : []
        }, null, 2));
      } catch (syncError) {
        console.error('❌ [EnrichedUser] Erro na sincronização de empresas:', syncError);
        console.error('❌ [EnrichedUser] Stack do erro:', syncError instanceof Error ? syncError.stack : 'Sem stack');
        // Garantir que empresasData seja sempre um array
        empresasData = [];
        syncResult = undefined;
        // Continua sem sincronização - não é um erro crítico
      }

      // 8. Se não houver empresas após sincronização, manter hasEmpresaData: false
      // A criação de empresa (real ou fictícia) será feita pelo usuário no modal do quiz
      if (!syncResult || !syncResult.hasCompanies || !empresasData || empresasData.length === 0) {
        console.log('⚠️ [EnrichedUser] Nenhuma empresa encontrada - hasEmpresaData será false');
        empresasData = [];
      }
      
      // Garantir que empresasData seja sempre um array antes de continuar
      if (!empresasData || !Array.isArray(empresasData)) {
        console.warn('⚠️ [EnrichedUser] empresasData não é um array, inicializando como array vazio');
        empresasData = [];
      }

      // 9. Mapear dados das empresas para formato esperado pelo frontend
      // Verificação final antes de mapear
      if (!empresasData || !Array.isArray(empresasData)) {
        console.error('❌ [EnrichedUser] empresasData não é um array antes do mapeamento:', typeof empresasData, empresasData);
        empresasData = [];
      }
      
      console.log('🔄 [EnrichedUser] Mapeando empresas para formato do frontend:', JSON.stringify({
        total: empresasData ? empresasData.length : 0,
        empresas: (empresasData && Array.isArray(empresasData)) ? empresasData.slice(0, 2) : [] // Mostrar apenas as 2 primeiras para não poluir o log
      }, null, 2));
      
      // Verificação final antes de mapear
      if (!empresasData || !Array.isArray(empresasData)) {
        console.error('❌ [EnrichedUser] ERRO CRÍTICO: empresasData não é um array antes do map final:', typeof empresasData, empresasData);
        empresasData = [];
      }
      
      const empresasMapeadas = empresasData.map((emp: any) => ({
        // IMPORTANTE: Usar company_id.id (ID da empresa) e não emp.id (ID da relação user_companies)
        id: emp.company_id?.id || emp.id || '',
        cnpj: emp.cnpj || emp.company_id?.cnpj || '',
        nome: emp.nome || emp.company_id?.nome || 'Empresa',
        isPrincipal: emp.is_principal || emp.isPrincipal || false,
        codStatusEmpresa: emp.cod_status_empresa || emp.codStatusEmpresa || '',
        desTipoVinculo: emp.des_tipo_vinculo || emp.desTipoVinculo || ''
      }));
      
      console.log('✅ [EnrichedUser] Empresas mapeadas:', JSON.stringify({
        total: empresasMapeadas.length
      }, null, 2));
      
      // 10. Combinar dados do usuário e empresas
      const enrichedData = dataMappingService.combineUserAndEmpresaData(processedUserData, empresasMapeadas);

      // 11. Criar dados seguros para o frontend (INCLUINDO dados das empresas)
      const frontendSafeData = {
        user: enrichedData.user,
        empresas: enrichedData.empresas, // Incluir array de empresas
        metadata: {
          hasEmpresaData: enrichedData.metadata.hasEmpresaData,
          empresaSource: enrichedData.metadata.empresaSource,
          lastUpdated: enrichedData.metadata.lastUpdated,
          processingTime: enrichedData.metadata.processingTime
        }
      };

      // 12. Criar resumo para logs
      const dataSummary = dataMappingService.createDataSummary(enrichedData);
      
      const processingTime = Date.now() - startTime;
      console.log('✅ [EnrichedUser] Dados enriquecidos com sucesso:', {
        processingTime: `${processingTime}ms`,
        summary: dataSummary,
        frontendSafe: true
      });

      // 13. Retornar dados seguros para o frontend (COM dados das empresas)
      res.status(200).json(frontendSafeData);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorStack = error instanceof Error ? error.stack : 'Sem stack';
      
      console.error('❌ [EnrichedUser] Erro no enriquecimento de dados:', {
        error: errorMessage,
        stack: errorStack,
        processingTime: `${processingTime}ms`
      });
      console.error('❌ [EnrichedUser] Tipo do erro:', typeof error);
      console.error('❌ [EnrichedUser] Erro completo:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Token expirado') || error.message.includes('Token inválido')) {
        this.sendError(res, 401, 'Token inválido ou expirado');
      } else if (error.message.includes('CPF não encontrado')) {
        this.sendError(res, 400, 'CPF não encontrado no token do usuário');
      } else {
        this.sendError(res, 500, `Erro interno: ${errorMessage}`);
      }
    } else {
      this.sendError(res, 500, 'Erro interno desconhecido');
    }
  }
  }

  /**
   * Endpoint para debug - buscar dados da empresa por CPF
   * GET /api/auth/debug-empresa/:cpf
   */
  async debugEmpresaData(req: Request, res: Response): Promise<void> {
    try {
      const { cpf } = req.params;
      
      if (!cpf) {
        res.status(400).json({ error: 'CPF é obrigatório' });
        return;
      }

      console.log('🔍 [Debug] Buscando dados da empresa para CPF:', cpf);
      
      const cpeBackendService = getCpeBackendService();
      if (!cpeBackendService.isConfigured()) {
        res.status(500).json({ 
          error: 'Serviço CPE Backend não configurado',
          config: cpeBackendService.getConfigInfo()
        });
        return;
      }

      // Obter token de serviço do Keycloak
      const keycloakValidationService = getKeycloakValidationService();
      const serviceToken = await keycloakValidationService.getServiceToken();
      
      // Buscar dados brutos das empresas
      const rawResponse = await cpeBackendService.getRawEmpresaData(cpf, serviceToken);
      const empresasData = Array.isArray(rawResponse) ? rawResponse : [];
      const empresasMapeadas = dataMappingService.mapCpeEmpresaData(empresasData);
      
      res.status(200).json({
        cpf,
        empresas: empresasMapeadas,
        hasEmpresaData: empresasMapeadas.length > 0,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ [Debug] Erro ao buscar dados da empresa:', error);
      res.status(500).json({
        error: 'Erro ao buscar dados da empresa',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        cpf: req.params.cpf
      });
    }
  }

  /**
   * Endpoint para verificar status dos serviços
   * GET /api/auth/enrich-user-status
   */
  async getServiceStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [EnrichedUser] Verificando status dos serviços...');
      
      const keycloakValidationService = getKeycloakValidationService();
      const cpeBackendService = getCpeBackendService();

      const status = {
        timestamp: new Date().toISOString(),
        services: {
          keycloakValidation: {
            configured: !!(process.env.KEYCLOAK_BACKEND_AUTH_SERVER_URL && 
                          process.env.KEYCLOAK_BACKEND_REALM && 
                          process.env.KEYCLOAK_BACKEND_RESOURCE && 
                          process.env.KEYCLOAK_BACKEND_SECRET)
          },
          cpeBackend: cpeBackendService.getConfigInfo()
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          keycloakBackendRealm: process.env.KEYCLOAK_BACKEND_REALM,
          keycloakBackendUrl: process.env.KEYCLOAK_BACKEND_AUTH_SERVER_URL
        }
      };

      console.log('✅ [EnrichedUser] Status dos serviços:', status);
      res.status(200).json(status);

    } catch (error) {
      console.error('❌ [EnrichedUser] Erro ao verificar status:', error);
      this.sendError(res, 500, 'Erro ao verificar status dos serviços');
    }
  }

  /**
   * Método auxiliar para enviar erros padronizados
   */
  private sendError(res: Response, statusCode: number, message: string, cpf?: string): void {
    const errorResponse: EnrichUserDataResponse = {
      success: false,
      error: message,
      message: `Erro ${statusCode}: ${message}`,
      ...(cpf && { cpf })
    };

    console.error(`❌ [EnrichedUser] Erro ${statusCode}:`, errorResponse);
    res.status(statusCode).json(errorResponse);
  }
}

// Instância singleton do controller
export const enrichedUserController = new EnrichedUserController();
