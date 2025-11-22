import { createMySQLConnection } from '../config/mysql.config';
import { LegacyQuizRequest, LegacyQuizResponse, LegacyQuizMapping, UserAnswer } from '../contracts/legacy-quiz.types';
import { AnswersService } from './directus/quiz/answers.service';
import { ResultsService } from './directus/results.service';
import { CalculatedResult } from '../contracts/results/calculated-result.types';
import { QuizAnswer } from '../contracts/quiz/answers.types';

export class LegacyQuizService {
  private answersCache: QuizAnswer[] | null = null;

  async saveQuizData(request: LegacyQuizRequest, previewToken?: string): Promise<LegacyQuizResponse> {
    const startTime = Date.now();
    let connection;
    
    try {
      // ETAPA 1: Criar conexão MySQL
      try {
        connection = await createMySQLConnection();
        
        // Log confirmando conexão com banco legado
        console.log('✅ [Banco Legado] Conexão estabelecida com sucesso:', JSON.stringify({
          threadId: (connection as any).threadId || 'N/A',
          state: (connection as any).state || 'N/A',
          connected: true,
          timestamp: new Date().toISOString()
        }, null, 2));
      } catch (mysqlError) {
        console.error('❌ [LegacyQuizService] Erro ao criar conexão MySQL:', mysqlError);
        throw new Error(`Erro ao conectar no MySQL: ${mysqlError instanceof Error ? mysqlError.message : String(mysqlError)}`);
      }

      // ETAPA 2: REUTILIZAR cálculo já existente (não recalcular!)
      let calculatedResult: CalculatedResult;
      try {
        // ResultsService.calculateResult não aceita previewToken, apenas answers
        calculatedResult = await ResultsService.calculateResult({ 
          answers: request.answers as any // UserAnswer é compatível com AnswerPayload
        });
      } catch (error) {
        console.error('❌ [LegacyQuizService] Erro ao calcular resultado:', error);
        throw new Error(`Erro ao calcular resultado: ${error instanceof Error ? error.message : String(error)}`);
      }

      // ETAPA 3: Buscar dados do quiz do Directus para obter textos das respostas
      let answersCache: QuizAnswer[];
      try {
        const answersService = new AnswersService();
        // previewToken é opcional - passar apenas se definido
        answersCache = await answersService.getAnswers(previewToken || undefined);
        this.answersCache = answersCache;
      } catch (error) {
        // Não falha, usa fallback depois
        console.warn('⚠️ [LegacyQuizService] Erro ao buscar respostas do Directus (usando fallback):', error instanceof Error ? error.message : 'Erro desconhecido');
        this.answersCache = [];
      }

      // ETAPA 4: Mapear dados usando resultado calculado
      let mappedData: LegacyQuizMapping;
      try {
        mappedData = await this.mapAnswersToLegacyFormat(
          request.answers, 
          calculatedResult,
          request.userData, 
          previewToken
        );
      } catch (error) {
        console.error('❌ [LegacyQuizService] Erro ao mapear dados:', error);
        throw error;
      }

      // ETAPA 5: Executar INSERT no MySQL
      try {
        const sqlStartTime = Date.now();
        
        // Query SQL idêntica ao PHP
        const sql = `INSERT INTO resposta_teste_maturidade (
          processo_r1, processo_r2, processo_r3, processo_p1, processo_p2, processo_p3,
          vendas_r1, vendas_r2, vendas_r3, vendas_p1, vendas_p2, vendas_p3,
          presenca_r1, presenca_r2, presenca_r3, presenca_p1, presenca_p2, presenca_p3,
          com_r1, com_r2, com_r3, com_p1, com_p2, com_p3,
          financas_r1, financas_r2, financas_r3, financas_p1, financas_p2, financas_p3,
          nome, empresa, email, whatsapp, uf, cidade, newsletter,
          nvl_processo, total_pts_processo,
          nvl_vendas, total_pts_venda,
          nvl_presenca, total_pts_presenca,
          nvl_com, total_pts_com,
          nvl_financas, total_pts_financas,
          nvl_geral, total_pts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // Preparar parâmetros na ordem exata do PHP
        const params = [
          // Processo (r1, r2, r3, p1, p2, p3)
          mappedData.processo_r1, mappedData.processo_r2, mappedData.processo_r3,
          mappedData.processo_p1, mappedData.processo_p2, mappedData.processo_p3,
          
          // Vendas (r1, r2, r3, p1, p2, p3)
          mappedData.vendas_r1, mappedData.vendas_r2, mappedData.vendas_r3,
          mappedData.vendas_p1, mappedData.vendas_p2, mappedData.vendas_p3,
          
          // Presença (r1, r2, r3, p1, p2, p3)
          mappedData.presenca_r1, mappedData.presenca_r2, mappedData.presenca_r3,
          mappedData.presenca_p1, mappedData.presenca_p2, mappedData.presenca_p3,
          
          // Comunicação (r1, r2, r3, p1, p2, p3)
          mappedData.com_r1, mappedData.com_r2, mappedData.com_r3,
          mappedData.com_p1, mappedData.com_p2, mappedData.com_p3,
          
          // Finanças (r1, r2, r3, p1, p2, p3)
          mappedData.financas_r1, mappedData.financas_r2, mappedData.financas_r3,
          mappedData.financas_p1, mappedData.financas_p2, mappedData.financas_p3,
          
          // Dados do usuário
          mappedData.nome, mappedData.empresa, mappedData.email, mappedData.whatsapp,
          mappedData.uf, mappedData.cidade, mappedData.newsletter,
          
          // Níveis e pontuações
          mappedData.nvl_processo, mappedData.total_pts_processo,
          mappedData.nvl_vendas, mappedData.total_pts_venda,
          mappedData.nvl_presenca, mappedData.total_pts_presenca,
          mappedData.nvl_com, mappedData.total_pts_com,
          mappedData.nvl_financas, mappedData.total_pts_financas,
          mappedData.nvl_geral, mappedData.total_pts
        ];

        // Log dos dados enviados para banco legado
        console.log('💾 [Banco Legado] Dados enviados para banco legado:', JSON.stringify({
          nome: mappedData.nome,
          empresa: mappedData.empresa,
          email: mappedData.email,
          uf: mappedData.uf,
          cidade: mappedData.cidade,
          niveis: {
            processo: mappedData.nvl_processo,
            vendas: mappedData.nvl_vendas,
            presenca: mappedData.nvl_presenca,
            com: mappedData.nvl_com,
            financas: mappedData.nvl_financas,
            geral: mappedData.nvl_geral
          },
          pontuacoes: {
            processo: mappedData.total_pts_processo,
            vendas: mappedData.total_pts_venda,
            presenca: mappedData.total_pts_presenca,
            com: mappedData.total_pts_com,
            financas: mappedData.total_pts_financas,
            geral: mappedData.total_pts
          },
          timestamp: new Date().toISOString()
        }, null, 2));
        
        const [result] = await connection.execute(sql, params);
        const sqlDuration = Date.now() - sqlStartTime;
        const totalDuration = Date.now() - startTime;
        
        // Log da resposta do banco legado
        console.log('✅ [Banco Legado] Resposta do banco legado:', JSON.stringify({
          insertId: (result as any).insertId,
          affectedRows: (result as any).affectedRows,
          tempoSQL: `${sqlDuration}ms`,
          tempoTotal: `${totalDuration}ms`,
          timestamp: new Date().toISOString()
        }, null, 2));
      
        return { 
          success: true,
          data: {
            id: (result as any).insertId,
            affectedRows: (result as any).affectedRows
          }
        };
      } catch (sqlError) {
        console.error('❌ [LegacyQuizService] Erro ao executar SQL:', sqlError);
        throw sqlError;
      }
      
    } catch (error) {
      console.error('❌ [LegacyQuizService] Erro ao salvar dados:', error);
      
      // Propagar erro para o controller
      throw error;
    } finally {
      if (connection) {
        try {
          console.log('\n🔌 [MySQL] Fechando conexão...');
          console.log('   Status antes de fechar:', (connection as any).state || 'N/A');
          await connection.end();
          console.log('✅ [MySQL] CONEXÃO FECHADA COM SUCESSO');
          console.log('✅ [LegacyQuizService] Conexão MySQL encerrada');
        } catch (closeError) {
          console.error('❌ [MySQL] ERRO ao fechar conexão:', closeError);
          console.error('⚠️ [LegacyQuizService] Erro ao encerrar conexão MySQL:', closeError);
        }
      } else {
        console.log('⚠️ [MySQL] Conexão não foi criada, não há nada para fechar');
      }
    }
  }

  private async mapAnswersToLegacyFormat(
    answers: UserAnswer[], 
    calculatedResult: CalculatedResult,
    userData?: any, 
    previewToken?: string
  ): Promise<LegacyQuizMapping> {
    console.log('   🔄 Iniciando mapeamento de dados...');
    
    // Ordenar respostas por question_id para garantir ordem correta
    console.log('   📋 Ordenando respostas por question_id...');
    const sortedAnswers = answers.sort((a, b) => a.question_id - b.question_id);
    
    console.log('   📊 Respostas ordenadas:', sortedAnswers.map(a => ({
      question_id: a.question_id,
      category_id: a.category_id,
      score: a.score,
      answer_id: a.answer_id
    })));

    // Mapear respostas por categoria
    console.log('   📋 Agrupando respostas por categoria...');
    const categoryAnswers = new Map<number, UserAnswer[]>();
    
    for (const answer of sortedAnswers) {
      if (!categoryAnswers.has(answer.category_id)) {
        categoryAnswers.set(answer.category_id, []);
      }
      // Ordenar respostas dentro da categoria por question_id
      const categoryArray = categoryAnswers.get(answer.category_id)!;
      categoryArray.push(answer);
      categoryArray.sort((a, b) => a.question_id - b.question_id);
    }

    console.log('   ✅ Respostas agrupadas por categoria:');
    categoryAnswers.forEach((answers, catId) => {
      console.log(`      Categoria ${catId}: ${answers.length} respostas`);
    });

    // Buscar apenas textos de resposta (níveis já estão calculados)
    console.log('   📋 Buscando textos das respostas...');
    const [
      processo_r1, processo_r2, processo_r3,
      vendas_r1, vendas_r2, vendas_r3,
      presenca_r1, presenca_r2, presenca_r3,
      com_r1, com_r2, com_r3,
      financas_r1, financas_r2, financas_r3
    ] = await Promise.all([
      // Processo (categoria 1)
      this.getAnswerText(categoryAnswers.get(1)?.[0]),
      this.getAnswerText(categoryAnswers.get(1)?.[1]),
      this.getAnswerText(categoryAnswers.get(1)?.[2]),
      
      // Vendas (categoria 2)
      this.getAnswerText(categoryAnswers.get(2)?.[0]),
      this.getAnswerText(categoryAnswers.get(2)?.[1]),
      this.getAnswerText(categoryAnswers.get(2)?.[2]),
      
      // Presença (categoria 3)
      this.getAnswerText(categoryAnswers.get(3)?.[0]),
      this.getAnswerText(categoryAnswers.get(3)?.[1]),
      this.getAnswerText(categoryAnswers.get(3)?.[2]),
      
      // Comunicação (categoria 4)
      this.getAnswerText(categoryAnswers.get(4)?.[0]),
      this.getAnswerText(categoryAnswers.get(4)?.[1]),
      this.getAnswerText(categoryAnswers.get(4)?.[2]),
      
      // Finanças (categoria 5)
      this.getAnswerText(categoryAnswers.get(5)?.[0]),
      this.getAnswerText(categoryAnswers.get(5)?.[1]),
      this.getAnswerText(categoryAnswers.get(5)?.[2])
    ]);
    console.log('   ✅ Textos das respostas obtidos');

    // USAR níveis do calculatedResult (já calculados)
    console.log('   📋 Extraindo níveis e pontuações do resultado calculado...');
    const getCategoryLevel = (categoryId: number): string => {
      const category = calculatedResult.categories.find(c => c.category_id === categoryId);
      const level = category?.level.title || 'Iniciante digital';
      console.log(`      Nível categoria ${categoryId}: ${level} (${category?.score || 0} pontos)`);
      return level;
    };

    const getCategoryScore = (categoryId: number): number => {
      const category = calculatedResult.categories.find(c => c.category_id === categoryId);
      return category?.score || 0;
    };

    const nvl_processo = getCategoryLevel(1);
    const nvl_vendas = getCategoryLevel(2);
    const nvl_presenca = getCategoryLevel(3);
    const nvl_com = getCategoryLevel(4);
    const nvl_financas = getCategoryLevel(5);
    const nvl_geral = calculatedResult.general_level.title;
    
    console.log(`   ✅ Nível geral: ${nvl_geral} (${calculatedResult.total_score} pontos)`);

    // Mapear para estrutura PHP
    const mapping: LegacyQuizMapping = {
      // Processo (categoria 1)
      processo_r1,
      processo_r2,
      processo_r3,
      processo_p1: categoryAnswers.get(1)?.[0]?.score || 0,
      processo_p2: categoryAnswers.get(1)?.[1]?.score || 0,
      processo_p3: categoryAnswers.get(1)?.[2]?.score || 0,
      
      // Vendas (categoria 2)
      vendas_r1,
      vendas_r2,
      vendas_r3,
      vendas_p1: categoryAnswers.get(2)?.[0]?.score || 0,
      vendas_p2: categoryAnswers.get(2)?.[1]?.score || 0,
      vendas_p3: categoryAnswers.get(2)?.[2]?.score || 0,
      
      // Presença (categoria 3)
      presenca_r1,
      presenca_r2,
      presenca_r3,
      presenca_p1: categoryAnswers.get(3)?.[0]?.score || 0,
      presenca_p2: categoryAnswers.get(3)?.[1]?.score || 0,
      presenca_p3: categoryAnswers.get(3)?.[2]?.score || 0,
      
      // Comunicação (categoria 4)
      com_r1,
      com_r2,
      com_r3,
      com_p1: categoryAnswers.get(4)?.[0]?.score || 0,
      com_p2: categoryAnswers.get(4)?.[1]?.score || 0,
      com_p3: categoryAnswers.get(4)?.[2]?.score || 0,
      
      // Finanças (categoria 5)
      financas_r1,
      financas_r2,
      financas_r3,
      financas_p1: categoryAnswers.get(5)?.[0]?.score || 0,
      financas_p2: categoryAnswers.get(5)?.[1]?.score || 0,
      financas_p3: categoryAnswers.get(5)?.[2]?.score || 0,
      
      // Dados do usuário (valores padrão se não fornecidos)
      nome: userData?.nome || 'Usuário',
      empresa: userData?.empresa || 'Empresa',
      email: userData?.email || 'usuario@empresa.com',
      whatsapp: userData?.whatsapp || '00000000000',
      uf: userData?.estado || 'MG',
      cidade: userData?.cidade || 'Belo Horizonte',
      newsletter: userData?.newsletter || false,
      
      // Níveis e pontuações (usando resultado calculado)
      nvl_processo,
      total_pts_processo: getCategoryScore(1),
      nvl_vendas,
      total_pts_venda: getCategoryScore(2),
      nvl_presenca,
      total_pts_presenca: getCategoryScore(3),
      nvl_com,
      total_pts_com: getCategoryScore(4),
      nvl_financas,
      total_pts_financas: getCategoryScore(5),
      nvl_geral,
      total_pts: calculatedResult.total_score
    };

    console.log('   ✅ Mapeamento concluído com sucesso');
    console.log('   📋 Resumo final:', {
      categorias: 5,
      respostas: answers.length,
      niveisExtraidos: 6,
      dadosUsuario: !!userData
    });
    return mapping;
  }

  private async getAnswerText(answer?: UserAnswer): Promise<string> {
    if (!answer) {
      return 'Não respondido';
    }
    
    // Buscar texto da resposta no Directus usando o answer_id
    if (!this.answersCache || this.answersCache.length === 0) {
      console.warn('⚠️ [LegacyQuizService] Cache de respostas vazio, usando fallback');
      // Fallback baseado no score (manter compatibilidade)
      if (answer.score >= 3) return 'Sempre';
      if (answer.score >= 2) return 'Às vezes';
      if (answer.score >= 1) return 'Raramente';
      return 'Nunca';
    }
    
    const answerOption = this.answersCache.find(a => a.id === answer.answer_id);
    
    if (answerOption && answerOption.answer) {
      console.log(`✅ [LegacyQuizService] Texto encontrado para answer_id ${answer.answer_id}: ${answerOption.answer}`);
      return answerOption.answer;
    }
    
    console.warn(`⚠️ [LegacyQuizService] Resposta não encontrada para answer_id ${answer.answer_id}, usando fallback`);
    // Fallback baseado no score
    if (answer.score >= 3) return 'Sempre';
    if (answer.score >= 2) return 'Às vezes';
    if (answer.score >= 1) return 'Raramente';
    return 'Nunca';
  }

}

