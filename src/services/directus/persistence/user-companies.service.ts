import { DirectusBaseService } from '../base/directus-base.service';
import { UserCompany } from '../../../contracts/persistence/persistence.types';

export class UserCompaniesService extends DirectusBaseService<UserCompany> {
  protected serviceName = 'user_companies';

  /**
   * Vincula usuário a uma empresa
   * Evita duplicação verificando se o vínculo já existe.
   * Se existir, atualiza os dados se necessário.
   */
  async linkUserToCompany(
    userId: number, 
    companyId: number, 
    linkData: {
      is_principal: boolean;
      cod_status_empresa: string;
      des_tipo_vinculo: string;
    }, 
    token?: string
  ): Promise<UserCompany> {
    // Verificar se vínculo já existe
    const existing = await this.getUserCompanyLink(userId, companyId, token);
    
    if (existing) {
      // Verificar se os dados mudaram e precisam ser atualizados
      const needsUpdate = 
        existing.is_principal !== linkData.is_principal ||
        existing.cod_status_empresa !== linkData.cod_status_empresa ||
        existing.des_tipo_vinculo !== linkData.des_tipo_vinculo;
      
      if (needsUpdate) {
        console.log('[UserCompaniesService] Vínculo existe mas dados mudaram, atualizando...');
        return this.update(existing.id, linkData, token);
      }
      
      console.log('[UserCompaniesService] Vínculo já existe e está atualizado');
      return existing;
    }
    
    // Criar novo vínculo
    console.log('[UserCompaniesService] Criando novo vínculo usuário-empresa');
    return this.create({
      user_id: userId,
      company_id: companyId,
      ...linkData
    }, token);
  }

  /**
   * Busca vínculo específico entre usuário e empresa
   */
  async getUserCompanyLink(userId: number, companyId: number, token?: string): Promise<UserCompany | null> {
    const links = await this.fetch({
      filter: { 
        user_id: { _eq: userId },
        company_id: { _eq: companyId }
      },
      limit: 1,
      token
    });
    return links[0] || null;
  }

  /**
   * Busca todas as empresas de um usuário
   */
  async getUserCompanies(userId: number, token?: string): Promise<UserCompany[]> {
    console.log('[UserCompaniesService] Buscando empresas do usuário:', userId);
    return this.fetch({
      filter: { user_id: { _eq: userId } },
      token
    });
  }

  /**
   * Busca todos os usuários de uma empresa
   */
  async getCompanyUsers(companyId: number, token?: string): Promise<UserCompany[]> {
    console.log('[UserCompaniesService] Buscando usuários da empresa:', companyId);
    return this.fetch({
      filter: { company_id: { _eq: companyId } },
      token
    });
  }

  /**
   * Desvincula usuário de uma empresa
   */
  async unlinkUserFromCompany(userId: number, companyId: number, token?: string): Promise<void> {
    console.log('[UserCompaniesService] Desvinculando usuário da empresa:', { userId, companyId });
    
    const link = await this.getUserCompanyLink(userId, companyId, token);
    if (link) {
      await this.delete(link.id, token);
    }
  }
}
