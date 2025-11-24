import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { WebSocketManager } from './websocket/websocket-server';
import app from './app';

// Carregar variáveis de ambiente do arquivo .env na raiz do projeto
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('🔧 Variáveis de ambiente carregadas:');
console.log('DIRECTUS_URL:', process.env.DIRECTUS_URL);
console.log('DIRECTUS_TOKEN:', process.env.DIRECTUS_TOKEN ? '***' : 'não definido');
console.log('KEYCLOAK_BACKEND_AUTH_SERVER_URL:', process.env.KEYCLOAK_BACKEND_AUTH_SERVER_URL);
console.log('KEYCLOAK_BACKEND_REALM:', process.env.KEYCLOAK_BACKEND_REALM);
console.log('KEYCLOAK_BACKEND_RESOURCE:', process.env.KEYCLOAK_BACKEND_RESOURCE);
console.log('KEYCLOAK_BACKEND_SECRET:', process.env.KEYCLOAK_BACKEND_SECRET ? '***' : 'não definido');
console.log('CPE_BACKEND_URL:', process.env.CPE_BACKEND_URL);
console.log('CPE_BACKEND_TIMEOUT:', process.env.CPE_BACKEND_TIMEOUT);

const server = createServer(app);

// Inicializar WebSocket Manager (Singleton)
WebSocketManager.init(server);

const PORT = process.env.BACKEND_PORT || process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔌 WebSocket disponível em ws://localhost:${PORT}/ws`);
});

export default app;