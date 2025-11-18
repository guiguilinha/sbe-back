import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { DiagnosticoDetail } from '../../contracts/dashboard/diagnostico.types';

const MOCKS_DIR =
  process.env.MOCKS_DIR ?? path.resolve(process.cwd(), '../mocks');

export class DiagnosticosService {
  async list(): Promise<Array<{ id: string; date: string; overallScore: number }>> {
    const file = path.join(MOCKS_DIR, 'diagnosticos.list.json');
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw);
  }

  async getById(id: string): Promise<DiagnosticoDetail | null> {
    try {
      const file = path.join(MOCKS_DIR, `diagnostico.${id}.json`);
      const raw = await fs.readFile(file, 'utf-8');
      return JSON.parse(raw) as DiagnosticoDetail;
    } catch {
      return null;
    }
  }
}
