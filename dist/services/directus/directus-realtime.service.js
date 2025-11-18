"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectusRealtimeService = void 0;
const directus_base_service_1 = require("./base/directus-base.service");
class DirectusGenericService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'items';
    }
    async fetchLatestByUpdatedAt(collection, token) {
        const response = await this.makeRequest(`items/${collection}`, {
            method: 'GET',
            params: {
                sort: ['-date_updated'],
                limit: 1,
                fields: '*',
            },
            token,
        });
        return response.data;
    }
}
class DirectusRealtimeService {
    constructor() {
        this.pollingInterval = 2000;
        this.isPolling = false;
        this.lastChecks = new Map();
        this.callbacks = new Map();
        this.pollTimer = null;
        this.baseService = new DirectusGenericService();
        console.log('🔍 Directus Realtime Service iniciado');
    }
    startPolling() {
        if (this.isPolling) {
            console.log('⚠️ Polling já está ativo');
            return;
        }
        this.isPolling = true;
        console.log('🔄 Iniciando polling do Directus...');
        this.poll();
    }
    stopPolling() {
        this.isPolling = false;
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
        console.log('⏹️ Polling parado');
    }
    subscribeToCollection(collection, callback) {
        console.log(`📡 Inscrevendo em mudanças da collection: ${collection}`);
        if (!this.callbacks.has(collection)) {
            this.callbacks.set(collection, new Set());
        }
        this.callbacks.get(collection).add(callback);
        if (!this.isPolling) {
            this.startPolling();
        }
    }
    unsubscribeFromCollection(collection, callback) {
        if (!this.callbacks.has(collection)) {
            return;
        }
        if (callback) {
            this.callbacks.get(collection).delete(callback);
        }
        else {
            this.callbacks.delete(collection);
        }
        console.log(`📡 Desinscrevendo da collection: ${collection}`);
    }
    async poll() {
        if (!this.isPolling)
            return;
        try {
            for (const [collection, callbacks] of this.callbacks.entries()) {
                await this.checkCollectionChanges(collection, callbacks);
            }
        }
        catch (error) {
            console.error('❌ Erro durante polling:', error);
        }
        this.pollTimer = setTimeout(() => {
            this.poll();
        }, this.pollingInterval);
    }
    async checkCollectionChanges(collection, callbacks) {
        try {
            const latest = await this.baseService.fetchLatestByUpdatedAt(collection);
            if (!latest || latest.length === 0) {
                return;
            }
            const latestItem = latest[0];
            const currentHash = this.generateHash(latestItem);
            const lastHash = this.lastChecks.get(collection);
            if (lastHash !== currentHash) {
                console.log(`🔄 Mudança detectada na collection: ${collection}`);
                const event = {
                    type: 'update',
                    collection,
                    id: latestItem.id,
                    data: latestItem,
                    timestamp: new Date()
                };
                callbacks.forEach(callback => {
                    try {
                        callback(event);
                    }
                    catch (error) {
                        console.error('❌ Erro ao executar callback:', error);
                    }
                });
                this.lastChecks.set(collection, currentHash);
            }
        }
        catch (error) {
            console.error(`❌ Erro ao verificar collection ${collection}:`, error);
        }
    }
    generateHash(data) {
        const hashData = {
            id: data.id,
            date_updated: data.date_updated,
            date_created: data.date_created
        };
        return JSON.stringify(hashData);
    }
    getStats() {
        return {
            isPolling: this.isPolling,
            pollingInterval: this.pollingInterval,
            totalSubscriptions: this.callbacks.size,
            collections: Array.from(this.callbacks.keys()),
            lastChecks: Object.fromEntries(this.lastChecks)
        };
    }
}
exports.DirectusRealtimeService = DirectusRealtimeService;
//# sourceMappingURL=directus-realtime.service.js.map