/**
 * Serviço para mapeamento e combinação de dados
 * Combina dados do Keycloak com dados da API externa CPE
 */

import { KeycloakUserData } from '../types/keycloak-validation.types';
import { 
  ProcessedUserData, 
  EmpresaData, 
  EmpresaVinculo,
  EnrichedUserData 
} from '../contracts/enriched-user.types';
import { v4 as uuidv4 } from 'uuid';

export class DataMappingService {

  /**
   * Mapeia dados do token Keycloak para a estrutura processada
   * @param keycloakData - Dados brutos do token Keycloak
   * @returns Dados processados do usuário
   */
  mapKeycloakUserData(keycloakData: KeycloakUserData): ProcessedUserData {
    console.log('🔄 [DataMapping] Mapeando dados do usuário Keycloak...');
    console.log('🔄 [DataMapping] Dados Keycloak recebidos:', JSON.stringify(keycloakData, null, 2));
    console.log('🔄 [DataMapping] Campos disponíveis:', Object.keys(keycloakData));

        const processedData: ProcessedUserData = {
          // Dados básicos
          id: keycloakData.sub,
          name: keycloakData.name,
          email: keycloakData.email,
          
          // Dados pessoais específicos do Keycloak
          given_name: keycloakData.given_name,
          lastName: keycloakData.family_name, // family_name do Keycloak
          cpf: keycloakData.cpf,
          dataNascimento: keycloakData.dataNascimento,
          genero: keycloakData.genero,
          escolaridade: keycloakData.escolaridade,
          
          // Endereço
          cidade: keycloakData.cidade,
          uf: keycloakData.uf,
          
          // Contatos
          telefoneCelular: keycloakData.telefoneCelular,
          telefoneResidencial: keycloakData.telefoneResidencial,
          telefoneTrabalho: keycloakData.telefoneTrabalho,
          
          // Dados Sebrae
          codParceiro: keycloakData.codParceiro,
          
          // Roles e permissões
          roles: keycloakData.realm_access?.roles || [],
          permissions: keycloakData.resource_access?.[keycloakData.azp]?.roles || []
        };

    console.log('✅ [DataMapping] Dados do usuário mapeados:', {
      id: processedData.id,
      name: processedData.name,
      email: processedData.email,
      cpf: processedData.cpf
    });

    return processedData;
  }

  /**
   * Mapeia dados da API CPE para a estrutura simplificada de empresa
   * @param cpeData - Dados brutos da API CPE (array de empresas)
   * @returns Array de empresas processadas
   */
  mapCpeEmpresaData(cpeData: any[]): EmpresaVinculo[] {
    console.log('🔄 [DataMapping] Mapeando dados das empresas da API CPE...');
    console.log('🔄 [DataMapping] Dados CPE recebidos:', JSON.stringify(cpeData, null, 2));

    if (!Array.isArray(cpeData)) {
      console.warn('⚠️ [DataMapping] Dados CPE não são um array:', typeof cpeData);
      return [];
    }

    const empresas: EmpresaVinculo[] = cpeData.map((empresa, index) => {
      const empresaVinculo: EmpresaVinculo = {
        id: uuidv4(), // UUID único para cada empresa
        cnpj: empresa.cnpj || '',
        nome: empresa.nome || '',
        isPrincipal: empresa.isPrincipal || false,
        codStatusEmpresa: empresa.codStatusEmpresa || '',
        desTipoVinculo: empresa.desTipoVinculo || ''
      };

      console.log(`✅ [DataMapping] Empresa ${index + 1} mapeada:`, {
        id: empresaVinculo.id,
        cnpj: empresaVinculo.cnpj,
        nome: empresaVinculo.nome,
        isPrincipal: empresaVinculo.isPrincipal
      });

      return empresaVinculo;
    });

    console.log('✅ [DataMapping] Total de empresas mapeadas:', empresas.length);
    return empresas;
  }

