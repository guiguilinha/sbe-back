/**
 * Serviço para integração com a API Meta Sebrae
 * Registra interações de diagnóstico realizadas no sistema Meta Sebrae
 */

import axios from 'axios';
import { Diagnostic, User, Company } from '../contracts/persistence/persistence.types';

export interface MetaSebraeInteractionRequest {
  company: string; // CNPJ da empresa
  nome: string; // Nome do usuário
  date_hour_start: string; // Data e hora de início da interação (ISO 8601)
  date_hour_end: string; // Data e hora de término da interação (ISO 8601)
  carga_horaria: string; // Carga horária (ex: "1")
  theme_id: number; // ID do tema
  code_integration: string; // Código de integração único
  type: string; // Tipo de interação (ex: "APLICATIVO")
  title: string; // Título da interação
  description: string; // Descrição da interação
  credential: string; // Credencial (variável de ambiente)
  cod_projeto: string; // Código do projeto (variável de ambiente)
  cod_acao: string; // Código da ação (variável de ambiente)
  instrumento: string; // Instrumento (ex: "Diagnóstico")
  nome_realizacao: string; // Nome da realização (ex: "Atendimento Remoto")
  tipo_realizacao: string; // Tipo de realização (ex: "PRT")
  origin_id: number; // ID da origem (variável de ambiente)
  cod_meio_atendimento: number; // Código do meio de atendimento (variável de ambiente)
  cod_categoria: number; // Código da categoria (variável de ambiente)
  orientacao_cliente: string; // Orientação do cliente (ex: "orientacao")
}

export interface MetaSebraeLinkCompanyRequest {
  tokenId: string; // Token ID do Keycloak
  userId: string; // CPF do usuário
}

export interface MetaSebraeResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export class MetaSebraeService {
  private baseUrl!: string;
  private apiKey!: string;
  private timeout!: number;
  private credential!: string;
  private codProjeto!: string;
  private codAcao!: string;
  private originId!: number;
  private codMeioAtendimento!: number;
  private codCategoria!: number;
  private themeId!: number;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    // URL base da API Meta Sebrae
    this.baseUrl = process.env.META_SEBRAE_URL || 
                   process.env.META_SEBRAE_API_URL ||
                   process.env.DEVELOPMENT_META_API_URL || 
                   process.env.PRODUCTION_META_API_URL || 
                   'https://api.partner.sebraemg.com.br/v1';
    
    // API Key (JWT token)
    this.apiKey = process.env.META_SEBRAE_API_KEY || 
                  process.env.META_SEBRAE_TOKEN ||
                  process.env.DEVELOPMENT_META_API_KEY || 
                  process.env.PRODUCTION_META_API_KEY || 
                  '';
    
    this.timeout = parseInt(process.env.META_SEBRAE_TIMEOUT || '30000');
    
