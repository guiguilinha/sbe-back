/**
 * Serviço para integração com a API Meta Sebrae
 * Registra diagnósticos realizados no sistema Meta Sebrae
 */

import axios from 'axios';
import { Diagnostic, User, Company } from '../contracts/persistence/persistence.types';

export interface MetaSebraeRequest {
  diagnosticId: number;
  userId: number;
  companyId: number;
  userCpf: string;
  userEmail: string;
  companyCnpj: string;
  companyName: string;
  overallScore: number;
  overallLevel: string;
  performedAt: string;
}

export interface MetaSebraeResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export class MetaSebraeService {
  private baseUrl!: string;
  private apiToken!: string;
  private timeout!: number;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    this.baseUrl = process.env.META_SEBRAE_URL || 
                   process.env.DEVELOPMENT_META_API_URL || 
                   process.env.PRODUCTION_META_API_URL || 
                   '';
    this.apiToken = process.env.META_SEBRAE_TOKEN || 
                    process.env.DEVELOPMENT_META_API_KEY || 
                    process.env.PRODUCTION_META_API_KEY || 
                    '';
    this.timeout = parseInt(process.env.META_SEBRAE_TIMEOUT || '10000');
    
    console.log('🔧 [MetaSebrae] Configuração carregada:', {
      baseUrl: this.baseUrl,
      hasToken: !!this.apiToken,
      timeout: this.timeout,
      configured: this.isConfigured()
    });
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!(this.baseUrl && this.apiToken);
  }

  /**
   * Registra diagnóstico na API Meta Sebrae
   * @param diagnostic - Dados do diagnóstico
   * @param user - Dados do usuário
   * @param company - Dados da empresa
   * @returns Resposta da API ou null se não configurado
   */
  async registerDiagnostic(
    diagnostic: Diagnostic,
    user: User,
    company: Company
  ): Promise<MetaSebraeResponse | null> {
    try {
      this.loadConfig(); // Recarregar config antes de usar

      if (!this.isConfigured()) {
        console.warn('⚠️ [MetaSebrae] Serviço não configurado - pulando registro');
        return null;
      }

      console.log('📤 [MetaSebrae] Registrando diagnóstico na API Meta Sebrae...');
      console.log('📋 [MetaSebrae] Dados do diagnóstico:', {
        diagnosticId: diagnostic.id,
        userId: user.id,
        companyId: company.id,
        overallScore: diagnostic.overall_score
      });

      // Preparar dados para a API
      const requestData: MetaSebraeRequest = {
        diagnosticId: diagnostic.id,
        userId: user.id,
        companyId: company.id,
        userCpf: user.cpf,
        userEmail: user.email,
        companyCnpj: company.cnpj,
        companyName: company.nome,
        overallScore: diagnostic.overall_score,
        overallLevel: `Nível ${diagnostic.overall_level_id}`, // Ajustar conforme necessário
        performedAt: diagnostic.performed_at
      };

      console.log('📤 [MetaSebrae] Dados a serem enviados:', JSON.stringify(requestData, null, 2));

      // Fazer chamada POST para API Meta Sebrae
      const response = await axios.post<MetaSebraeResponse>(
        `${this.baseUrl}/diagnosticos`,
        requestData,
        {
          timeout: this.timeout,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      console.log('✅ [MetaSebrae] Diagnóstico registrado com sucesso');
      console.log('📊 [MetaSebrae] Resposta da API:', {
        status: response.status,
        success: response.data.success
      });

      return response.data;

    } catch (error) {
      // Não bloquear o salvamento se a API Meta Sebrae falhar
      console.error('❌ [MetaSebrae] Erro ao registrar diagnóstico:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('❌ [MetaSebrae] Detalhes do erro:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
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

