import WebSocket from 'ws';

export interface DirectusWebSocketMessage {
  type: string;
  collection?: string;
  payload?: any;
}

export class DirectusWebSocketService {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Set<Function>>(); // collection -> callbacks
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 segundo
  private isDirectusEnabled = false; // Flag para controlar se o Directus tem WebSocket

  constructor() {
    // Por enquanto, não conectar automaticamente ao Directus
    // O Directus precisa ter WebSocket habilitado
    console.log('⚠️ Directus WebSocket não habilitado - usando modo simulado');
  }

  private connectToDirectus() {
    if (!this.isDirectusEnabled) {
      console.log('⚠️ Directus WebSocket não habilitado, pulando conexão');
      return;
    }

    try {
      const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
      const wsUrl = directusUrl.replace('http', 'ws') + '/websocket';
      
      console.log('🔌 Conectando ao WebSocket do Directus:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        console.log('✅ Conectado ao WebSocket do Directus');
        this.reconnectAttempts = 0;
        
        // Re-inscrever em todas as collections após reconexão
        for (const collection of this.subscriptions.keys()) {
          this.subscribeToDirectusCollection(collection);
        }
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message: DirectusWebSocketMessage = JSON.parse(data.toString());
          this.handleDirectusMessage(message);
        } catch (error) {
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

    } catch (error) {
      console.error('❌ Erro ao conectar com Directus WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.isDirectusEnabled) return;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`);
      
      setTimeout(() => {
        this.connectToDirectus();
      }, delay);
    } else {
      console.error('❌ Máximo de tentativas de reconexão atingido');
    }
  }

  private handleDirectusMessage(message: DirectusWebSocketMessage) {
    console.log('📨 Mensagem do Directus:', message);

    if (message.type === 'items' && message.collection) {
      // Notificar todos os callbacks inscritos nesta collection
      const callbacks = this.subscriptions.get(message.collection);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(message.payload);
          } catch (error) {
            console.error('❌ Erro ao executar callback:', error);
          }
        });
      }
    }
  }

  private subscribeToDirectusCollection(collection: string) {
    if (!this.isDirectusEnabled) {
      console.log(`📡 Simulando inscrição no Directus collection: ${collection}`);
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'subscribe',
        collection: collection
      };
      
      console.log(`📡 Inscrevendo no Directus collection: ${collection}`);
      this.ws.send(JSON.stringify(subscribeMessage));
    } else {
      console.warn(`⚠️ WebSocket não está conectado, não foi possível inscrever na collection: ${collection}`);
    }
  }

  private unsubscribeFromDirectusCollection(collection: string) {
    if (!this.isDirectusEnabled) {
      console.log(`📡 Simulando desinscrição do Directus collection: ${collection}`);
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const unsubscribeMessage = {
        type: 'unsubscribe',
        collection: collection
      };
      
      console.log(`📡 Desinscrevendo do Directus collection: ${collection}`);
      this.ws.send(JSON.stringify(unsubscribeMessage));
    }
  }

  public async subscribeToCollection(collection: string, callback: Function) {
    console.log(`📡 Inscrevendo callback na collection: ${collection}`);
    
    // Adicionar callback à collection
    if (!this.subscriptions.has(collection)) {
      this.subscriptions.set(collection, new Set());
    }
    this.subscriptions.get(collection)!.add(callback);

    // Inscrever no Directus se habilitado
    if (this.isDirectusEnabled && this.subscriptions.get(collection)!.size === 1) {
      this.subscribeToDirectusCollection(collection);
    }
  }

  public async unsubscribeFromCollection(collection: string) {
    console.log(`📡 Desinscrevendo da collection: ${collection}`);
    
    // Remover collection das inscrições
    this.subscriptions.delete(collection);
    
    // Desinscrever do Directus se habilitado
    if (this.isDirectusEnabled) {
      this.unsubscribeFromDirectusCollection(collection);
    }
  }

  // Método para simular atualizações (para testes)
  public simulateUpdate(collection: string, data: any) {
    console.log(`🎭 Simulando atualização para collection: ${collection}`, data);
    
    const callbacks = this.subscriptions.get(collection);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Erro ao executar callback:', error);
        }
      });
    }
  }

  public getStats() {
    return {
      isConnected: this.isDirectusEnabled ? (this.ws?.readyState === WebSocket.OPEN) : false,
      isDirectusEnabled: this.isDirectusEnabled,
      totalSubscriptions: this.subscriptions.size,
      collections: Array.from(this.subscriptions.keys()),
      reconnectAttempts: this.reconnectAttempts
    };
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
