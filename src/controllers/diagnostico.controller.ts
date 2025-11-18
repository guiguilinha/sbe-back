import type { Request, Response } from 'express';
import { DiagnosticosService } from '../services/directus/diagnosticos.service';

const diagnosticosService = new DiagnosticosService();

export const listDiagnosticos = async (_req: Request, res: Response) => {
  try {
    const data = await diagnosticosService.list();
    res.json(data);
  } catch (error) {
    console.error('❌ Error in listDiagnosticos:', error);
    res.status(500).json({ message: 'Failed to load diagnosticos list' });
  }
};

export const getDiagnosticoById = async (req: Request, res: Response) => {
  try {
    const data = await diagnosticosService.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Diagnostico not found' });
    }
    return res.json(data);
  } catch (error) {
    console.error('❌ Error in getDiagnosticoById:', error);
    return res.status(500).json({ message: 'Failed to load diagnostico' });
  }
};
