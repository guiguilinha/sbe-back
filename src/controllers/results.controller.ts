import { Request, Response } from 'express';
import { ResultsService } from '../services/directus/results.service';
import { UserResultsService } from '../services/directus/results/user-results.service';

export class ResultsController {
  static async calculate(req: Request, res: Response) {
    try {
      const { answers } = req.body;
      const previewToken = req.query.token as string;

      if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ error: 'Payload inválido: respostas ausentes' });
      }

      // 1. Calcular resultado básico
      const calculatedResult = await ResultsService.calculateResult({ answers });

      // 2. Gerar dados completos para a página de resultados
      try {
        const userResults = await UserResultsService.getUserResults(calculatedResult, previewToken);
        
        // 3. Retornar dados completos
        return res.status(200).json({
          success: true,
          data: userResults,
          calculatedResult: calculatedResult
        });
      } catch (userResultsError) {
        console.error('[ResultsController] Erro ao gerar userResults:', userResultsError);
        
        // Retornar apenas o resultado calculado se userResults falhar
        return res.status(200).json({
          success: true,
          data: null,
          calculatedResult: calculatedResult,
          error: 'Erro ao gerar dados completos'
        });
      }
    } catch (error: unknown) {
      console.error('[ResultsController] Erro ao calcular resultado:', error instanceof Error ? error.message : 'Erro desconhecido');
      return res.status(500).json({ error: 'Erro interno ao calcular resultado' });
    }
  }
}
