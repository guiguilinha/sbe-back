import { DirectusBaseService } from '../base/directus-base.service';
import { Company } from '../../../contracts/persistence/persistence.types';
import { validateCompanyData } from '../../../validators/company.schema';

export class CompaniesService extends DirectusBaseService<Company> {
  protected serviceName = 'companies';

  /**
   * Cria uma nova empresa
   */
  async createCompany(companyData: {
    cnpj: string;
    nome: string;
  }, token?: string): Promise<Company> {
    console.log('[CompaniesService] Criando nova empresa:', { cnpj: companyData.cnpj });
    return this.create(companyData, token);
  }

  /**
   * Busca empresa por CNPJ (identificador único)
   */
  async getCompanyByCnpj(cnpj: string, token?: string): Promise<Company | null> {
    console.log('[CompaniesService] Buscando empresa por CNPJ:', cnpj);
    const companies = await this.fetch({
      filter: { cnpj: { _eq: cnpj } },
      limit: 1,
      token
    });
    return companies[0] || null;
  }

  /**
   * Atualiza dados da empresa
   */
  async updateCompany(id: number, companyData: Partial<Company>, token?: string): Promise<Company> {
    console.log('[CompaniesService] Atualizando empresa:', id);
    return this.update(id, companyData, token);
  }

  /**
   * Busca empresa por ID
   */
  async getCompanyById(id: number, token?: string): Promise<Company> {
    console.log('[CompaniesService] Buscando empresa por ID:', id);
    return this.getById(id, token);
  }

  /**
   * Verifica se empresa existe, se não cria uma nova
   */
  async findOrCreateCompany(companyData: {
    cnpj: string;
    nome: string;
  }, token?: string): Promise<Company> {
    console.log('[CompaniesService] Verificando existência da empresa...');
    
    // Normalizar CNPJ (remover formatação)
    const normalizedCnpj = companyData.cnpj.replace(/\D/g, '');
    
    // Verificar se é CNPJ fictício (começa com 00000)
    const isFictitiousCnpj = normalizedCnpj.startsWith('00000');
    
    // Validar dados antes de processar (pular validação de dígitos verificadores para CNPJs fictícios)
    if (!isFictitiousCnpj) {
      const validation = validateCompanyData(companyData);
      if (!validation.success) {
        throw new Error(`Dados de empresa inválidos: ${validation.error}`);
      }
    } else {
      // Para CNPJs fictícios, apenas validar formato básico
      if (normalizedCnpj.length !== 14) {
        throw new Error(`CNPJ fictício deve ter 14 dígitos`);
      }
      if (!companyData.nome || companyData.nome.trim().length === 0) {
        throw new Error(`Nome da empresa é obrigatório`);
      }
    }
    
    // Buscar empresa com CNPJ normalizado
    const existingCompany = await this.getCompanyByCnpj(normalizedCnpj, token);
    
    if (existingCompany) {
      console.log('[CompaniesService] Empresa já existe, retornando existente');
      return existingCompany;
    }
    
    console.log('[CompaniesService] Empresa não existe, criando nova');
    // Criar empresa com CNPJ normalizado
    return this.createCompany({
      cnpj: normalizedCnpj,
      nome: companyData.nome
    }, token);
  }
}
