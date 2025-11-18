"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectusWebSocketService = void 0;
const ws_1 = __importDefault(require("ws"));
class DirectusWebSocketService {
    constructor() {
        this.ws = null;
        this.subscriptions = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isDirectusEnabled = false;
        console.log('⚠️ Directus WebSocket não habilitado - usando modo simulado');
    }
    connectToDirectus() {
        if (!this.isDirectusEnabled) {
            console.log('⚠️ Directus WebSocket não habilitado, pulando conexão');
            return;
        }
        try {
            const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
            const wsUrl = directusUrl.replace('http', 'ws') + '/websocket';
            console.log('🔌 Conectando ao WebSocket do Directus:', wsUrl);
            this.ws = new ws_1.default(wsUrl);
            this.ws.on('open', () => {
                console.log('✅ Conectado ao WebSocket do Directus');
                this.reconnectAttempts = 0;
                for (const collection of this.subscriptions.keys()) {
                    this.subscribeToDirectusCollection(collection);
                }
            });
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleDirectusMessage(message);
                }
                catch (error) {
                    console.error('❌ Erro ao processar mensagem do Directus:', error);
                }
            });
            this.ws.on('close', () => {
                console.log('🔌 Conexão com Directus WebSocket fechada');
                this.scheduleReconnect();
            });
            this.ws.on('error', (error) => {
                console.error('❌ Erro na conexão com Directus WebSocket:', error);
                this.scheduleReconnect();
            });
        }
        catch (error) {
            console.error('❌ Erro ao conectar com Directus WebSocket:', error);
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
        if (!this.isDirectusEnabled)
            return;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`);
            setTimeout(() => {
                this.connectToDirectus();
            }, delay);
        }
        else {
            console.error('❌ Máximo de tentativas de reconexão atingido');
        }
    }
    handleDirectusMessage(message) {
        console.log('📨 Mensagem do Directus:', message);
        if (message.type === 'items' && message.collection) {
            const callbacks = this.subscriptions.get(message.collection);
            if (callbacks) {
                callbacks.forEach(callback => {
                    try {
                        callback(message.payload);
                    }
                    catch (error) {
                        console.error('❌ Erro ao executar callback:', error);
                    }
                });
            }
        }
    }
    subscribeToDirectusCollection(collection) {
        if (!this.isDirectusEnabled) {
            console.log(`📡 Simulando inscrição no Directus collection: ${collection}`);
            return;
        }
        if (this.ws && this.ws.readyState === ws_1.default.OPEN) {
            const subscribeMessage = {
                type: 'subscribe',
                collection: collection
            };
            console.log(`📡 Inscrevendo no Directus collection: ${collection}`);
            this.ws.send(JSON.stringify(subscribeMessage));
        }
        else {
            console.warn(`⚠️ WebSocket não está conectado, não foi possível inscrever na collection: ${collection}`);
        }
    }
    unsubscribeFromDirectusCollection(collection) {
        if (!this.isDirectusEnabled) {
            console.log(`📡 Simulando desinscrição do Directus collection: ${collection}`);
            return;
        }
        if (this.ws && this.ws.readyState === ws_1.default.OPEN) {
            const unsubscribeMessage = {
                type: 'unsubscribe',
                collection: collection
            };
            console.log(`📡 Desinscrevendo do Directus collection: ${collection}`);
            this.ws.send(JSON.stringify(unsubscribeMessage));
        }
    }
    async subscribeToCollection(collection, callback) {
        console.log(`📡 Inscrevendo callback na collection: ${collection}`);
        if (!this.subscriptions.has(collection)) {
            this.subscriptions.set(collection, new Set());
        }
        this.subscriptions.get(collection).add(callback);
        if (this.isDirectusEnabled && this.subscriptions.get(collection).size === 1) {
            this.subscribeToDirectusCollection(collection);
        }
    }
    async unsubscribeFromCollection(collection) {
        console.log(`📡 Desinscrevendo da collection: ${collection}`);
        this.subscriptions.delete(collection);
        if (this.isDirectusEnabled) {
            this.unsubscribeFromDirectusCollection(collection);
        }
    }
    simulateUpdate(collection, data) {
        console.log(`🎭 Simulando atualização para collection: ${collection}`, data);
        const callbacks = this.subscriptions.get(collection);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error('❌ Erro ao executar callback:', error);
                }
            });
        }
    }
    getStats() {
        return {
            isConnected: this.isDirectusEnabled ? (this.ws?.readyState === ws_1.default.OPEN) : false,
            isDirectusEnabled: this.isDirectusEnabled,
            totalSubscriptions: this.subscriptions.size,
            collections: Array.from(this.subscriptions.keys()),
            reconnectAttempts: this.reconnectAttempts
        };
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
exports.DirectusWebSocketService = DirectusWebSocketService;
//# sourceMappingURL=directus-websocket.service.js.map