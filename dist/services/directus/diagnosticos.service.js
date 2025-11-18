"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticosService = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const MOCKS_DIR = process.env.MOCKS_DIR ?? node_path_1.default.resolve(process.cwd(), '../mocks');
class DiagnosticosService {
    async list() {
        const file = node_path_1.default.join(MOCKS_DIR, 'diagnosticos.list.json');
        const raw = await node_fs_1.promises.readFile(file, 'utf-8');
        return JSON.parse(raw);
    }
    async getById(id) {
        try {
            const file = node_path_1.default.join(MOCKS_DIR, `diagnostico.${id}.json`);
            const raw = await node_fs_1.promises.readFile(file, 'utf-8');
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
}
exports.DiagnosticosService = DiagnosticosService;
//# sourceMappingURL=diagnosticos.service.js.map