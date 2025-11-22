import { UsersService } from './users.service';
import { CompaniesService } from './companies.service';
import { UserCompaniesService } from './user-companies.service';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticCategoriesService } from './diagnostic-categories.service';
import { AnswersGivenService } from './answers-given.service';
import { LevelsService } from '../general/levels.service';
import { MetaSebraeService } from '../../meta-sebrae.service';
import { LegacyQuizService } from '../../legacy-quiz.service';
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
  private legacyQuizService = new LegacyQuizService();

  /**
   * Salva diagnóstico completo no Directus
   * @param requestData - Dados completos do diagnóstico
   * @param token - Token do Directus
   * @param keycloakTokenId - Token ID do Keycloak (opcional, para Meta Sebrae)
   */
  async saveCompleteDiagnostic(
    requestData: CompleteDiagnosticRequest,
    token?: string,
    keycloakTokenId?: string
  ): Promise<CompleteDiagnosticResponse> {
    try {
      console.log('[DiagnosticPersistence] Iniciando salvamento de diagnóstico completo...');
      console.log('[DiagnosticPersistence] Dados recebidos:', JSON.stringify({
        usuario: {
          cpf: requestData.usuario.cpf,
          email: requestData.usuario.email,
          empresasCount: requestData.usuario.empresa?.length || 0
        },
        diagnostico: {
          empresaSelecionada: requestData.diagnostico.empresaSelecionada,
          pontuacaoGeral: requestData.diagnostico.pontuacaoGeral,
          nivelGeral: requestData.diagnostico.nivelGeral,
          categoriasCount: requestData.diagnostico.categorias?.length || 0
        }
      }, null, 2));
      
      // Validar dados do diagnóstico antes de processar
      const diagnosticValidation = validateDiagnosticData(requestData.diagnostico);
      if (!diagnosticValidation.success) {
        console.error('[DiagnosticPersistence] Validação de diagnóstico falhou:', diagnosticValidation.error);
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
      console.log('[DiagnosticPersistence] Usuário encontrado/criado:', {
        userId: user.id,
        cpf: user.cpf,
        email: user.email
      });

      // 2. Processar todas as empresas do usuário
      console.log('[DiagnosticPersistence] Processando empresas:', requestData.usuario.empresa.length);
      const companies: Company[] = [];
      for (const empresaData of requestData.usuario.empresa) {
        console.log('[DiagnosticPersistence] Processando empresa:', {
          cnpj: empresaData.cnpj,
          nome: empresaData.nome,
          isPrincipal: empresaData.isPrincipal
        });
        
        const company = await this.companiesService.findOrCreateCompany({
          cnpj: empresaData.cnpj,
          nome: empresaData.nome
        }, token);
        
        console.log('[DiagnosticPersistence] Empresa processada:', {
          id: company.id,
          cnpj: company.cnpj,
          nome: company.nome
        });

        companies.push(company);

        // Vincular usuário à empresa
        // Converter isPrincipal para boolean se for string
        const isPrincipal = typeof empresaData.isPrincipal === 'string' 
          ? empresaData.isPrincipal === 'true' || empresaData.isPrincipal === '1'
          : Boolean(empresaData.isPrincipal);
        
        const linkData = {
          is_principal: isPrincipal,
          cod_status_empresa: empresaData.codStatusEmpresa || '',
          des_tipo_vinculo: empresaData.desTipoVinculo || ''
        };
        
        console.log('[DiagnosticPersistence] Vinculando usuário à empresa:', {
          userId: user.id,
          companyId: company.id,
          linkData
        });
        
        await this.userCompaniesService.linkUserToCompany(
          user.id,
          company.id,
          linkData,
          token
        );
        
        console.log('[DiagnosticPersistence] Usuário vinculado à empresa com sucesso');
      }

      // 3. Identificar empresa do teste atual
      // Normalizar CNPJ da empresa selecionada para comparação
      const empresaSelecionadaCnpj = requestData.diagnostico.empresaSelecionada.replace(/\D/g, '');
      const empresaSelecionada = companies.find(
        c => {
          const companyCnpj = (c.cnpj || '').replace(/\D/g, '');
          return companyCnpj === empresaSelecionadaCnpj;
        }
      );

      if (!empresaSelecionada) {
        console.error('[DiagnosticPersistence] Empresa selecionada não encontrada:', {
          empresaSelecionadaCnpj,
          empresasDisponiveis: companies.map(c => ({
            id: c.id,
            cnpj: c.cnpj,
            nome: c.nome
          }))
        });
        throw new Error(`Empresa selecionada não encontrada: ${requestData.diagnostico.empresaSelecionada}`);
      }

      // 4. Buscar ID do nível geral
      console.log('[DiagnosticPersistence] Buscando nível geral:', requestData.diagnostico.nivelGeral);
      const levels = await this.levelsService.getLevels(token);
      console.log('[DiagnosticPersistence] Níveis disponíveis:', levels.map(l => l.title));
      const generalLevel = levels.find(l => l.title === requestData.diagnostico.nivelGeral);
      
      if (!generalLevel) {
        console.error('[DiagnosticPersistence] Nível geral não encontrado:', {
          nivelGeral: requestData.diagnostico.nivelGeral,
          niveisDisponiveis: levels.map(l => l.title)
        });
        throw new Error(`Nível geral não encontrado: ${requestData.diagnostico.nivelGeral}`);
      }
      
      console.log('[DiagnosticPersistence] Nível geral encontrado:', {
        id: generalLevel.id,
        title: generalLevel.title
      });

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
      
      // Log dos dados enviados para Directus (resultados do diagnóstico)
      console.log('💾 [Directus] Dados enviados para Directus (resultados do diagnóstico):', JSON.stringify({
        diagnostic: diagnosticData,
        usuario: {
          id: user.id,
          cpf: user.cpf,
          email: user.email
        },
        empresa: {
          id: empresaSelecionada.id,
          cnpj: empresaSelecionada.cnpj,
          nome: empresaSelecionada.nome
        },
        categorias: requestData.diagnostico.categorias.map(cat => ({
          idCategoria: cat.idCategoria,
          pontuacaoCategoria: cat.pontuacaoCategoria,
          idNivelCategoria: cat.idNivelCategoria,
          totalRespostas: cat.respostasCategoria?.length || 0
        }))
      }, null, 2));
      
      const diagnostic = await this.diagnosticsService.createDiagnostic(diagnosticData, token);

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

      // Log confirmando gravação no Directus
      console.log('✅ [Directus] Dados gravados com sucesso no Directus:', JSON.stringify({
        diagnosticId: diagnostic.id,
        userId: user.id,
        companyId: empresaSelecionada.id,
        overallScore: diagnostic.overall_score,
        totalCategories: categoryResults.length,
        timestamp: new Date().toISOString()
      }, null, 2));

      // Log quando diagnóstico é finalizado
      console.log('✅ [Diagnóstico Finalizado] Diagnóstico salvo com sucesso:', JSON.stringify({
        diagnosticId: diagnostic.id,
        userId: user.id,
        companyId: empresaSelecionada.id,
        overallScore: diagnostic.overall_score,
        overallLevel: requestData.diagnostico.nivelGeral,
        totalCategories: categoryResults.length,
        timestamp: new Date().toISOString()
      }, null, 2));

      // 8. Registrar diagnóstico na API Meta Sebrae (não bloqueia se falhar)
      try {
        // Extrair data/hora de início e fim se disponíveis no requestData
        // Por padrão, usa dataRealizacao como referência
        const performedAt = new Date(requestData.diagnostico.dataRealizacao);
        const dateHourStart = requestData.diagnostico.dataRealizacao; // Pode ser melhorado no futuro para capturar início real
        const dateHourEnd = new Date(performedAt.getTime() + 60 * 60 * 1000).toISOString(); // +1 hora como padrão
        
        const metaSebraeResult = await this.metaSebraeService.registerDiagnostic(
          diagnostic,
          user,
          empresaSelecionada,
          keycloakTokenId, // Passar token do Keycloak para vincular empresa
          dateHourStart,
          dateHourEnd
        );
        
        if (metaSebraeResult) {
          console.log('✅ [Meta Sebrae] Diagnóstico registrado com sucesso na API Meta Sebrae');
        }
      } catch (metaError) {
        // Não bloquear o fluxo se a API Meta Sebrae falhar
        console.warn('[DiagnosticPersistence] Erro ao registrar na API Meta Sebrae (não crítico):', metaError instanceof Error ? metaError.message : 'Erro desconhecido');
      }

      // 9. Salvar diagnóstico no MySQL legado (não bloqueia se falhar)
      try {
        console.log('💾 [Banco Legado] Iniciando salvamento no MySQL legado...');
        
        // Converter respostas do formato CompleteDiagnosticRequest para LegacyQuizRequest
        const legacyAnswers = requestData.diagnostico.categorias.flatMap(categoria => 
          categoria.respostasCategoria.map(resposta => ({
            question_id: resposta.idPergunta,
            answer_id: resposta.idResposta,
            score: resposta.pontuacao,
            category_id: categoria.idCategoria
          }))
        );
        
        // Preparar dados do usuário para o formato legado
        const legacyUserData = {
          nome: `${requestData.usuario.given_name} ${requestData.usuario.lastName}`.trim(),
          empresa: empresaSelecionada.cnpj, // CNPJ da empresa, não o nome
          email: requestData.usuario.email,
          whatsapp: '', // Não disponível no requestData atual
          estado: requestData.usuario.uf,
          cidade: requestData.usuario.cidade,
          newsletter: false // Não disponível no requestData atual
        };
        
        const legacyResult = await this.legacyQuizService.saveQuizData(
          {
            answers: legacyAnswers,
            userData: legacyUserData
          },
          undefined // previewToken não necessário, dados já calculados
        );
        
        if (legacyResult.success) {
          console.log('✅ [Banco Legado] Diagnóstico salvo com sucesso no MySQL legado:', JSON.stringify({
            insertId: legacyResult.data?.id,
            affectedRows: legacyResult.data?.affectedRows,
            timestamp: new Date().toISOString()
          }, null, 2));
        }
      } catch (legacyError) {
        // Não bloquear o fluxo se o MySQL legado falhar
        console.warn('[DiagnosticPersistence] Erro ao salvar no MySQL legado (não crítico):', legacyError instanceof Error ? legacyError.message : 'Erro desconhecido');
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
      console.error('[DiagnosticPersistence] Stack do erro:', error instanceof Error ? error.stack : 'Sem stack');
      console.error('[DiagnosticPersistence] Tipo do erro:', typeof error);
      console.error('[DiagnosticPersistence] Erro completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw error;
    }
  }
}
