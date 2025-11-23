import { DirectusBaseService } from '../base/directus-base.service';
import { Diagnostic } from '../../../contracts/persistence/persistence.types';

export class DiagnosticsService extends DirectusBaseService<Diagnostic> {
  protected serviceName = 'diagnostics';

  /**
   * Cria um novo diagnóstico
   */
  async createDiagnostic(diagnosticData: {
    user_id: number;
    company_id: number;
    performed_at: string;
    overall_level_id: number;
    overall_score: number;
    overall_insight: string;
    status: string;
  }, token?: string): Promise<Diagnostic> {
    console.log('[DiagnosticsService] Criando novo diagnóstico:', {
      user_id: diagnosticData.user_id,
      company_id: diagnosticData.company_id
    });
    return this.create(diagnosticData, token);
  }

  /**
   * Busca diagnósticos de um usuário
   */
  async getUserDiagnostics(userId: number, token?: string): Promise<Diagnostic[]> {
    console.log('[DiagnosticsService] Buscando diagnósticos do usuário:', {
      userId,
      userIdType: typeof userId,
      tokenProvided: !!token
    });

    const result = await this.fetch({
      filter: { user_id: { _eq: userId } },
      sort: ['-performed_at'],
      token
    });

    console.log('[DiagnosticsService] Resultado da busca:', {
      count: result.length,
      diagnostics: result.map(d => ({
        id: d.id,
        user_id: d.user_id,
        user_idType: typeof d.user_id,
        overall_score: d.overall_score
      }))
    });

    return result;
  }

