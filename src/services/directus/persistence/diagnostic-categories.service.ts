import { DirectusBaseService } from '../base/directus-base.service';
import { DiagnosticCategory } from '../../../contracts/persistence/persistence.types';

export class DiagnosticCategoriesService extends DirectusBaseService<DiagnosticCategory> {
  protected serviceName = 'diagnostic_categories';

  /**
   * Cria resultado de uma categoria
   */
  async createCategoryResult(categoryData: {
    diagnostic_id: number;
    category_id: number;
    level_id: number;
    score: number;
    insight: string;
    tip: string;
  }, token?: string): Promise<DiagnosticCategory> {
    console.log('[DiagnosticCategoriesService] Criando resultado de categoria:', { 
      diagnostic_id: categoryData.diagnostic_id,
      category_id: categoryData.category_id
    });
    return this.create(categoryData, token);
  }

  /**
   * Cria múltiplos resultados de categorias (batch)
   */
  async createCategoryResults(categoriesData: Array<{
    diagnostic_id: number;
    category_id: number;
    level_id: number;
    score: number;
    insight: string;
    tip: string;
  }>, token?: string): Promise<DiagnosticCategory[]> {
    console.log('[DiagnosticCategoriesService] Criando múltiplos resultados:', categoriesData.length);
    return this.createMany(categoriesData, token);
  }

  /**
   * Busca categorias de um diagnóstico
   */
  async getDiagnosticCategories(diagnosticId: number, token?: string): Promise<DiagnosticCategory[]> {
    console.log('[DiagnosticCategoriesService] Buscando categorias do diagnóstico:', diagnosticId);
    return this.fetch({
      filter: { diagnostic_id: { _eq: diagnosticId } },
      token
    });
  }
}
