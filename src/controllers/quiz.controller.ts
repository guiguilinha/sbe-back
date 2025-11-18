import { Request, Response } from 'express';
import { QuizService } from '../services/directus/quiz.service';

export const getQuizData = async (req: Request, res: Response) => {
  try {
    // Extrair preview token do query parameter
    const previewToken = req.query.token as string;
    
    console.log('[QuizController] Request:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0,
      queryParams: req.query
    });

    const data = await QuizService.getData(previewToken);

    return res.json({
      ...data
    });
  } catch (error) {
    console.error('[quiz.controller] Erro ao buscar dados do quiz:', error);
    return res.status(500).json({ error: 'Erro ao buscar dados do quiz' });
  }
};
