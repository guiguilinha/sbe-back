import { Request, Response } from 'express';
import { LegacyQuizService } from '../services/legacy-quiz.service';
import { LegacyQuizRequest, LegacyQuizResponse } from '../contracts/legacy-quiz.types';

export class LegacyQuizController {
  static async processQuiz(req: Request, res: Response) {
    try {
      const { answers, userData }: LegacyQuizRequest = req.body;
      
      console.log('📝 [LegacyQuizController] ===== RECEBENDO DADOS DO QUIZ LEGADO =====');
      console.log('📊 [LegacyQuizController] Dados recebidos:', {
        answersCount: answers?.length || 0,
        hasUserData: !!userData,
        userEmail: userData?.email,
        userCompany: userData?.empresa
      });

      // Validar estrutura dos dados
      if (!Array.isArray(answers) || answers.length === 0) {
        console.log('❌ [LegacyQuizController] Dados inválidos: respostas ausentes');
        return res.status(400).json({ 
          success: false,
          message: 'Dados inválidos: respostas ausentes' 
        });
      }

      // Validar se tem pelo menos 15 respostas (3 por categoria × 5 categorias)
      if (answers.length < 15) {
        console.log('❌ [LegacyQuizController] Dados inválidos: número insuficiente de respostas');
        return res.status(400).json({ 
          success: false,
          message: 'Dados inválidos: número insuficiente de respostas (mínimo 15)' 
        });
      }

      // MOSTRAR DADOS COMPLETOS
      console.log('\n📋 [LegacyQuizController] ===== ESTRUTURA COMPLETA DOS DADOS =====');
      console.log('\n📦 ANSWERS (Array de respostas):');
      console.log(JSON.stringify(answers, null, 2));
      
      console.log('\n👤 USERDATA (Dados do usuário):');
      console.log(JSON.stringify(userData, null, 2));
      
      console.log('\n🔍 [LegacyQuizController] Estrutura detalhada das respostas:');
      answers.forEach((answer, index) => {
        console.log(`  ${index + 1}. Question ID: ${answer.question_id}, Answer ID: ${answer.answer_id}, Category ID: ${answer.category_id}, Score: ${answer.score}`);
      });
      
      // Agrupar por categoria
      const byCategory = answers.reduce((acc, answer) => {
        if (!acc[answer.category_id]) acc[answer.category_id] = [];
        acc[answer.category_id].push(answer);
        return acc;
      }, {} as Record<number, typeof answers>);
      
      console.log('\n📊 [LegacyQuizController] Respostas agrupadas por categoria:');
      Object.keys(byCategory).sort().forEach(catId => {
        const catAnswers = byCategory[parseInt(catId)];
        const totalScore = catAnswers.reduce((sum, a) => sum + a.score, 0);
        console.log(`  Categoria ${catId}: ${catAnswers.length} respostas, Total: ${totalScore} pontos`);
        catAnswers.forEach(a => {
          console.log(`    - Q${a.question_id}: Answer ${a.answer_id}, Score ${a.score}`);
        });
      });
      
      console.log('\n📝 [LegacyQuizController] ===== FIM DA ESTRUTURA =====\n');

      // Extrair preview token do query parameter (se disponível)
      const previewToken = req.query.token as string | undefined;

      // Processar e salvar no MySQL
      const legacyQuizService = new LegacyQuizService();
      const result = await legacyQuizService.saveQuizData({ answers, userData }, previewToken);

      if (result.success) {
        console.log('✅ [LegacyQuizController] Quiz salvo com sucesso no MySQL');
        console.log('📊 [LegacyQuizController] Resultado:', result.data);
        
        return res.json({
          success: true,
          message: 'Quiz processado e salvo com sucesso',
          data: result.data
        });
      } else {
        console.error('❌ [LegacyQuizController] Erro ao salvar quiz:', result.message);
        return res.status(500).json({ 
          success: false, 
          message: result.message || 'Erro ao inserir os dados no MySQL' 
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : 'N/A';
      
      console.error('❌ [LegacyQuizController] Erro interno ao processar quiz:', error);
      console.error('❌ [LegacyQuizController] Mensagem:', errorMessage);
      console.error('❌ [LegacyQuizController] Stack trace:', errorStack);
      
      // Sempre mostrar erro detalhado para facilitar debug
      // Se não estiver explicitamente em produção, mostra stack
      const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'PRODUCTION';
      return res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: errorMessage,
        stack: !isProduction ? errorStack : undefined,
        // Adicionar timestamp para debug
        timestamp: new Date().toISOString()
      });
    }
  }

  static async healthCheck(req: Request, res: Response) {
    try {
      console.log('🔍 [LegacyQuizController] Verificando saúde do endpoint legacy-quiz...');
      
      return res.json({
        success: true,
        message: 'Endpoint legacy-quiz está funcionando',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [LegacyQuizController] Erro no health check:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro no health check'
      });
    }
  }
}

