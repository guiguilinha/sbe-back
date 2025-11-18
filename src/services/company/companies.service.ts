import { DirectusBaseService } from '../directus/base/directus-base.service';
import { Company } from '../../contracts/persistence/persistence.types';

// Interface para dados com join
interface UserCompanyWithDetails {
  id: number;
  user_id: number;
  company_id: Company;
  is_principal: boolean;
  cod_status_empresa: string;
  des_tipo_vinculo: string;
}

export class CompaniesService extends DirectusBaseService<Company> {
  protected serviceName = 'user_companies';
  protected endpoint = '/items/user_companies';

  /**
   * Busca empresas de um usuário
   */
  async getUserCompanies(userId: number): Promise<UserCompanyWithDetails[]> {
    try {
      // Buscar na collection user_companies e fazer join com companies
      const response = await this.fetch({
        filter: { user_id: { _eq: userId } },
        sort: ['-is_principal', 'created_at'],
        fields: ['*', 'company_id.*']
      });

      return response as unknown as UserCompanyWithDetails[];
    } catch (error) {
      console.error('[CompaniesService] Erro ao buscar empresas:', error);
      return [];
    }
  }

  /**
   * Busca empresa principal de um usuário
   */
  async getUserPrincipalCompany(userId: number): Promise<Company | null> {
    console.log('[CompaniesService] Buscando empresa principal do usuário:', userId);
    
    try {
      const response = await this.fetch({
        filter: { 
          user_id: { _eq: userId },
          is_principal: { _eq: true }
        },
        limit: 1
      });

      const company = response[0] || null;
      console.log('[CompaniesService] Empresa principal encontrada:', !!company);
      return company;
    } catch (error) {
      console.error('[CompaniesService] Erro ao buscar empresa principal:', error);
      return null;
    }
  }

  /**
   * Cria uma empresa real (com dados fornecidos pelo usuário)
   */
  async createRealCompany(userId: number, companyData: {
    cnpj: string;
    nome: string;
  }): Promise<Company> {
    console.log('[CompaniesService] Criando empresa real:', { userId, ...companyData });
    
    try {
      // 1. Criar empresa na collection 'companies'
      // Normalizar CNPJ (remover formatação) para consistência
      const normalizedCnpj = companyData.cnpj.replace(/[^\d]/g, '');
      console.log('[CompaniesService] CNPJ original:', companyData.cnpj);
      console.log('[CompaniesService] CNPJ normalizado:', normalizedCnpj);
      
      const company = {
        cnpj: normalizedCnpj,
        nome: companyData.nome
      };
      
      const createdCompany = await this.makeRequest('items/companies', {
        method: 'POST',
        data: company
      });
      console.log('[CompaniesService] Empresa criada na collection companies:', createdCompany.data.id);
      
      // 2. Criar relacionamento na collection 'user_companies'
      const userCompanyData = {
        user_id: userId,
        company_id: createdCompany.data.id,
        is_principal: true,
        cod_status_empresa: 'REVISAR',
        des_tipo_vinculo: 'NÃO VINCULADO'
      };
      
      const userCompany = await this.makeRequest('items/user_companies', {
        method: 'POST',
        data: userCompanyData
      });
      console.log('[CompaniesService] Relacionamento criado na collection user_companies:', userCompany.data.id);
      
      return createdCompany.data;
    } catch (error) {
      console.error('[CompaniesService] Erro ao criar empresa real:', error);
      throw error;
    }
  }

