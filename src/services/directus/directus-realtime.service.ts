import { DirectusBaseService } from './base/directus-base.service';

export interface DirectusChangeEvent {
  type: 'create' | 'update' | 'delete';
  collection: string;
  id?: string;
  data?: any;
  timestamp: Date;
}

class DirectusGenericService extends DirectusBaseService<any> {
  protected serviceName = 'items';

  public async fetchLatestByUpdatedAt(collection: string, token?: string) {
    const response = await this.makeRequest<any[]>(`items/${collection}`, {
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

export class DirectusRealtimeService {
  private baseService: DirectusGenericService;
  private pollingInterval: number = 2000; // 2 segundos
  private isPolling: boolean = false;
  private lastChecks: Map<string, string> = new Map(); // collection -> last hash
  private callbacks: Map<string, Set<(event: DirectusChangeEvent) => void>> = new Map();
  private pollTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.baseService = new DirectusGenericService();
    console.log('🔍 Directus Realtime Service iniciado');
  }

  public startPolling() {
    if (this.isPolling) {
      console.log('⚠️ Polling já está ativo');
      return;
    }

    this.isPolling = true;
    console.log('🔄 Iniciando polling do Directus...');
    this.poll();
  }

  public stopPolling() {
    this.isPolling = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    console.log('⏹️ Polling parado');
  }

  public subscribeToCollection(collection: string, callback: (event: DirectusChangeEvent) => void) {
    console.log(`📡 Inscrevendo em mudanças da collection: ${collection}`);
    
    if (!this.callbacks.has(collection)) {
      this.callbacks.set(collection, new Set());
    }
    
    this.callbacks.get(collection)!.add(callback);
    
    // Iniciar polling se não estiver ativo
    if (!this.isPolling) {
      this.startPolling();
    }
  }

  public unsubscribeFromCollection(collection: string, callback?: (event: DirectusChangeEvent) => void) {
    if (!this.callbacks.has(collection)) {
      return;
    }

    if (callback) {
      this.callbacks.get(collection)!.delete(callback);
    } else {
      this.callbacks.delete(collection);
    }

    console.log(`📡 Desinscrevendo da collection: ${collection}`);
  }

  private async poll() {
    if (!this.isPolling) return;

    try {
      // Verificar todas as collections inscritas
      for (const [collection, callbacks] of this.callbacks.entries()) {
        await this.checkCollectionChanges(collection, callbacks);
      }
    } catch (error) {
      console.error('❌ Erro durante polling:', error);
    }

    // Agendar próximo poll
    this.pollTimer = setTimeout(() => {
      this.poll();
    }, this.pollingInterval);
  }

  private async checkCollectionChanges(collection: string, callbacks: Set<(event: DirectusChangeEvent) => void>) {
    try {
      // Buscar dados da collection
      const latest = await this.baseService.fetchLatestByUpdatedAt(collection);

      if (!latest || latest.length === 0) {
        return;
      }

      const latestItem = latest[0];
      const currentHash = this.generateHash(latestItem);
      const lastHash = this.lastChecks.get(collection);

      // Se houve mudança
      if (lastHash !== currentHash) {
        console.log(`🔄 Mudança detectada na collection: ${collection}`);
        
        const event: DirectusChangeEvent = {
          type: 'update',
          collection,
          id: latestItem.id,
          data: latestItem,
          timestamp: new Date()
        };

        // Notificar todos os callbacks
        callbacks.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            console.error('❌ Erro ao executar callback:', error);
          }
        });

        // Atualizar hash
        this.lastChecks.set(collection, currentHash);
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar collection ${collection}:`, error);
    }
  }

  private generateHash(data: any): string {
    // Gerar hash simples baseado em data_updated e id
    const hashData = {
      id: data.id,
      date_updated: data.date_updated,
      date_created: data.date_created
    };
    return JSON.stringify(hashData);
  }

  public getStats() {
    return {
      isPolling: this.isPolling,
      pollingInterval: this.pollingInterval,
      totalSubscriptions: this.callbacks.size,
      collections: Array.from(this.callbacks.keys()),
      lastChecks: Object.fromEntries(this.lastChecks)
    };
  }
}
