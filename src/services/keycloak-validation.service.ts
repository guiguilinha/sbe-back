/**
 * Serviço para validação de tokens Keycloak
 * Valida tokens do frontend usando as credenciais do backend
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { KeycloakUserData } from '../types/keycloak-validation.types';

export class KeycloakValidationService {
  private authServerUrl!: string;
  private realm!: string;
  private clientId!: string;
  private clientSecret!: string;

  constructor() {
    // Carregar variáveis quando o serviço for usado, não na construção
    this.loadConfig();
  }

  private loadConfig() {
    this.authServerUrl = process.env.KEYCLOAK_BACKEND_AUTH_SERVER_URL || '';
    this.realm = process.env.KEYCLOAK_BACKEND_REALM || '';
    this.clientId = process.env.KEYCLOAK_BACKEND_RESOURCE || '';
    this.clientSecret = process.env.KEYCLOAK_BACKEND_SECRET || '';
    
    console.log('🔧 [KeycloakValidation] Configuração carregada:', {
      authServerUrl: this.authServerUrl,
      realm: this.realm,
      clientId: this.clientId,
      hasSecret: !!this.clientSecret
    });
  }

  /**
   * Valida um token ID do Keycloak e retorna os dados do usuário
   * @param idToken - Token ID do Keycloak
   * @returns Dados do usuário decodificados e validados
   */
  async validateIdToken(idToken: string): Promise<KeycloakUserData> {
    try {
      this.loadConfig(); // Recarregar config antes de usar

      // 1. Decodificar o token sem verificar a assinatura
      const decodedToken = jwt.decode(idToken) as any;
      
      if (!decodedToken) {
        throw new Error('Token inválido ou malformado');
      }

      // 2. Verificar se o token não expirou
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        throw new Error('Token expirado');
      }

      // 3. Verificar se o issuer está correto (comparação mais flexível)
      const expectedIssuerPattern = `/realms/${this.realm}`;
      if (!decodedToken.iss || !decodedToken.iss.includes(expectedIssuerPattern)) {
        throw new Error(`Issuer inválido. Esperado: contendo ${expectedIssuerPattern}, Recebido: ${decodedToken.iss}`);
      }

      // 4. Verificar se o audience está correto
      // O Keycloak pode usar 'aud' (audience) ou 'azp' (authorized party) dependendo da configuração
      const audience = decodedToken.aud || decodedToken.azp;
      const expectedAudience = 'maturidadedigital';
      
      if (!audience) {
        throw new Error(`Audience não encontrado no token. Esperado: ${expectedAudience}`);
      }
      
      // Aceitar tanto 'aud' quanto 'azp' se corresponderem ao client ID esperado
      if (audience !== expectedAudience && decodedToken.azp !== expectedAudience) {
        throw new Error(`Audience inválido. Esperado: ${expectedAudience}, Recebido: aud=${decodedToken.aud}, azp=${decodedToken.azp}`);
      }

      // Log de login via Keycloak (backend)
      console.log('🔑 [Keycloak Login] Validação de token realizada com sucesso');
      console.log('🔑 [Keycloak Login] Dados da resposta:', JSON.stringify(decodedToken, null, 2));

      return decodedToken as KeycloakUserData;

    } catch (error) {
      console.error('❌ [KeycloakValidation] Erro na validação:', error);
      throw new Error(`Falha na validação do token: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

      /**
       * Obtém um token de serviço do Keycloak (como gateway)
       * @returns Token de acesso para APIs externas
       */
  async getServiceToken(): Promise<string> {
    try {
      this.loadConfig(); // Recarregar config antes de usar

          if (!this.authServerUrl || !this.realm || !this.clientId || !this.clientSecret) {
            throw new Error('Configuração do Keycloak incompleta');
          }

          const tokenUrl = `${this.authServerUrl}/realms/${this.realm}/protocol/openid-connect/token`;
          
          const params = new URLSearchParams();
          params.append('grant_type', 'client_credentials');
          params.append('client_id', this.clientId);
          params.append('client_secret', this.clientSecret);

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      if (response.data.access_token) {
        return response.data.access_token;
      } else {
        throw new Error('Token de acesso não encontrado na resposta');
      }

    } catch (error) {
      console.error('❌ [KeycloakValidation] Erro ao obter token de serviço:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Erro na requisição: ${error.response?.status} - ${error.response?.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Valida o token diretamente com o Keycloak
   * @param idToken - Token ID para validação
   */
  private async validateTokenWithKeycloak(idToken: string): Promise<void> {
    try {
      const introspectUrl = `${this.authServerUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`;
      
      const params = new URLSearchParams();
      params.append('token', idToken);
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);

      const response = await axios.post(introspectUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      if (!response.data.active) {
        throw new Error('Token inativo ou inválido');
      }

      console.log('✅ [KeycloakValidation] Token validado pelo Keycloak');

    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erro na validação com Keycloak: ${error.response?.status} - ${error.response?.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Extrai o CPF do token de forma segura
   * @param userData - Dados do usuário do token
   * @returns CPF limpo (apenas números)
   */
  extractCpfFromToken(userData: KeycloakUserData): string {
    if (!userData.cpf) {
      throw new Error('CPF não encontrado no token do usuário');
    }

    // Remove formatação do CPF (pontos, traços, espaços)
    const cleanCpf = userData.cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) {
      throw new Error(`CPF inválido: ${userData.cpf}`);
    }

    console.log('🔍 [KeycloakValidation] CPF extraído:', cleanCpf);
    
    return cleanCpf;
  }
}

// Instância singleton do serviço - será criada depois do carregamento das variáveis
let keycloakValidationService: KeycloakValidationService;

export function getKeycloakValidationService(): KeycloakValidationService {
  if (!keycloakValidationService) {
    keycloakValidationService = new KeycloakValidationService();
  }
  return keycloakValidationService;
}
