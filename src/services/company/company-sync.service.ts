/**
 * Serviço de Sincronização de Empresas CPE ↔ Directus
 * Responsável por sincronizar dados de empresas entre CPE Backend e Directus
 */

import axios from 'axios';
import { CpeBackendService } from '../cpe-backend.service';
import { CompaniesService } from './companies.service';
import { UsersService } from '../directus/persistence/users.service';
import { UserCompaniesService } from '../directus/persistence/user-companies.service';
import { getKeycloakValidationService } from '../keycloak-validation.service';
import type { Company, UserCompany } from '../../contracts/persistence/persistence.types';

export interface CompanySyncResult {
  hasCompanies: boolean;
  companies: any[];
  companiesCount: number;
  source: 'cpe' | 'directus' | 'both' | 'none';
  action: 'USE_EXISTING' | 'SELECT_COMPANY' | 'CREATE_COMPANY' | 'USE_SINGLE_COMPANY';
  syncPerformed: boolean;
}

export class CompanySyncService {
  private cpeBackendService = new CpeBackendService();
  private companiesService = new CompaniesService();
  private usersService = new UsersService();
  private userCompaniesService = new UserCompaniesService();

  /**
   * MÉTODO PRINCIPAL: Sincronizar empresas CPE ↔ Directus
   */
  async syncUserCompanies(cpf: string, userId: number): Promise<CompanySyncResult> {
    try {
      // 1. MÉTODO 1: Buscar empresas no CPE Backend
      const cpeCompanies = await this.fetchCpeCompanies(cpf);
      
      // 2. MÉTODO 2: Buscar empresas no Directus
      const directusCompanies = await this.fetchDirectusCompanies(userId);
      
      // 3. MÉTODO 3: Sincronizar dados (se necessário)
      const syncResult = await this.performSync(userId, cpeCompanies, directusCompanies);
      
      // 4. Determinar ação necessária
      const action = this.determineAction(syncResult.companies);
      
      const finalResult = {
        hasCompanies: syncResult.companies.length > 0,
        companies: syncResult.companies,
        companiesCount: syncResult.companies.length,
        source: this.determineSource(cpeCompanies, directusCompanies),
        action,
        syncPerformed: syncResult.syncPerformed
      };
      
      return finalResult;

    } catch (error) {
      console.error('❌ [CompanySync] Erro na sincronização:', error);
      throw error;
    }
  }

  /**
   * MÉTODO 1: Buscar empresas no CPE Backend
   */
  private async fetchCpeCompanies(cpf: string): Promise<any[]> {
    try {
      const keycloakService = getKeycloakValidationService();
      const serviceToken = await keycloakService.getServiceToken();
      
      if (!serviceToken) {
        return [];
      }

      const rawData = await this.cpeBackendService.getRawEmpresaData(cpf, serviceToken);
      
      if (!rawData || !Array.isArray(rawData)) {
        return [];
      }

      const normalizedCompanies = rawData.map((empresa: any) => ({
        cnpj: empresa.cnpj,
        nome: empresa.nome || 'Empresa',
        isPrincipal: empresa.isPrincipal || false,
        codStatusEmpresa: empresa.codStatusEmpresa || '',
        desTipoVinculo: empresa.desTipoVinculo || '',
        source: 'cpe',
        cpeData: empresa
      }));
      
      return normalizedCompanies;
    } catch (error) {
      console.error('❌ Erro ao buscar no CPE:', error);
      return [];
    }
  }

  /**
   * MÉTODO 2: Buscar empresas no Directus
   */
  private async fetchDirectusCompanies(userId: number): Promise<any[]> {
    try {
      const companies = await this.companiesService.getUserCompanies(userId);
      
      const normalizedCompanies = companies.map(company => {
        const cnpj = company.company_id.cnpj;
        const nome = company.company_id.nome;
        
        return {
          ...company,
          cnpj,
          nome,
          source: 'directus'
        };
      });
      
      return normalizedCompanies;
    } catch (error) {
      console.error('❌ Erro ao buscar no Directus:', error);
      return [];
    }
  }

  /**
   * MÉTODO 3: Sincronizar dados entre CPE e Directus
   */
  private async performSync(userId: number, cpeCompanies: any[], directusCompanies: any[]): Promise<{companies: any[], syncPerformed: boolean}> {
    let syncPerformed = false;
    let finalCompanies = [...directusCompanies];

    if (cpeCompanies.length > 0) {
      for (const cpeCompany of cpeCompanies) {
        const existingDirectus = directusCompanies.find(d => 
          this.normalizeCnpj(d.company_id?.cnpj || d.cnpj) === this.normalizeCnpj(cpeCompany.cnpj)
        );

        if (existingDirectus) {
          const needsUpdate = this.compareCompanyData(cpeCompany, existingDirectus);
          
          if (needsUpdate) {
            await this.updateCompanyInDirectus(existingDirectus, cpeCompany);
            syncPerformed = true;
            
            const directusIndex = finalCompanies.findIndex(d => 
              this.normalizeCnpj(d.company_id?.cnpj || d.cnpj) === this.normalizeCnpj(cpeCompany.cnpj)
            );
            
            if (directusIndex !== -1) {
              finalCompanies[directusIndex] = {
                ...finalCompanies[directusIndex],
                is_principal: cpeCompany.isPrincipal || false,
                cod_status_empresa: cpeCompany.codStatusEmpresa || '',
                des_tipo_vinculo: cpeCompany.desTipoVinculo || ''
              };
            }
          }
        } else {
          const newCompany = await this.createCompanyFromCpe(userId, cpeCompany);
          finalCompanies.push(newCompany);
          syncPerformed = true;
        }
      }
    }
    
    return {
      companies: finalCompanies,
      syncPerformed
    };
  }

