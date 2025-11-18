"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const MOCKS_DIR = process.env.MOCKS_DIR ?? node_path_1.default.resolve(process.cwd(), '../mocks');
class DashboardService {
    async getDashboard() {
        try {
            console.log('🔍 DashboardService - Iniciando busca de dados...');
            const file = node_path_1.default.join(MOCKS_DIR, 'dashboard.mock.json');
            console.log('🔍 DashboardService - Arquivo:', file);
            const raw = await node_fs_1.promises.readFile(file, 'utf-8');
            console.log('🔍 DashboardService - Arquivo lido com sucesso');
            const json = JSON.parse(raw);
            console.log('✅ DashboardService - Dados parseados:', json);
            return json;
        }
        catch (error) {
            console.error('❌ DashboardService - Erro:', error);
            throw error;
        }
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map