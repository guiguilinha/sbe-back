export interface WebSocketMessage {
    type: string;
    collection?: string;
    data?: any;
    error?: string;
    eventType?: string;
    timestamp?: Date;
}
export declare class WebSocketManager {
    private wss;
    private directusService;
    private realtimeService;
    private clients;
    constructor(server: any);
    private setupWebSocket;
    private handleMessage;
    private subscribeToCollection;
    private unsubscribeFromCollection;
    private broadcastToCollection;
    private sendMessage;
    private sendError;
    getStats(): {
        totalClients: number;
        totalSubscriptions: number;
        realtime: {
            isPolling: boolean;
            pollingInterval: number;
            totalSubscriptions: number;
            collections: string[];
            lastChecks: {
                [k: string]: string;
            };
        };
    };
}
//# sourceMappingURL=websocket-server.d.ts.map