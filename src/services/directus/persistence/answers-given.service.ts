import { DirectusBaseService } from '../base/directus-base.service';
import { AnswerGiven } from '../../../contracts/persistence/persistence.types';

export class AnswersGivenService extends DirectusBaseService<AnswerGiven> {
  protected serviceName = 'answers_given';

  /**
   * Salva múltiplas respostas (batch)
   */
  async saveAnswers(answersData: Array<{
    diagnostic_category_id: number;
    question_id: number;
    answer_id: number;
    score: number;
  }>, token?: string): Promise<AnswerGiven[]> {
    console.log('[AnswersGivenService] Salvando respostas:', answersData.length);
    return this.createMany(answersData, token);
  }

  /**
   * Busca respostas de uma categoria específica
   */
  async getAnswersByDiagnosticCategory(diagnosticCategoryId: number, token?: string): Promise<AnswerGiven[]> {
    console.log('[AnswersGivenService] Buscando respostas da categoria:', diagnosticCategoryId);
    return this.fetch({
      filter: { diagnostic_category_id: { _eq: diagnosticCategoryId } },
      token
    });
  }

  /**
   * Busca todas as respostas de um diagnóstico
   */
  async getAnswersByDiagnostic(diagnosticId: number, token?: string): Promise<AnswerGiven[]> {
    console.log('[AnswersGivenService] Buscando todas as respostas do diagnóstico:', diagnosticId);
    // Precisaria de join ou buscar categorias primeiro
    // Por simplicidade, buscar por diagnostic_category_id depois de ter as categorias
    return [];
  }
}
