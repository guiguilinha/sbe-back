import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { DashboardResponse } from '../../contracts/dashboard/dashboard.types';

const MOCKS_DIR =
  process.env.MOCKS_DIR ?? path.resolve(process.cwd(), '../mocks');

export class DashboardService {
  async getDashboard(): Promise<DashboardResponse> {
    try {
      console.log('🔍 DashboardService - Iniciando busca de dados...');
      const file = path.join(MOCKS_DIR, 'dashboard.mock.json');
      console.log('🔍 DashboardService - Arquivo:', file);
      const raw = await fs.readFile(file, 'utf-8');
      console.log('🔍 DashboardService - Arquivo lido com sucesso');
      const json = JSON.parse(raw) as DashboardResponse;
      console.log('✅ DashboardService - Dados parseados:', json);
      return json;
    } catch (error) {
      console.error('❌ DashboardService - Erro:', error);
      throw error;
    }
  }
}