  /**
   * Combina dados do usuário com dados da empresa
   * @param userData - Dados processados do usuário
   * @param empresaData - Dados da empresa (opcional)
   * @returns Dados enriquecidos completos
   */
  combineUserAndEmpresaData(
    userData: ProcessedUserData, 
    empresasData: EmpresaVinculo[]
  ): EnrichedUserData {
    console.log('🔄 [DataMapping] Combinando dados do usuário e empresas...');
    
    // Garantir que empresasData seja sempre um array
    const empresasArray = Array.isArray(empresasData) ? empresasData : [];
    console.log('🔄 [DataMapping] Empresas recebidas:', JSON.stringify({
      isArray: Array.isArray(empresasData),
      length: empresasArray.length,
      type: typeof empresasData
    }, null, 2));

    const enrichedData: EnrichedUserData = {
      user: userData,
      empresas: empresasArray,
      metadata: {
        hasEmpresaData: empresasArray.length > 0,
        empresaSource: empresasArray.length > 0 ? 'cpe-backend' : null,
        lastUpdated: new Date().toISOString(),
        processingTime: Date.now()
      }
    };

    console.log('✅ [DataMapping] Dados combinados:', {
      hasUserData: !!enrichedData.user,
      hasEmpresaData: enrichedData.metadata.hasEmpresaData,
      empresaSource: enrichedData.metadata.empresaSource
    });

    if (enrichedData.empresas && enrichedData.empresas.length > 0) {
      console.log('🏢 [DataMapping] Dados das empresas incluídos:', {
        totalEmpresas: enrichedData.empresas.length,
        empresas: enrichedData.empresas.map(emp => ({
          id: emp.id,
          cnpj: emp.cnpj,
          nome: emp.nome,
          isPrincipal: emp.isPrincipal
        }))
      });
    }

    return enrichedData;
  }

  /**
   * Valida se os dados essenciais do usuário estão presentes
   * @param userData - Dados do usuário para validação
   * @returns true se válido, false caso contrário
   */
  validateUserData(userData: ProcessedUserData): boolean {
    const requiredFields = ['id', 'name', 'email', 'cpf'];
    
    for (const field of requiredFields) {
      if (!userData[field as keyof ProcessedUserData]) {
        console.error(`❌ [DataMapping] Campo obrigatório ausente: ${field}`);
        return false;
      }
    }

    // Valida formato do CPF
    const cpf = userData.cpf!.replace(/\D/g, '');
    if (cpf.length !== 11) {
      console.error(`❌ [DataMapping] CPF inválido: ${userData.cpf}`);
      return false;
    }

    console.log('✅ [DataMapping] Dados do usuário validados');
    return true;
  }

  /**
   * Valida se os dados essenciais da empresa estão presentes
   * @param empresaData - Dados da empresa para validação
   * @returns true se válido, false caso contrário
   */
  validateEmpresaData(empresaData: EmpresaData): boolean {
    const requiredFields = ['cnpj', 'razaoSocial'];
    
    for (const field of requiredFields) {
      if (!empresaData[field as keyof EmpresaData]) {
        console.error(`❌ [DataMapping] Campo obrigatório da empresa ausente: ${field}`);
        return false;
      }
    }

    console.log('✅ [DataMapping] Dados da empresa validados');
    return true;
  }

  /**
   * Cria um resumo dos dados para logs
   * @param enrichedData - Dados enriquecidos
   * @returns Resumo dos dados
   */
  createDataSummary(enrichedData: EnrichedUserData): any {
    return {
      user: {
        id: enrichedData.user.id,
        name: enrichedData.user.name,
        email: enrichedData.user.email,
        given_name: enrichedData.user.given_name,
        lastName: enrichedData.user.lastName,
        cpf: enrichedData.user.cpf,
        cidade: enrichedData.user.cidade,
        uf: enrichedData.user.uf
      },
      empresas: (enrichedData.empresas && Array.isArray(enrichedData.empresas)) 
        ? enrichedData.empresas.map(emp => ({
            id: emp.id,
            cnpj: emp.cnpj,
            nome: emp.nome,
            isPrincipal: emp.isPrincipal,
            codStatusEmpresa: emp.codStatusEmpresa,
            desTipoVinculo: emp.desTipoVinculo
          }))
        : [],
      metadata: enrichedData.metadata
    };
  }
}

// Instância singleton do serviço
export const dataMappingService = new DataMappingService();
