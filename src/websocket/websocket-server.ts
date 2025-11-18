import { WebSocketServer, WebSocket } from 'ws';
import { DirectusWebSocketService } from './directus-websocket.service';
import { DirectusRealtimeService } from '../services/directus/directus-realtime.service';

export interface WebSocketMessage {
  type: string;
  collection?: string;
  data?: any;
  error?: string;
  eventType?: string;
  timestamp?: Date;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private directusService: DirectusWebSocketService;
  private realtimeService: DirectusRealtimeService;
  private clients = new Map<WebSocket, Set<string>>(); // client -> subscribed collections

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });
    this.directusService = new DirectusWebSocketService();
    this.realtimeService = new DirectusRealtimeService();
    this.setupWebSocket();
    console.log('🔌 WebSocket Server iniciado em /ws');
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔌 Cliente WebSocket conectado');
      
      // Inicializar cliente
      this.clients.set(ws, new Set());
      
      ws.on('message', (message: Buffer) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
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

  private async handleMessage(ws: WebSocket, data: WebSocketMessage) {
    console.log('📨 Mensagem recebida:', data);

    switch (data.type) {
      case 'subscribe_collection':
        if (data.collection) {
          await this.subscribeToCollection(ws, data.collection);
        } else {
          this.sendError(ws, 'Collection não especificada');
        }
        break;

      case 'unsubscribe_collection':
        if (data.collection) {
          await this.unsubscribeFromCollection(ws, data.collection);
        } else {
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

  private async subscribeToCollection(ws: WebSocket, collection: string) {
    try {
      console.log(`📡 Inscrevendo cliente na collection: ${collection}`);
      
      // Adicionar collection ao cliente
      const clientCollections = this.clients.get(ws);
      if (clientCollections) {
        clientCollections.add(collection);
      }

      // Inscrever no serviço de tempo real
      this.realtimeService.subscribeToCollection(collection, (event: any) => {
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

    } catch (error) {
      console.error(`❌ Erro ao inscrever na collection ${collection}:`, error);
      this.sendError(ws, `Erro ao inscrever na collection: ${error}`);
    }
  }

  private async unsubscribeFromCollection(ws: WebSocket, collection: string) {
    try {
      console.log(`📡 Desinscrevendo cliente da collection: ${collection}`);
      
      // Remover collection do cliente
      const clientCollections = this.clients.get(ws);
      if (clientCollections) {
        clientCollections.delete(collection);
      }

      // Verificar se ainda há clientes inscritos nesta collection
      let hasOtherClients = false;
      for (const [client, collections] of this.clients) {
        if (client !== ws && collections.has(collection)) {
          hasOtherClients = true;
          break;
        }
      }

      // Se não há outros clientes, desinscrever do serviço de tempo real
      if (!hasOtherClients) {
        this.realtimeService.unsubscribeFromCollection(collection);
      }

      this.sendMessage(ws, {
        type: 'unsubscription_confirmed',
        collection
      });

    } catch (error) {
      console.error(`❌ Erro ao desinscrever da collection ${collection}:`, error);
      this.sendError(ws, `Erro ao desinscrever da collection: ${error}`);
    }
  }

  private broadcastToCollection(collection: string, message: WebSocketMessage) {
    console.log(`📡 Broadcast para collection ${collection}:`, message);
    
    for (const [client, collections] of this.clients) {
      if (collections.has(collection) && client.readyState === WebSocket.OPEN) {
        this.sendMessage(client, message);
      }
    }
  }

  private sendMessage(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.sendMessage(ws, {
      type: 'error',
      error
    });
  }

  public getStats() {
    return {
      totalClients: this.clients.size,
      totalSubscriptions: Array.from(this.clients.values()).reduce((total, collections) => total + collections.size, 0),
      realtime: this.realtimeService.getStats()
    };
  }
}