  /**
   * Busca diagnósticos de um usuário com dados completos (empresa, categorias, respostas)
   * @param userId - ID do usuário
   * @param token - Token do Directus
   * @param page - Número da página (começa em 1)
   * @param limit - Quantidade de itens por página
   * @returns Objeto com dados e metadados de paginação
   */
  async getUserDiagnosticsWithDetails(
    userId: number,
    token?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    try {
      console.log('[DiagnosticsService] getUserDiagnosticsWithDetails - Parâmetros:', {
        userId,
        userIdType: typeof userId,
        page,
        limit,
        tokenProvided: !!token
      });

      // Calcular offset
      const offset = (page - 1) * limit;

      // Garantir que userId seja número
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      if (isNaN(numericUserId)) {
        throw new Error(`userId inválido: ${userId} (tipo: ${typeof userId})`);
      }

      const filterObj = { user_id: { _eq: numericUserId } };
      console.log('[DiagnosticsService] ⚠️ BUSCA DE DIAGNÓSTICOS:');
      console.log('[DiagnosticsService] - Collection: "diagnostics" (serviceName)');
      console.log('[DiagnosticsService] - Endpoint: items/diagnostics');
      console.log('[DiagnosticsService] - Filtro aplicado:', JSON.stringify(filterObj, null, 2));
      console.log('[DiagnosticsService] - userId usado:', numericUserId, '(tipo:', typeof numericUserId, ')');
      console.log('[DiagnosticsService] - Ordenação: -performed_at (mais recente primeiro)');
      console.log('[DiagnosticsService] - Paginação: page', page, ', limit', limit, ', offset', offset);

      // Buscar diagnósticos básicos com paginação
      const diagnostics = await this.fetch({
        filter: filterObj,
        sort: ['-performed_at'],
        limit,
        offset,
        token
      });

      console.log('[DiagnosticsService] Diagnósticos encontrados:', {
        count: diagnostics.length,
        userId: numericUserId
      });

      // Calcular total de diagnósticos para metadados
      // Para performance, usar estimativa: se temos menos que o limit, então total = offset + count
      // Se temos exatamente o limit, pode haver mais, mas para o dashboard não precisamos do total exato
      // Vamos fazer uma query adicional apenas se realmente necessário (quando limit = count)
      let total = offset + diagnostics.length;
      
      // Se temos exatamente o limit de resultados, pode haver mais
      // Mas para o dashboard (limit=15), não precisamos do total exato, apenas uma estimativa
      // Se realmente precisar do total exato, fazer query adicional (mas raramente necessário)
      if (diagnostics.length === limit && diagnostics.length > 0) {
        // Para o dashboard, não precisamos do total exato, apenas indicar que pode haver mais
        // Usar uma estimativa: total = pelo menos (offset + limit)
        total = offset + limit; // Estimativa mínima
      }
      
      console.log('[DiagnosticsService] Total estimado de diagnósticos:', total);

      // Agora buscar dados relacionados para cada diagnóstico em paralelo
      const diagnosticsWithDetails = await Promise.all(
        diagnostics.map(async (diagnostic) => {
          try {
            // Buscar empresa e categorias em paralelo
            const [company, categories] = await Promise.all([
              this.getCompanyById(diagnostic.company_id, token),
              this.getDiagnosticCategories(diagnostic.id, token)
            ]);

            // Para cada categoria, buscar respostas em paralelo
            const categoriesWithAnswers = await Promise.all(
              categories.map(async (category) => {
                const answers = await this.getCategoryAnswers(category.id, token);
                return {
                  ...category,
                  respostas: answers
                };
              })
            );

            return {
              ...diagnostic,
              company,
              categorias: categoriesWithAnswers
            };
          } catch (error) {
            console.error(`[DiagnosticsService] Erro ao buscar detalhes do diagnóstico ${diagnostic.id}:`, error);
            return {
              ...diagnostic,
              company: null,
              categorias: []
            };
          }
        })
      );

      return {
        data: diagnosticsWithDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      console.error('[DiagnosticsService] Erro ao buscar diagnósticos:', error);
      console.error('[DiagnosticsService] Detalhes do erro:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Busca dados de uma empresa
   */
  private async getCompanyById(companyId: number, token?: string): Promise<any> {
    console.log('[DiagnosticsService] Buscando dados da empresa:', companyId);

    try {
      const response = await this.makeRequest<any[]>('items/companies', {
        method: 'GET',
        params: {
          filter: { id: { _eq: companyId } },
          fields: ['id', 'nome', 'cnpj', 'created_at', 'updated_at']
        },
        token
      });

      console.log('[DiagnosticsService] Resposta da empresa:', response);
      return response.data?.[0] || null;
    } catch (error) {
      console.error('[DiagnosticsService] Erro ao buscar empresa:', error);
      return null;
    }
  }

  /**
   * Busca categorias de um diagnóstico
   */
  private async getDiagnosticCategories(diagnosticId: number, token?: string): Promise<any[]> {
    console.log('[DiagnosticsService] Buscando categorias do diagnóstico:', diagnosticId);

    try {
      const response = await this.makeRequest<any[]>('items/diagnostic_categories', {
        method: 'GET',
        params: {
          filter: { diagnostic_id: { _eq: diagnosticId } },
          fields: [
            'id',
            'diagnostic_id',
            'category_id',
            'level_id',
            'score',
            'insight',
            'tip'
          ]
        },
        token
      });

      console.log('[DiagnosticsService] Categorias encontradas:', response.data?.length || 0);
      return response.data || [];
    } catch (error) {
      console.error('[DiagnosticsService] Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Busca respostas de uma categoria
   */
  private async getCategoryAnswers(categoryId: number, token?: string): Promise<any[]> {
    console.log('[DiagnosticsService] Buscando respostas da categoria:', categoryId);

    try {
      const response = await this.makeRequest<any[]>('items/answers_given', {
        method: 'GET',
        params: {
          filter: { diagnostic_category_id: { _eq: categoryId } },
          fields: [
            'id',
            'diagnostic_category_id',
            'question_id',
            'answer_id',
            'score'
          ]
        },
        token
      });

      console.log('[DiagnosticsService] Respostas encontradas:', response.data?.length || 0);
      return response.data || [];
    } catch (error) {
      console.error('[DiagnosticsService] Erro ao buscar respostas:', error);
      return [];
    }
  }

  /**
   * Busca diagnósticos de uma empresa
   */
  async getCompanyDiagnostics(companyId: number, token?: string): Promise<Diagnostic[]> {
    console.log('[DiagnosticsService] Buscando diagnósticos da empresa:', companyId);
    return this.fetch({
      filter: { company_id: { _eq: companyId } },
      sort: ['-performed_at'],
      token
    });
  }

  /**
   * Busca diagnóstico por ID
   */
  async getDiagnosticById(id: number, token?: string): Promise<Diagnostic> {
    console.log('[DiagnosticsService] Buscando diagnóstico por ID:', id);
    return this.getById(id, token);
  }

  /**
   * Atualiza status do diagnóstico
   */
  async updateDiagnosticStatus(id: number, status: string, token?: string): Promise<Diagnostic> {
    console.log('[DiagnosticsService] Atualizando status do diagnóstico:', { id, status });
    return this.update(id, { status }, token);
  }
}
