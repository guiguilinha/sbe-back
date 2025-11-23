/**
 * Serviço para integração com a API externa CPE Backend
 * Busca dados da empresa baseado no CPF do usuário
 */

import axios from 'axios';
import type { CpeBackendResponse } from '../types/keycloak-validation.types';
import { EmpresaData } from '../contracts/enriched-user.types';

export class CpeBackendService {
  private baseUrl!: string;
  private timeout!: number;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    this.baseUrl = process.env.CPE_BACKEND_URL || '';
    this.timeout = parseInt(process.env.CPE_BACKEND_TIMEOUT || '10000');
    
    console.log('🔧 [CpeBackend] Configuração carregada:', {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      configured: this.isConfigured()
    });
  }

  /**
   * Busca dados da empresa pelo CPF
   * @param cpf - CPF do usuário (apenas números)
   * @param serviceToken - Token de serviço do Keycloak
   * @returns Dados da empresa ou null se não encontrada
   */
  async getEmpresaData(cpf: string, serviceToken: string): Promise<EmpresaData | null> {
    try {
      this.loadConfig(); // Recarregar config antes de usar
      console.log('🏢 [CpeBackend] Buscando dados da empresa para CPF:', cpf);

      if (!serviceToken) {
        throw new Error('Token de serviço não fornecido');
      }

      const url = `${this.baseUrl}/vinculo-empresa?cpf=${cpf}`;
      
      const response = await axios.get<CpeBackendResponse>(url, {
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceToken}`
        }
      });

          if (response.status === 200 && response.data) {
            console.log('✅ [CpeBackend] Dados da empresa encontrados');
            console.log('✅ [CpeBackend] Dados recebidos (tipo):', typeof response.data);
            console.log('✅ [CpeBackend] Dados recebidos (completo):', JSON.stringify(response.data, null, 2));
            
            // Valida se os dados essenciais estão presentes
            const empresaData = this.validateEmpresaData(response.data);
            
            if (empresaData) {
              console.log('✅ [CpeBackend] Dados da empresa validados:', {
                cnpj: empresaData.cnpj,
                razaoSocial: empresaData.razaoSocial,
                nomeFantasia: empresaData.nomeFantasia
              });
              
              return empresaData;
            } else {
              console.log('⚠️ [CpeBackend] Dados da empresa não passaram na validação');
            }
          }

      console.log('ℹ️ [CpeBackend] Nenhuma empresa encontrada para o CPF');
      return null;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.log('ℹ️ [CpeBackend] Empresa não encontrada (404)');
          return null;
        }
        
        console.error('❌ [CpeBackend] Erro na API:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        throw new Error(`Erro na API CPE: ${error.response?.status} - ${error.response?.statusText}`);
      }
      
      if (error instanceof Error && 'code' in error && error.code === 'ECONNABORTED') {
        throw new Error('Timeout na consulta à API CPE');
      }
      
      console.error('❌ [CpeBackend] Erro inesperado:', error);
      throw new Error(`Erro inesperado na API CPE: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

      /**
       * Valida e normaliza os dados da empresa retornados pela API
       * @param rawData - Dados brutos da API
       * @returns Dados validados ou null se inválidos
       */
      private validateEmpresaData(rawData: any): EmpresaData | null {
        try {
          console.log('🔍 [CpeBackend] Validando dados da empresa...');
          console.log('🔍 [CpeBackend] Dados recebidos para validação:', JSON.stringify(rawData, null, 2));
          
          // Se for um array, pegar o primeiro item
          let dataToValidate = rawData;
          if (Array.isArray(rawData) && dataToValidate.length > 0) {
            console.log('🔍 [CpeBackend] É um array, pegando primeiro item');
            dataToValidate = rawData[0];
            console.log('🔍 [CpeBackend] Primeiro item:', JSON.stringify(dataToValidate, null, 2));
          }
          
          // Verifica se os campos essenciais estão presentes
          if (!dataToValidate.cnpj || !dataToValidate.razaoSocial) {
            console.warn('⚠️ [CpeBackend] Dados da empresa incompletos:', {
              hasCnpj: !!dataToValidate.cnpj,
              hasRazaoSocial: !!dataToValidate.razaoSocial,
              cnpj: dataToValidate.cnpj,
              razaoSocial: dataToValidate.razaoSocial
            });
            return null;
          }

      // Mapeia os dados para a interface EmpresaData
      const empresaData: EmpresaData = {
        cnpj: dataToValidate.cnpj,
        porte: dataToValidate.porte || 0,
        naturezaJuridicaSebrae: dataToValidate.naturezaJuridicaSebrae || 0,
        naturezaJuridicaConcla: dataToValidate.naturezaJuridicaConcla || 0,
        situacaoCadastral: dataToValidate.situacaoCadastral || '',
        cnaeFiscalPrimario: dataToValidate.cnaeFiscalPrimario || '',
        cep: dataToValidate.cep || '',
        razaoSocial: dataToValidate.razaoSocial,
        nomeFantasia: dataToValidate.nomeFantasia || '',
        dataOpcaoSimples: dataToValidate.dataOpcaoSimples,
        dataExclusaoSimples: dataToValidate.dataExclusaoSimples,
        opcaoSimples: dataToValidate.opcaoSimples || false,
        opcaoMei: dataToValidate.opcaoMei || false,
        capitalSocial: dataToValidate.capitalSocial || 0,
        tipoLogradouro: dataToValidate.tipoLogradouro || '',
        logradouro: dataToValidate.logradouro || '',
        numeroLogradouro: dataToValidate.numeroLogradouro || '',
        complemento: dataToValidate.complemento,
        bairro: dataToValidate.bairro || '',
        numeroLocalidade: dataToValidate.numeroLocalidade || '',
        uf: dataToValidate.uf || '',
        matriz: dataToValidate.matriz || '',
        dataAberturaEmpresa: dataToValidate.dataAberturaEmpresa || '',
        dataFechamento: dataToValidate.dataFechamento,
        dataSituacaoCadastral: dataToValidate.dataSituacaoCadastral || '',
        quantidadeFuncionarios: dataToValidate.quantidadeFuncionarios || 0,
        quantidadeSocios: dataToValidate.quantidadeSocios || 0,
        socios: dataToValidate.socios || [],
        cnaes: dataToValidate.cnaes || [],
        cnaePrimario: dataToValidate.cnaePrimario || [],
        cpfPessoaResponsavel: dataToValidate.cpfPessoaResponsavel || '',
        nomPessoaFisicaResponsavel: dataToValidate.nomPessoaFisicaResponsavel || '',
        codNaturezaJuridicaSas: dataToValidate.codNaturezaJuridicaSas || 0,
        naturezaJuridicaSas: dataToValidate.naturezaJuridicaSas || '',
        codSituacaoCadastralSas: dataToValidate.codSituacaoCadastralSas || '',
        situacaoCadastralSas: dataToValidate.situacaoCadastralSas || '',
        comunicacoes: dataToValidate.comunicacoes || [],
        codStatusEmpresa: dataToValidate.codStatusEmpresa || '',
        desStatusEmpresa: dataToValidate.desStatusEmpresa || '',
        isCpeOficial: dataToValidate.isCpeOficial || false,
        isQuarentena: dataToValidate.isQuarentena || false
      };

      return empresaData;

    } catch (error) {
      console.error('❌ [CpeBackend] Erro na validação dos dados:', error);
      return null;
    }
  }

      /**
       * Busca dados brutos da empresa (sem processamento)
       * @param cpf - CPF do usuário
       * @param serviceToken - Token de serviço do Keycloak
       * @returns Resposta bruta da API
       */
      async getRawEmpresaData(cpf: string, serviceToken: string): Promise<any> {
        try {
          if (!this.baseUrl) {
            throw new Error('URL da API CPE não configurada');
          }

          if (!serviceToken) {
            throw new Error('Token de serviço não fornecido');
          }

          const url = `${this.baseUrl}/vinculo-empresa?cpf=${cpf}`;

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      
      return response.data;

    } catch (error) {
      console.error('❌ [CpeBackend] Erro ao buscar dados brutos:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ [CpeBackend] Status do erro:', error.response?.status);
        console.error('❌ [CpeBackend] Dados do erro:', error.response?.data);
      }
      throw error;
    }
  }

  /**
   * Verifica se o serviço está configurado corretamente
   * @returns true se configurado, false caso contrário
   */
  isConfigured(): boolean {
    return !!(this.baseUrl && this.baseUrl.length > 0);
  }

  /**
   * Retorna informações de configuração do serviço (sem dados sensíveis)
   * @returns Objeto com informações de configuração
   */
  getConfigInfo(): { baseUrl: string; timeout: number; configured: boolean } {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      configured: this.isConfigured()
    };
  }
}

// Instância singleton do serviço - será criada depois do carregamento das variáveis
let cpeBackendService: CpeBackendService;

export function getCpeBackendService(): CpeBackendService {
  if (!cpeBackendService) {
    cpeBackendService = new CpeBackendService();
  }
  return cpeBackendService;
}
