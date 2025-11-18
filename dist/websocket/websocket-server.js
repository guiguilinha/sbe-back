"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
const ws_1 = require("ws");
const directus_websocket_service_1 = require("./directus-websocket.service");
const directus_realtime_service_1 = require("../services/directus/directus-realtime.service");
class WebSocketManager {
    constructor(server) {
        this.clients = new Map();
        this.wss = new ws_1.WebSocketServer({
            server,
            path: '/ws'
        });
        this.directusService = new directus_websocket_service_1.DirectusWebSocketService();
        this.realtimeService = new directus_realtime_service_1.DirectusRealtimeService();
        this.setupWebSocket();
        console.log('🔌 WebSocket Server iniciado em /ws');
    }
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('🔌 Cliente WebSocket conectado');
            this.clients.set(ws, new Set());
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleMessage(ws, data);
                }
                catch (error) {
                    console.error('❌ Erro ao processar mensagem WebSocket:', error);
                    this.sendError(ws, 'Erro ao processar mensagem');
                }
            });
            ws.on('close', () => {
                console.log('🔌 Cliente WebSocket desconectado');
                this.clients.delete(ws);
            });
            ws.on('error', (error) => {
                console.error('❌ Erro no WebSocket:', error);
                this.clients.delete(ws);
            });
        });
    }
    async handleMessage(ws, data) {
        console.log('📨 Mensagem recebida:', data);
        switch (data.type) {
            case 'subscribe_collection':
                if (data.collection) {
                    await this.subscribeToCollection(ws, data.collection);
                }
                else {
                    this.sendError(ws, 'Collection não especificada');
                }
                break;
            case 'unsubscribe_collection':
                if (data.collection) {
                    await this.unsubscribeFromCollection(ws, data.collection);
                }
                else {
                    this.sendError(ws, 'Collection não especificada');
                }
                break;
            case 'ping':
                this.sendMessage(ws, { type: 'pong' });
                break;
            default:
                this.sendError(ws, `Tipo de mensagem desconhecido: ${data.type}`);
        }
    }
    async subscribeToCollection(ws, collection) {
        try {
            console.log(`📡 Inscrevendo cliente na collection: ${collection}`);
            const clientCollections = this.clients.get(ws);
            if (clientCollections) {
                clientCollections.add(collection);
            }
            this.realtimeService.subscribeToCollection(collection, (event) => {
                this.broadcastToCollection(collection, {
                    type: 'collection_update',
                    collection,
                    data: event.data,
                    eventType: event.type,
                    timestamp: event.timestamp
                });
            });
            this.sendMessage(ws, {
                type: 'subscription_confirmed',
                collection
            });
        }
        catch (error) {
            console.error(`❌ Erro ao inscrever na collection ${collection}:`, error);
            this.sendError(ws, `Erro ao inscrever na collection: ${error}`);
        }
    }
    async unsubscribeFromCollection(ws, collection) {
        try {
            console.log(`📡 Desinscrevendo cliente da collection: ${collection}`);
            const clientCollections = this.clients.get(ws);
            if (clientCollections) {
                clientCollections.delete(collection);
            }
            let hasOtherClients = false;
            for (const [client, collections] of this.clients) {
                if (client !== ws && collections.has(collection)) {
                    hasOtherClients = true;
                    break;
                }
            }
            if (!hasOtherClients) {
                this.realtimeService.unsubscribeFromCollection(collection);
            }
            this.sendMessage(ws, {
                type: 'unsubscription_confirmed',
                collection
            });
        }
        catch (error) {
            console.error(`❌ Erro ao desinscrever da collection ${collection}:`, error);
            this.sendError(ws, `Erro ao desinscrever da collection: ${error}`);
        }
    }
    broadcastToCollection(collection, message) {
        console.log(`📡 Broadcast para collection ${collection}:`, message);
        for (const [client, collections] of this.clients) {
            if (collections.has(collection) && client.readyState === ws_1.WebSocket.OPEN) {
                this.sendMessage(client, message);
            }
        }
    }
    sendMessage(ws, message) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
    sendError(ws, error) {
        this.sendMessage(ws, {
            type: 'error',
            error
        });
    }
    getStats() {
        return {
            totalClients: this.clients.size,
            totalSubscriptions: Array.from(this.clients.values()).reduce((total, collections) => total + collections.size, 0),
            realtime: this.realtimeService.getStats()
        };
    }
}
exports.WebSocketManager = WebSocketManager;
//# sourceMappingURL=websocket-server.js.map