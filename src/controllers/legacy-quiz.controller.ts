import { Request, Response } from 'express';
import { LegacyQuizService } from '../services/legacy-quiz.service';
import { LegacyQuizRequest, LegacyQuizResponse } from '../contracts/legacy-quiz.types';

export class LegacyQuizController {
  static async processQuiz(req: Request, res: Response) {
    try {
      const { answers, userData }: LegacyQuizRequest = req.body;

      // Validar estrutura dos dados
      if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Dados inválidos: respostas ausentes' 
        });
      }

      // Validar se tem pelo menos 15 respostas (3 por categoria × 5 categorias)
      if (answers.length < 15) {
        return res.status(400).json({ 
          success: false,
          message: 'Dados inválidos: número insuficiente de respostas (mínimo 15)' 
        });
      }

      // Extrair preview token do query parameter (se disponível)
      const previewToken = req.query.token as string | undefined;

      // Processar e salvar no MySQL
      const legacyQuizService = new LegacyQuizService();
      const result = await legacyQuizService.saveQuizData({ answers, userData }, previewToken);

      if (result.success) {
        return res.json({
          success: true,
          message: 'Quiz processado e salvo com sucesso',
          data: result.data
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: result.message || 'Erro ao inserir os dados no MySQL' 
        });
      }

    } catch (error) {
      console.error('❌ [LegacyQuizController] Erro interno ao processar quiz:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async healthCheck(req: Request, res: Response) {
    try {
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