  /**
   * Cria uma empresa fictícia (quando usuário não fornece dados)
   */
  async createFictitiousCompany(userId: number, userCpf: string, userName: string): Promise<Company> {
    console.log('[CompaniesService] Criando empresa fictícia:', { userId, userCpf, userName });
    
    const fictitiousCnpj = `00000${userCpf}`;
    
    try {
      // 1. Criar empresa na collection 'companies'
      const companyData = {
        cnpj: fictitiousCnpj,
        nome: userName
      };
      
      console.log('[CompaniesService] Dados da empresa a ser criada:', companyData);
      
      const createdCompany = await this.makeRequest('items/companies', {
        method: 'POST',
        data: companyData
      });
      console.log('[CompaniesService] Empresa criada na collection companies:', createdCompany.data.id);
      
      // 2. Criar relacionamento na collection 'user_companies'
      const userCompanyData = {
        user_id: userId,
        company_id: createdCompany.data.id,
        is_principal: true,
        cod_status_empresa: 'FICTICIO',
        des_tipo_vinculo: 'NÃO VINCULADO'
      };
      
      console.log('[CompaniesService] Dados do relacionamento a ser criado:', userCompanyData);
      
      const userCompany = await this.makeRequest('items/user_companies', {
        method: 'POST',
        data: userCompanyData
      });
      console.log('[CompaniesService] Relacionamento criado na collection user_companies:', userCompany.data.id);
      
      return createdCompany.data;
    } catch (error) {
      console.error('[CompaniesService] Erro ao criar empresa fictícia:', error);
      console.error('[CompaniesService] Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Verifica se usuário tem empresas cadastradas
   */
  async hasUserCompanies(userId: number): Promise<boolean> {
    console.log('[CompaniesService] Verificando se usuário tem empresas:', userId);
    
    try {
      const response = await this.fetch({
        filter: { user_id: { _eq: userId } },
        limit: 1
      });
      
      const hasCompanies = response.length > 0;
      console.log('[CompaniesService] Usuário tem empresas:', hasCompanies);
      return hasCompanies;
    } catch (error) {
      console.error('[CompaniesService] Erro ao verificar empresas:', error);
      return false;
    }
  }

  /**
   * Define uma empresa como principal do usuário
   * @param userId - ID do usuário
   * @param companyId - ID da company (companies.id, NÃO user_companies.id)
   */
  async setPrincipalCompany(userId: number, companyId: number): Promise<void> {
    console.log('[CompaniesService] Definindo empresa como principal:', { userId, companyId });
    
    try {
      // 1. Buscar todas as empresas do usuário
      const companies = await this.getUserCompanies(userId);
      
      console.log('[CompaniesService] Empresas do usuário:', companies.map(c => ({
        user_companies_id: c.id,
        companies_id: c.company_id.id,
        nome: c.company_id.nome
      })));
      
      // 2. Remover is_principal de todas as empresas
      for (const company of companies) {
        if (company.is_principal) {
          console.log('[CompaniesService] Removendo is_principal de:', company.id);
          await this.makeRequest(`items/user_companies/${company.id}`, {
            method: 'PATCH',
            data: { is_principal: false }
          });
        }
      }
      
      // 3. Encontrar o user_companies.id do companyId fornecido
      const targetCompany = companies.find(c => c.company_id.id === companyId);
      
      if (!targetCompany) {
        console.error('[CompaniesService] Empresa não encontrada:', {
          userId,
          companyId,
          availableCompanies: companies.map(c => ({
            user_companies_id: c.id,
            companies_id: c.company_id.id,
            nome: c.company_id.nome
          }))
        });
        throw new Error(`Empresa não encontrada para o usuário. Company ID: ${companyId}`);
      }
      
      console.log('[CompaniesService] Definindo empresa como principal:', {
        user_companies_id: targetCompany.id,
        companies_id: targetCompany.company_id.id,
        nome: targetCompany.company_id.nome
      });
      
      // 4. Definir a empresa selecionada como principal
      await this.makeRequest(`items/user_companies/${targetCompany.id}`, {
        method: 'PATCH',
        data: { is_principal: true }
      });
      
      console.log('[CompaniesService] Empresa definida como principal com sucesso');
    } catch (error) {
      console.error('[CompaniesService] Erro ao definir empresa principal:', error);
      throw error;
    }
  }
}