    // Configurações específicas da Meta Sebrae
    this.credential = process.env.META_SEBRAE_CREDENTIAL || 'maturidadedigital';
    this.codProjeto = process.env.META_SEBRAE_COD_PROJETO || '829f8355-6d5c-47de-beb8-f2c0184e2f34';
    this.codAcao = process.env.META_SEBRAE_COD_ACAO || '421588';
    this.originId = parseInt(process.env.META_SEBRAE_ORIGIN_ID || '36');
    this.codMeioAtendimento = parseInt(process.env.META_SEBRAE_COD_MEIO_ATENDIMENTO || '11');
    this.codCategoria = parseInt(process.env.META_SEBRAE_COD_CATEGORIA || '19');
    this.themeId = parseInt(process.env.META_SEBRAE_THEME_ID || '10101');
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!(this.baseUrl && this.apiKey);
  }

  /**
   * Vincula empresa no Sebrae antes de registrar interação
   * @param tokenId - Token ID do Keycloak
   * @param cpf - CPF do usuário
   * @returns true se vinculado com sucesso, false caso contrário
   */
  async linkCompany(tokenId: string, cpf: string): Promise<boolean> {
    try {
      this.loadConfig();

      if (!this.isConfigured()) {
        console.warn('⚠️ [MetaSebrae] Serviço não configurado - pulando vínculo de empresa');
        return false;
      }

      const linkData: MetaSebraeLinkCompanyRequest = {
        tokenId,
        userId: cpf
      };

      console.log('🔗 [Meta Sebrae] Vinculando empresa no Sebrae...', {
        userId: cpf,
        hasTokenId: !!tokenId
      });

      // Endpoint para vincular empresa (ajustar conforme documentação real da API)
      const linkUrl = `${this.baseUrl}/company/link`;
      
      const response = await axios.post(
        linkUrl,
        linkData,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'ApiKey': this.apiKey
          }
        }
      );

      console.log('✅ [Meta Sebrae] Empresa vinculada com sucesso:', {
        status: response.status,
        data: response.data
      });

      return true;

    } catch (error) {
      // Não bloquear o fluxo se o vínculo falhar
      console.warn('⚠️ [MetaSebrae] Erro ao vincular empresa (não crítico):', error);
      
      if (axios.isAxiosError(error)) {
        console.warn('⚠️ [MetaSebrae] Detalhes do erro de vínculo:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }

      return false;
    }
  }

  /**
   * Registra interação de diagnóstico na API Meta Sebrae
   * @param diagnostic - Dados do diagnóstico
   * @param user - Dados do usuário
   * @param company - Dados da empresa
   * @param keycloakTokenId - Token ID do Keycloak (para vincular empresa)
   * @param dateHourStart - Data/hora de início (opcional, usa performed_at se não fornecido)
   * @param dateHourEnd - Data/hora de término (opcional, usa performed_at se não fornecido)
   * @returns Resposta da API ou null se não configurado
   */
  async registerDiagnostic(
    diagnostic: Diagnostic,
    user: User,
    company: Company,
    keycloakTokenId?: string,
    dateHourStart?: string,
    dateHourEnd?: string
  ): Promise<MetaSebraeResponse | null> {
    try {
      this.loadConfig();

      if (!this.isConfigured()) {
        console.warn('⚠️ [MetaSebrae] Serviço não configurado - pulando registro');
        console.warn('⚠️ [MetaSebrae] Configuração:', {
          hasBaseUrl: !!this.baseUrl,
          hasApiKey: !!this.apiKey,
          baseUrl: this.baseUrl || 'não definido',
          timeout: this.timeout
        });
        return null;
      }

      // 1. Vincular empresa primeiro (se token disponível)
      if (keycloakTokenId && user.cpf) {
        await this.linkCompany(keycloakTokenId, user.cpf);
      }

      // 2. Preparar datas (usar performed_at como referência se não fornecido)
      const performedAt = new Date(diagnostic.performed_at);
      const startDate = dateHourStart ? new Date(dateHourStart) : performedAt;
      const endDate = dateHourEnd ? new Date(dateHourEnd) : new Date(performedAt.getTime() + 60 * 60 * 1000); // +1 hora se não fornecido

      // 3. Gerar código de integração único (usar timestamp do diagnóstico)
      const codeIntegration = performedAt.toISOString();

      // 4. Preparar dados para a API
      const interactionData: MetaSebraeInteractionRequest = {
        company: company.cnpj.replace(/\D/g, ''), // CNPJ sem formatação
        nome: user.given_name || user.email || 'Usuário',
        date_hour_start: startDate.toISOString(),
        date_hour_end: endDate.toISOString(),
        carga_horaria: "1",
        theme_id: this.themeId,
        code_integration: codeIntegration,
        type: "APLICATIVO",
        title: "Maturidade Digital",
        description: `Diagnóstico preenchido pelo usuário ${user.given_name || user.email || 'Usuário'}`,
        credential: this.credential,
        cod_projeto: this.codProjeto,
        cod_acao: this.codAcao,
        instrumento: "Diagnóstico",
        nome_realizacao: "Atendimento Remoto",
        tipo_realizacao: "PRT",
        origin_id: this.originId,
        cod_meio_atendimento: this.codMeioAtendimento,
        cod_categoria: this.codCategoria,
        orientacao_cliente: "orientacao"
      };

      // Log dos dados enviados para Meta Sebrae
      console.log('📤 [Meta Sebrae] Dados enviados para API Meta Sebrae:', JSON.stringify({
        ...interactionData,
        company: interactionData.company.substring(0, 8) + '***' // Mascarar CNPJ parcialmente
      }, null, 2));

      // 5. Fazer chamada POST para API Meta Sebrae
      const interactionUrl = `${this.baseUrl}/interaction`;
      
      const response = await axios.post<MetaSebraeResponse>(
        interactionUrl,
        [interactionData], // API espera array de interações
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'ApiKey': this.apiKey
          }
        }
      );

      // Log de confirmação de gravação na Meta Sebrae
      console.log('✅ [Meta Sebrae] Dados gravados com sucesso na API Meta Sebrae:', JSON.stringify({
        status: response.status,
        success: response.data?.success !== false,
        response: response.data,
        timestamp: new Date().toISOString()
      }, null, 2));

      return {
        success: response.data?.success !== false,
        message: 'Interação registrada com sucesso',
        data: response.data
      };

    } catch (error) {
      // Não bloquear o salvamento se a API Meta Sebrae falhar
      console.error('❌ [MetaSebrae] Erro ao registrar interação:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('❌ [MetaSebrae] Detalhes do erro:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          code: error.code,
          config: {
            url: error.config?.url,
            method: error.config?.method
          }
        });
      } else {
        console.error('❌ [MetaSebrae] Erro não é AxiosError:', {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          type: typeof error
        });
      }

      // Retornar null para indicar que o registro falhou, mas não lançar erro
      // O salvamento no Directus deve continuar normalmente
      return null;
    }
  }

  /**
   * Valida se os dados estão completos antes de enviar
   */
  private validateRequestData(
    diagnostic: Diagnostic,
    user: User,
    company: Company
  ): boolean {
    if (!diagnostic.id || !user.id || !company.id) {
      console.warn('⚠️ [MetaSebrae] Dados incompletos - IDs faltando');
      return false;
    }

    if (!user.cpf || !user.email) {
      console.warn('⚠️ [MetaSebrae] Dados do usuário incompletos');
      return false;
    }

    if (!company.cnpj || !company.nome) {
      console.warn('⚠️ [MetaSebrae] Dados da empresa incompletos');
      return false;
    }

    return true;
  }
}