  /**
   * Comparar dados da empresa entre CPE e Directus
   */
  private compareCompanyData(cpeCompany: any, directusCompany: any): boolean {
    const nomeChanged = cpeCompany.nome !== (directusCompany.company_id?.nome || directusCompany.nome);
    const principalChanged = cpeCompany.isPrincipal !== directusCompany.is_principal;
    const statusChanged = cpeCompany.codStatusEmpresa !== directusCompany.cod_status_empresa;
    const vinculoChanged = cpeCompany.desTipoVinculo !== directusCompany.des_tipo_vinculo;
    
    return nomeChanged || principalChanged || statusChanged || vinculoChanged;
  }

  /**
   * Atualizar empresa no Directus com dados do CPE
   */
  private async updateCompanyInDirectus(directusCompany: any, cpeCompany: any): Promise<void> {
    try {
      const companyId = directusCompany.company_id?.id || directusCompany.id;
      const companyName = directusCompany.company_id?.nome || directusCompany.nome;
      
      if (companyName !== cpeCompany.nome) {
        // Atualizar empresa no Directus usando axios
        const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
        const directusToken = process.env.DIRECTUS_TOKEN;
        
        await axios.patch(`${directusUrl}/items/companies/${companyId}`, 
          { nome: cpeCompany.nome },
          { headers: { Authorization: `Bearer ${directusToken}` } }
        );
      }
      
      const updateData: any = {
        is_principal: cpeCompany.isPrincipal || false,
        cod_status_empresa: cpeCompany.codStatusEmpresa || '',
        des_tipo_vinculo: cpeCompany.desTipoVinculo || ''
      };
      
      // Atualizar user_companies usando axios
      const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
      const directusToken = process.env.DIRECTUS_TOKEN;
      
      await axios.patch(`${directusUrl}/items/user_companies/${directusCompany.id}`, 
        updateData,
        { headers: { Authorization: `Bearer ${directusToken}` } }
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar empresa:', error);
      throw error;
    }
  }

  /**
   * Criar empresa no Directus baseada nos dados do CPE
   */
  private async createCompanyFromCpe(userId: number, cpeCompany: any): Promise<any> {
    try {
      const companyData = {
        cnpj: this.normalizeCnpj(cpeCompany.cnpj),
        nome: cpeCompany.nome
      };
      
      // Criar empresa no Directus usando axios
      const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
      const directusToken = process.env.DIRECTUS_TOKEN;
      
      const createdCompany = await axios.post(`${directusUrl}/items/companies`, 
        companyData,
        { headers: { Authorization: `Bearer ${directusToken}` } }
      );
      
      const userCompanyData = {
        user_id: userId,
        company_id: createdCompany.data.data.id,
        is_principal: cpeCompany.isPrincipal || false,
        cod_status_empresa: cpeCompany.codStatusEmpresa || '',
        des_tipo_vinculo: cpeCompany.desTipoVinculo || ''
      };
      
      // Criar user_companies usando axios
      const userCompany = await axios.post(`${directusUrl}/items/user_companies`, 
        userCompanyData,
        { headers: { Authorization: `Bearer ${directusToken}` } }
      );
      
      return {
        id: userCompany.data.data.id,
        user_id: userId,
        company_id: createdCompany.data.data.id,
        cnpj: createdCompany.data.data.cnpj,
        nome: createdCompany.data.data.nome,
        is_principal: userCompanyData.is_principal,
        cod_status_empresa: userCompanyData.cod_status_empresa,
        des_tipo_vinculo: userCompanyData.des_tipo_vinculo,
        source: 'cpe'
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar empresa do CPE:', error);
      throw error;
    }
  }

  /**
   * Determinar fonte dos dados
   */
  private determineSource(cpeCompanies: any[], directusCompanies: any[]): 'cpe' | 'directus' | 'both' | 'none' {
    const hasCpe = cpeCompanies.length > 0;
    const hasDirectus = directusCompanies.length > 0;
    
    if (hasCpe && hasDirectus) return 'both';
    if (hasCpe) return 'cpe';
    if (hasDirectus) return 'directus';
    return 'none';
  }

  /**
   * Determinar ação necessária
   */
  private determineAction(companies: any[]): 'USE_SINGLE_COMPANY' | 'SELECT_COMPANY' | 'CREATE_COMPANY' {
    if (companies.length === 0) {
      return 'CREATE_COMPANY';
    } else if (companies.length === 1) {
      return 'USE_SINGLE_COMPANY';
    } else {
      return 'SELECT_COMPANY';
    }
  }

  /**
   * Normalizar CNPJ (remover formatação)
   */
  private normalizeCnpj(cnpj: string): string {
    return cnpj ? cnpj.replace(/[^\d]/g, '') : '';
  }
}
