import { UsersService } from './users.service';
import { CompaniesService } from './companies.service';
import { UserCompaniesService } from './user-companies.service';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticCategoriesService } from './diagnostic-categories.service';
import { AnswersGivenService } from './answers-given.service';
import { LevelsService } from '../general/levels.service';
import { MetaSebraeService } from '../../meta-sebrae.service';
import { validateDiagnosticData } from '../../../validators/diagnostic.schema';
import { 
  CompleteDiagnosticRequest, 
  CompleteDiagnosticResponse,
  User,
  Company,
  Diagnostic,
  DiagnosticCategory
} from '../../../contracts/persistence/persistence.types';

export class DiagnosticPersistenceService {
  private usersService = new UsersService();
  private companiesService = new CompaniesService();
  private userCompaniesService = new UserCompaniesService();
  private diagnosticsService = new DiagnosticsService();
  private diagnosticCategoriesService = new DiagnosticCategoriesService();
  private answersGivenService = new AnswersGivenService();
  private levelsService = new LevelsService();
  private metaSebraeService = new MetaSebraeService();

  /**
   * Salva diagnóstico completo no Directus
   */
  async saveCompleteDiagnostic(
    requestData: CompleteDiagnosticRequest,
    token?: string
  ): Promise<CompleteDiagnosticResponse> {
    try {
      console.log('[DiagnosticPersistence] Iniciando salvamento de diagnóstico');

      // Validar dados do diagnóstico antes de processar
      const diagnosticValidation = validateDiagnosticData(requestData.diagnostico);
      if (!diagnosticValidation.success) {
        throw new Error(`Dados de diagnóstico inválidos: ${diagnosticValidation.error}`);
      }

      // 1. Criar/Buscar usuário
      const userDataToSave = {
        given_name: requestData.usuario.given_name,
        last_name: requestData.usuario.lastName,
        cpf: requestData.usuario.cpf,
        data_nascimento: requestData.usuario.dataNascimento,
        genero: requestData.usuario.genero,
        uf: requestData.usuario.uf,
        cidade: requestData.usuario.cidade,
        email: requestData.usuario.email
      };
      
      const user = await this.usersService.findOrCreateUser(userDataToSave, token);
      console.log(`[DiagnosticPersistence] Usuário processado: ID ${user.id}`);

      // 2. Processar todas as empresas do usuário
      const companies: Company[] = [];
      for (const empresaData of requestData.usuario.empresa) {
        const company = await this.companiesService.findOrCreateCompany({
          cnpj: empresaData.cnpj,
          nome: empresaData.nome
        }, token);

        companies.push(company);

        // Vincular usuário à empresa
        const linkData = {
          is_principal: empresaData.isPrincipal,
          cod_status_empresa: empresaData.codStatusEmpresa,
          des_tipo_vinculo: empresaData.desTipoVinculo
        };
        
        await this.userCompaniesService.linkUserToCompany(
          user.id,
          company.id,
          linkData,
          token
        );
      }
      console.log(`[DiagnosticPersistence] ${companies.length} empresa(s) processada(s)`);

      // 3. Identificar empresa do teste atual
      const empresaSelecionada = companies.find(
        c => c.cnpj === requestData.diagnostico.empresaSelecionada
      );

      if (!empresaSelecionada) {
        throw new Error(`Empresa selecionada não encontrada: ${requestData.diagnostico.empresaSelecionada}`);
      }

      // 4. Buscar ID do nível geral
      const levels = await this.levelsService.getLevels(token);
      const generalLevel = levels.find(l => l.title === requestData.diagnostico.nivelGeral);
      
      if (!generalLevel) {
        throw new Error(`Nível geral não encontrado: ${requestData.diagnostico.nivelGeral}`);
      }

      // 5. Criar diagnóstico principal
      const diagnosticData = {
        user_id: user.id,
        company_id: empresaSelecionada.id,
        performed_at: requestData.diagnostico.dataRealizacao,
        overall_level_id: generalLevel.id,
        overall_score: requestData.diagnostico.pontuacaoGeral,
        overall_insight: requestData.diagnostico.insightGeral,
        status: requestData.diagnostico.status
      };
      
      const diagnostic = await this.diagnosticsService.createDiagnostic(diagnosticData, token);
      console.log(`[DiagnosticPersistence] Diagnóstico criado: ID ${diagnostic.id}, Score: ${diagnostic.overall_score}`);

      // 6. Processar categorias
      const categoryResults: DiagnosticCategory[] = [];
      
      for (const categoria of requestData.diagnostico.categorias) {
        // Criar resultado da categoria
        const categoryResult = await this.diagnosticCategoriesService.createCategoryResult({
          diagnostic_id: diagnostic.id,
          category_id: categoria.idCategoria,
          level_id: categoria.idNivelCategoria,
          score: categoria.pontuacaoCategoria,
          insight: categoria.insightCategoria,
          tip: categoria.dicaCategoria
        }, token);

        categoryResults.push(categoryResult);

        // 7. Salvar respostas da categoria
        if (categoria.respostasCategoria && categoria.respostasCategoria.length > 0) {
          const answersData = categoria.respostasCategoria.map(resposta => ({
            diagnostic_category_id: categoryResult.id,
            question_id: resposta.idPergunta,
            answer_id: resposta.idResposta,
            score: resposta.pontuacao
          }));

          await this.answersGivenService.saveAnswers(answersData, token);
        }
      }
      console.log(`[DiagnosticPersistence] ${categoryResults.length} categoria(s) processada(s)`);

      console.log(`[DiagnosticPersistence] Diagnóstico salvo com sucesso - ID: ${diagnostic.id}, User: ${user.id}, Company: ${empresaSelecionada.id}`);

      // 8. Registrar diagnóstico na API Meta Sebrae (não bloqueia se falhar)
      try {
        const metaSebraeResult = await this.metaSebraeService.registerDiagnostic(
          diagnostic,
          user,
          empresaSelecionada
        );
        
        if (metaSebraeResult) {
          console.log('[DiagnosticPersistence] Diagnóstico registrado na API Meta Sebrae');
        }
      } catch (metaError) {
        // Não bloquear o fluxo se a API Meta Sebrae falhar
        console.warn('[DiagnosticPersistence] Erro ao registrar na API Meta Sebrae (não crítico):', metaError instanceof Error ? metaError.message : 'Erro desconhecido');
      }

      return {
        success: true,
        data: {
          user,
          company: empresaSelecionada,
          diagnostic,
          categories: categoryResults
        }
      };

    } catch (error) {
      console.error('[DiagnosticPersistence] Erro ao salvar diagnóstico:', error);
      throw error;
    }
  }
}
