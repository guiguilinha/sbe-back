// homepage.controller.ts
import { Request, Response } from 'express';
import { HomepageService } from '../services/directus/homepage.service';

const homepageService = new HomepageService();

export const getHomepage = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    
    console.log('[HomepageController] getHomepage:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      token: token
    });

    // Se um token foi fornecido, usar o token real do Directus para preview
    // O token fornecido é apenas para identificar que é uma requisição de preview
    const previewToken = token ? process.env.DIRECTUS_TOKEN : undefined;
    
    console.log('[HomepageController] Usando previewToken:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });

    const data = await homepageService.getHomepageData(previewToken);
    res.json(data);
  } catch (error) {
    console.error('❌ Error in getHomepage:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    res.status(500).json({ message: 'Failed to load homepage' });
  }
};
