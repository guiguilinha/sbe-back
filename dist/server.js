"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const websocket_server_1 = require("./websocket/websocket-server");
const app_1 = __importDefault(require("./app"));
const envPath = path_1.default.resolve(__dirname, '../../.env');
dotenv_1.default.config({ path: envPath });
console.log('🔧 Variáveis de ambiente carregadas:');
console.log('DIRECTUS_URL:', process.env.DIRECTUS_URL);
console.log('DIRECTUS_TOKEN:', process.env.DIRECTUS_TOKEN ? '***' : 'não definido');
console.log('KEYCLOAK_BACKEND_AUTH_SERVER_URL:', process.env.KEYCLOAK_BACKEND_AUTH_SERVER_URL);
console.log('KEYCLOAK_BACKEND_REALM:', process.env.KEYCLOAK_BACKEND_REALM);
console.log('KEYCLOAK_BACKEND_RESOURCE:', process.env.KEYCLOAK_BACKEND_RESOURCE);
console.log('KEYCLOAK_BACKEND_SECRET:', process.env.KEYCLOAK_BACKEND_SECRET ? '***' : 'não definido');
console.log('CPE_BACKEND_URL:', process.env.CPE_BACKEND_URL);
console.log('CPE_BACKEND_TIMEOUT:', process.env.CPE_BACKEND_TIMEOUT);
const server = (0, http_1.createServer)(app_1.default);
const wsManager = new websocket_server_1.WebSocketManager(server);
global.wsManager = wsManager;
const PORT = process.env.BACKEND_PORT || process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔌 WebSocket disponível em ws://localhost:${PORT}/ws`);
});
exports.default = app_1.default;
//# sourceMappingURL=server.js.map