"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyQuizService = void 0;
const mysql_config_1 = require("../config/mysql.config");
const answers_service_1 = require("./directus/quiz/answers.service");
const results_service_1 = require("./directus/results.service");
class LegacyQuizService {
    constructor() {
        this.answersCache = null;
    }
    async saveQuizData(request, previewToken) {
        const startTime = Date.now();
        let connection;
        try {
            console.log('🔄 [LegacyQuizService] ===== INÍCIO DO PROCESSAMENTO =====');
            console.log('📍 [LegacyQuizService] Etapa 0/5: Recebendo e validando dados...');
            console.log('📊 [LegacyQuizService] Dados recebidos:', {
                answersCount: request.answers.length,
                hasUserData: !!request.userData,
                userEmail: request.userData?.email,
                hasPreviewToken: !!previewToken,
                timestamp: new Date().toISOString()
            });
            console.log('📍 [LegacyQuizService] Etapa 1/5: Criando conexão MySQL...');
            try {
                console.log('🔌 [MySQL] Tentando criar conexão...');
                connection = await (0, mysql_config_1.createMySQLConnection)();
                console.log('✅ [MySQL] CONEXÃO ESTABELECIDA COM SUCESSO');
                console.log('   📊 Status da conexão:', {
                    threadId: connection.threadId || 'N/A',
                    state: connection.state || 'N/A',
                    connected: 'SIM ✅'
                });
                console.log('✅ [LegacyQuizService] Etapa 1/5 COMPLETA: Conexão MySQL criada com sucesso');
            }
            catch (mysqlError) {
                console.error('❌ [LegacyQuizService] Etapa 1/5 FALHOU: Erro ao criar conexão MySQL');
                console.error('   Detalhes:', mysqlError instanceof Error ? mysqlError.message : String(mysqlError));
                console.error('   Stack:', mysqlError instanceof Error ? mysqlError.stack : 'N/A');
                throw new Error(`Erro ao conectar no MySQL: ${mysqlError instanceof Error ? mysqlError.message : String(mysqlError)}`);
            }
            console.log('📍 [LegacyQuizService] Etapa 2/5: Reutilizando cálculo do ResultsService...');
            let calculatedResult;
            try {
                const calcStartTime = Date.now();
                calculatedResult = await results_service_1.ResultsService.calculateResult({
                    answers: request.answers,
                    previewToken: previewToken
                });
                const calcDuration = Date.now() - calcStartTime;
                console.log('✅ [LegacyQuizService] Etapa 2/5 COMPLETA: Resultado calculado recebido');
                console.log('\n📊 [CALCULATED_RESULT] Dados completos do resultado calculado:');
                console.log(JSON.stringify({
                    total_score: calculatedResult.total_score,
                    general_level: {
                        id: calculatedResult.general_level.id,
                        title: calculatedResult.general_level.title
                    },
                    categories: calculatedResult.categories.map(cat => ({
                        category_id: cat.category_id,
                        score: cat.score,
                        level: {
                            id: cat.level.id,
                            title: cat.level.title
                        }
                    }))
                }, null, 2));
                console.log('   📊 Resumo:', {
                    totalScore: calculatedResult.total_score,
                    generalLevel: calculatedResult.general_level.title,
                    categoriesCount: calculatedResult.categories.length,
                    tempo: `${calcDuration}ms`
                });
                console.log('   📋 Detalhes por categoria:');
                calculatedResult.categories.forEach(cat => {
                    console.log(`      - Categoria ${cat.category_id}: ${cat.score} pontos → ${cat.level.title}`);
                });
            }
            catch (error) {
                console.error('❌ [LegacyQuizService] Etapa 2/5 FALHOU: Erro ao calcular resultado');
                console.error('   Detalhes:', error instanceof Error ? error.message : String(error));
                console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');
                throw new Error(`Erro ao calcular resultado: ${error instanceof Error ? error.message : String(error)}`);
            }
            console.log('📍 [LegacyQuizService] Etapa 3/5: Buscando textos das respostas no Directus...');
            let answersCache;
            try {
                const answersStartTime = Date.now();
                const answersService = new answers_service_1.AnswersService();
                answersCache = await answersService.getAnswers(previewToken);
                this.answersCache = answersCache;
                const answersDuration = Date.now() - answersStartTime;
                console.log('✅ [LegacyQuizService] Etapa 3/5 COMPLETA: Textos de respostas carregados');
                console.log('   📊 Resultado:', {
                    totalRespostas: answersCache.length,
                    tempo: `${answersDuration}ms`
                });
            }
            catch (error) {
                console.error('⚠️ [LegacyQuizService] Etapa 3/5 FALHOU (não crítico): Erro ao buscar textos de respostas');
                console.error('   Detalhes:', error instanceof Error ? error.message : String(error));
                console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');
                this.answersCache = [];
                console.warn('   ⚠️ Continuando sem cache de respostas (usará fallback baseado em score)');
            }
            console.log('📍 [LegacyQuizService] Etapa 4/5: Mapeando dados para formato MySQL...');
            let mappedData;
            try {
                const mapStartTime = Date.now();
                mappedData = await this.mapAnswersToLegacyFormat(request.answers, calculatedResult, request.userData, previewToken);
                const mapDuration = Date.now() - mapStartTime;
                console.log('✅ [LegacyQuizService] Etapa 4/5 COMPLETA: Dados mapeados com sucesso');
                console.log('\n📋 [LEGACY_QUIZ_MAPPING] Dados formatados completos para MySQL:');
                console.log(JSON.stringify(mappedData, null, 2));
                console.log('   📊 Tempo de mapeamento:', `${mapDuration}ms`);
                console.log('   📋 Resumo dos dados mapeados:', {
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
                    }
                });
            }
            catch (error) {
                console.error('❌ [LegacyQuizService] Etapa 4/5 FALHOU: Erro ao mapear dados');
                console.error('   Detalhes:', error instanceof Error ? error.message : String(error));
                console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');
                throw error;
            }
            console.log('📍 [LegacyQuizService] Etapa 5/5: Executando INSERT no MySQL...');
            try {
                const sqlStartTime = Date.now();
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
                const params = [
                    mappedData.processo_r1, mappedData.processo_r2, mappedData.processo_r3,
                    mappedData.processo_p1, mappedData.processo_p2, mappedData.processo_p3,
                    mappedData.vendas_r1, mappedData.vendas_r2, mappedData.vendas_r3,
                    mappedData.vendas_p1, mappedData.vendas_p2, mappedData.vendas_p3,
                    mappedData.presenca_r1, mappedData.presenca_r2, mappedData.presenca_r3,
                    mappedData.presenca_p1, mappedData.presenca_p2, mappedData.presenca_p3,
                    mappedData.com_r1, mappedData.com_r2, mappedData.com_r3,
                    mappedData.com_p1, mappedData.com_p2, mappedData.com_p3,
                    mappedData.financas_r1, mappedData.financas_r2, mappedData.financas_r3,
                    mappedData.financas_p1, mappedData.financas_p2, mappedData.financas_p3,
                    mappedData.nome, mappedData.empresa, mappedData.email, mappedData.whatsapp,
                    mappedData.uf, mappedData.cidade, mappedData.newsletter,
                    mappedData.nvl_processo, mappedData.total_pts_processo,
                    mappedData.nvl_vendas, mappedData.total_pts_venda,
                    mappedData.nvl_presenca, mappedData.total_pts_presenca,
                    mappedData.nvl_com, mappedData.total_pts_com,
                    mappedData.nvl_financas, mappedData.total_pts_financas,
                    mappedData.nvl_geral, mappedData.total_pts
                ];
                console.log('   📝 Query SQL preparada com', params.length, 'parâmetros');
                console.log('\n🔌 [MySQL] Status da conexão ANTES do INSERT:');
                console.log('   Thread ID:', connection.threadId || 'N/A');
                console.log('   Estado:', connection.state || 'N/A');
                console.log('   Conectado: SIM ✅');
                console.log('\n💾 [MySQL] Executando INSERT...');
                const [result] = await connection.execute(sql, params);
                const sqlDuration = Date.now() - sqlStartTime;
                const totalDuration = Date.now() - startTime;
                console.log('✅ [MySQL] INSERT EXECUTADO COM SUCESSO');
                console.log('   📊 Resultado do INSERT:', {
                    insertId: result.insertId,
                    affectedRows: result.affectedRows,
                    tempoSQL: `${sqlDuration}ms`
                });
                console.log('   ✅ Dados gravados no banco:', result.affectedRows > 0 ? 'SIM ✅' : 'NÃO ❌');
                console.log('\n🔌 [MySQL] Status da conexão APÓS o INSERT:');
                console.log('   Thread ID:', connection.threadId || 'N/A');
                console.log('   Estado:', connection.state || 'N/A');
                console.log('   Conectado: SIM ✅');
                console.log('\n✅ [LegacyQuizService] Etapa 5/5 COMPLETA: Dados salvos com sucesso no MySQL');
                console.log('   ⏱️ Tempo total:', `${totalDuration}ms`);
                return {
                    success: true,
                    data: {
                        id: result.insertId,
                        affectedRows: result.affectedRows
                    }
                };
            }
            catch (sqlError) {
                console.error('❌ [LegacyQuizService] Etapa 5/5 FALHOU: Erro ao executar SQL');
                console.error('   Detalhes:', sqlError instanceof Error ? sqlError.message : String(sqlError));
                console.error('   Stack:', sqlError instanceof Error ? sqlError.stack : 'N/A');
                throw sqlError;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : 'N/A';
            console.error('❌ [LegacyQuizService] Erro ao salvar dados:', error);
            console.error('❌ [LegacyQuizService] Mensagem:', errorMessage);
            console.error('❌ [LegacyQuizService] Stack:', errorStack);
            throw error;
        }
        finally {
            if (connection) {
                try {
                    console.log('\n🔌 [MySQL] Fechando conexão...');
                    console.log('   Status antes de fechar:', connection.state || 'N/A');
                    await connection.end();
                    console.log('✅ [MySQL] CONEXÃO FECHADA COM SUCESSO');
                    console.log('✅ [LegacyQuizService] Conexão MySQL encerrada');
                }
                catch (closeError) {
                    console.error('❌ [MySQL] ERRO ao fechar conexão:', closeError);
                    console.error('⚠️ [LegacyQuizService] Erro ao encerrar conexão MySQL:', closeError);
                }
            }
            else {
                console.log('⚠️ [MySQL] Conexão não foi criada, não há nada para fechar');
            }
        }
    }
    async mapAnswersToLegacyFormat(answers, calculatedResult, userData, previewToken) {
        console.log('   🔄 Iniciando mapeamento de dados...');
        console.log('   📋 Ordenando respostas por question_id...');
        const sortedAnswers = answers.sort((a, b) => a.question_id - b.question_id);
        console.log('   📊 Respostas ordenadas:', sortedAnswers.map(a => ({
            question_id: a.question_id,
            category_id: a.category_id,
            score: a.score,
            answer_id: a.answer_id
        })));
        console.log('   📋 Agrupando respostas por categoria...');
        const categoryAnswers = new Map();
        for (const answer of sortedAnswers) {
            if (!categoryAnswers.has(answer.category_id)) {
                categoryAnswers.set(answer.category_id, []);
            }
            const categoryArray = categoryAnswers.get(answer.category_id);
            categoryArray.push(answer);
            categoryArray.sort((a, b) => a.question_id - b.question_id);
        }
        console.log('   ✅ Respostas agrupadas por categoria:');
        categoryAnswers.forEach((answers, catId) => {
            console.log(`      Categoria ${catId}: ${answers.length} respostas`);
        });
        console.log('   📋 Buscando textos das respostas...');
        const [processo_r1, processo_r2, processo_r3, vendas_r1, vendas_r2, vendas_r3, presenca_r1, presenca_r2, presenca_r3, com_r1, com_r2, com_r3, financas_r1, financas_r2, financas_r3] = await Promise.all([
            this.getAnswerText(categoryAnswers.get(1)?.[0]),
            this.getAnswerText(categoryAnswers.get(1)?.[1]),
            this.getAnswerText(categoryAnswers.get(1)?.[2]),
            this.getAnswerText(categoryAnswers.get(2)?.[0]),
            this.getAnswerText(categoryAnswers.get(2)?.[1]),
            this.getAnswerText(categoryAnswers.get(2)?.[2]),
            this.getAnswerText(categoryAnswers.get(3)?.[0]),
            this.getAnswerText(categoryAnswers.get(3)?.[1]),
            this.getAnswerText(categoryAnswers.get(3)?.[2]),
            this.getAnswerText(categoryAnswers.get(4)?.[0]),
            this.getAnswerText(categoryAnswers.get(4)?.[1]),
            this.getAnswerText(categoryAnswers.get(4)?.[2]),
            this.getAnswerText(categoryAnswers.get(5)?.[0]),
            this.getAnswerText(categoryAnswers.get(5)?.[1]),
            this.getAnswerText(categoryAnswers.get(5)?.[2])
        ]);
        console.log('   ✅ Textos das respostas obtidos');
        console.log('   📋 Extraindo níveis e pontuações do resultado calculado...');
        const getCategoryLevel = (categoryId) => {
            const category = calculatedResult.categories.find(c => c.category_id === categoryId);
            const level = category?.level.title || 'Iniciante digital';
            console.log(`      Nível categoria ${categoryId}: ${level} (${category?.score || 0} pontos)`);
            return level;
        };
        const getCategoryScore = (categoryId) => {
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
        const mapping = {
            processo_r1,
            processo_r2,
            processo_r3,
            processo_p1: categoryAnswers.get(1)?.[0]?.score || 0,
            processo_p2: categoryAnswers.get(1)?.[1]?.score || 0,
            processo_p3: categoryAnswers.get(1)?.[2]?.score || 0,
            vendas_r1,
            vendas_r2,
            vendas_r3,
            vendas_p1: categoryAnswers.get(2)?.[0]?.score || 0,
            vendas_p2: categoryAnswers.get(2)?.[1]?.score || 0,
            vendas_p3: categoryAnswers.get(2)?.[2]?.score || 0,
            presenca_r1,
            presenca_r2,
            presenca_r3,
            presenca_p1: categoryAnswers.get(3)?.[0]?.score || 0,
            presenca_p2: categoryAnswers.get(3)?.[1]?.score || 0,
            presenca_p3: categoryAnswers.get(3)?.[2]?.score || 0,
            com_r1,
            com_r2,
            com_r3,
            com_p1: categoryAnswers.get(4)?.[0]?.score || 0,
            com_p2: categoryAnswers.get(4)?.[1]?.score || 0,
            com_p3: categoryAnswers.get(4)?.[2]?.score || 0,
            financas_r1,
            financas_r2,
            financas_r3,
            financas_p1: categoryAnswers.get(5)?.[0]?.score || 0,
            financas_p2: categoryAnswers.get(5)?.[1]?.score || 0,
            financas_p3: categoryAnswers.get(5)?.[2]?.score || 0,
            nome: userData?.nome || 'Usuário',
            empresa: userData?.empresa || 'Empresa',
            email: userData?.email || 'usuario@empresa.com',
            whatsapp: userData?.whatsapp || '00000000000',
            uf: userData?.estado || 'MG',
            cidade: userData?.cidade || 'Belo Horizonte',
            newsletter: userData?.newsletter || false,
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
    async getAnswerText(answer) {
        if (!answer) {
            return 'Não respondido';
        }
        if (!this.answersCache || this.answersCache.length === 0) {
            console.warn('⚠️ [LegacyQuizService] Cache de respostas vazio, usando fallback');
            if (answer.score >= 3)
                return 'Sempre';
            if (answer.score >= 2)
                return 'Às vezes';
            if (answer.score >= 1)
                return 'Raramente';
            return 'Nunca';
        }
        const answerOption = this.answersCache.find(a => a.id === answer.answer_id);
        if (answerOption && answerOption.answer) {
            console.log(`✅ [LegacyQuizService] Texto encontrado para answer_id ${answer.answer_id}: ${answerOption.answer}`);
            return answerOption.answer;
        }
        console.warn(`⚠️ [LegacyQuizService] Resposta não encontrada para answer_id ${answer.answer_id}, usando fallback`);
        if (answer.score >= 3)
            return 'Sempre';
        if (answer.score >= 2)
            return 'Às vezes';
        if (answer.score >= 1)
            return 'Raramente';
        return 'Nunca';
    }
}
exports.LegacyQuizService = LegacyQuizService;
//# sourceMappingURL=legacy-quiz.service.js.map