/**
 * Controller para enriquecimento de dados do usuário
 * Endpoint: POST /api/auth/enrich-user-data
 */

import { Request, Response } from 'express';
import { getKeycloakValidationService } from '../services/keycloak-validation.service';
import { getCpeBackendService } from '../services/cpe-backend.service';
import { dataMappingService } from '../services/data-mapping.service';
import { EnrichedUserData, EnrichUserDataResponse } from '../contracts/enriched-user.types';

export class EnrichedUserController {

  /**
   * Endpoint principal para enriquecimento de dados do usuário
   * POST /api/auth/enrich-user-data
   */
  async enrichUserData(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 [EnrichedUser] Iniciando enriquecimento de dados do usuário...');

      // 1. Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.sendError(res, 401, 'Token de autorização não fornecido ou formato inválido');
        return;
    }

    const idToken = authHeader.replace('Bearer ', '');
    console.log('🔍 [EnrichedUser] Token extraído do header');

          // 2. Validar token com Keycloak
    console.log('🔍 [EnrichedUser] Validando token com Keycloak...');
    const keycloakValidationService = getKeycloakValidationService();
    const keycloakUserData = await keycloakValidationService.validateIdToken(idToken);
    
      // 2.1. Log detalhado dos dados brutos do usuário
    console.log('👤 [EnrichedUser] === DADOS BRUTOS DO USUÁRIO ===');
    console.log('👤 [EnrichedUser] Dados completos do token Keycloak:', JSON.stringify(keycloakUserData, null, 2));
    
      // 3. Mapear dados do usuário
      console.log('🔄 [EnrichedUser] Mapeando dados do usuário...');
      console.log('🔄 [EnrichedUser] Dados que serão mapeados:', JSON.stringify(keycloakUserData, null, 2));
      const processedUserData = dataMappingService.mapKeycloakUserData(keycloakUserData);
      console.log('🔄 [EnrichedUser] Dados mapeados resultantes:', JSON.stringify(processedUserData, null, 2));
      
      // 4. Validar dados essenciais do usuário
      if (!dataMappingService.validateUserData(processedUserData)) {
        this.sendError(res, 400, 'Dados do usuário inválidos ou incompletos');
        return;
      }

      // 5. Extrair CPF para busca da empresa
      const cpf = keycloakValidationService.extractCpfFromToken(keycloakUserData);
      console.log('🔍 [EnrichedUser] CPF extraído do token:', cpf);
      
        // 6. Buscar dados das empresas (opcional)
        let empresasData: any[] = [];
        const cpeBackendService = getCpeBackendService();
        if (cpeBackendService.isConfigured()) {
          console.log('🏢 [EnrichedUser] Buscando dados das empresas...');
          console.log('🔍 [EnrichedUser] CPF usado na busca:', cpf);
          console.log('🔍 [EnrichedUser] URL da API CPE:', process.env.CPE_BACKEND_URL);
          
          try {
            // Obter token de serviço do Keycloak
            console.log('🔑 [EnrichedUser] Obtendo token de serviço...');
            const serviceToken = await keycloakValidationService.getServiceToken();
            
            // Fazer chamada bruta para a API CPE para ver resposta completa
            console.log('🔍 [EnrichedUser] === CHAMADA BRUTA PARA API CPE ===');
            const rawResponse = await cpeBackendService.getRawEmpresaData(cpf, serviceToken);
            console.log('🏢 [EnrichedUser] === DADOS BRUTOS DAS EMPRESAS ===');
            console.log('🏢 [EnrichedUser] Resposta bruta da API CPE:', JSON.stringify(rawResponse, null, 2));
            
            // Usar os dados brutos diretamente (já é um array)
            if (Array.isArray(rawResponse)) {
              empresasData = rawResponse;
              console.log('✅ [EnrichedUser] Dados das empresas obtidos:', {
                totalEmpresas: empresasData.length,
                empresas: empresasData.map(emp => ({
                  cnpj: emp.cnpj,
                  nome: emp.nome,
                  isPrincipal: emp.isPrincipal,
                  codStatusEmpresa: emp.codStatusEmpresa,
                  desTipoVinculo: emp.desTipoVinculo
                }))
              });
    } else {
              console.log('ℹ️ [EnrichedUser] Resposta não é um array:', typeof rawResponse);
            }
          } catch (empresaError) {
            console.warn('⚠️ [EnrichedUser] Erro ao buscar dados das empresas:', empresaError);
            console.warn('⚠️ [EnrichedUser] Continuando sem dados das empresas...');
            // Continua sem dados das empresas - não é um erro crítico
          }
        } else {
          console.warn('⚠️ [EnrichedUser] Serviço CPE Backend não configurado');
          console.warn('⚠️ [EnrichedUser] Configuração:', cpeBackendService.getConfigInfo());
        }

      // 7. Mapear dados das empresas
      console.log('🔄 [EnrichedUser] Mapeando dados das empresas...');
      const empresasMapeadas = dataMappingService.mapCpeEmpresaData(empresasData);
      
      // 8. Combinar dados do usuário e empresas
      console.log('🔄 [EnrichedUser] Combinando dados...');
      const enrichedData = dataMappingService.combineUserAndEmpresaData(processedUserData, empresasMapeadas);

      // 9. Criar dados seguros para o frontend (INCLUINDO dados das empresas)
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

      // 10. Criar resumo para logs
      const dataSummary = dataMappingService.createDataSummary(enrichedData);
      
      const processingTime = Date.now() - startTime;
      console.log('✅ [EnrichedUser] Dados enriquecidos com sucesso:', {
        processingTime: `${processingTime}ms`,
        summary: dataSummary,
        frontendSafe: true
      });

      // 11. Retornar dados seguros para o frontend (COM dados das empresas)
      res.status(200).json(frontendSafeData);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ [EnrichedUser] Erro no enriquecimento de dados:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        processingTime: `${processingTime}ms`
      });
    
    if (error instanceof Error) {
      if (error.message.includes('Token expirado') || error.message.includes('Token inválido')) {
        this.sendError(res, 401, 'Token inválido ou expirado');
      } else if (error.message.includes('CPF não encontrado')) {
        this.sendError(res, 400, 'CPF não encontrado no token do usuário');
      } else {
        this.sendError(res, 500, `Erro interno: ${error.message}`);
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
