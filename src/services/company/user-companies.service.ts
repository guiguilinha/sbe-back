import { DirectusBaseService } from '../directus/base/directus-base.service';
import { UserCompany } from '../../contracts/persistence/persistence.types';

export class UserCompaniesService extends DirectusBaseService<UserCompany> {
  protected serviceName = 'user_companies';
  protected endpoint = '/items/user_companies';

  /**
   * Busca relacionamentos usuário-empresa
   */
  async getUserCompanyRelations(userId: number): Promise<UserCompany[]> {
    console.log('[UserCompaniesService] Buscando relacionamentos do usuário:', userId);
    
    try {
      const response = await this.fetch({
        filter: { user_id: { _eq: userId } },
        sort: ['-is_principal', 'created_at']
      });

      console.log('[UserCompaniesService] Relacionamentos encontrados:', response.length);
      return response;
    } catch (error) {
      console.error('[UserCompaniesService] Erro ao buscar relacionamentos:', error);
      return [];
    }
  }

  /**
   * Cria relacionamento usuário-empresa
   */
  async createUserCompanyRelation(userId: number, companyId: number, isPrincipal: boolean = false): Promise<UserCompany> {
    console.log('[UserCompaniesService] Criando relacionamento:', { userId, companyId, isPrincipal });
    
    const relation = {
      user_id: userId,
      company_id: companyId,
      is_principal: isPrincipal
    };

    try {
      const createdRelation = await this.create(relation);
      console.log('[UserCompaniesService] Relacionamento criado:', createdRelation.id);
      return createdRelation;
    } catch (error) {
      console.error('[UserCompaniesService] Erro ao criar relacionamento:', error);
      throw error;
    }
  }

  /**
   * Verifica se usuário tem relacionamentos com empresas
   */
  async hasUserCompanyRelations(userId: number): Promise<boolean> {
    console.log('[UserCompaniesService] Verificando relacionamentos do usuário:', userId);
    
    try {
      const relations = await this.getUserCompanyRelations(userId);
      const hasRelations = relations.length > 0;
      console.log('[UserCompaniesService] Usuário tem relacionamentos:', hasRelations);
      return hasRelations;
    } catch (error) {
      console.error('[UserCompaniesService] Erro ao verificar relacionamentos:', error);
      return false;
    }
  }
}
