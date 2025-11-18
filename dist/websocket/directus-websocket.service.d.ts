export interface DirectusWebSocketMessage {
    type: string;
    collection?: string;
    payload?: any;
}
export declare class DirectusWebSocketService {
    private ws;
    private subscriptions;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    private isDirectusEnabled;
    constructor();
    private connectToDirectus;
    private scheduleReconnect;
    private handleDirectusMessage;
    private subscribeToDirectusCollection;
    private unsubscribeFromDirectusCollection;
    subscribeToCollection(collection: string, callback: Function): Promise<void>;
    unsubscribeFromCollection(collection: string): Promise<void>;
    simulateUpdate(collection: string, data: any): void;
    getStats(): {
        isConnected: boolean;
        isDirectusEnabled: boolean;
        totalSubscriptions: number;
        collections: string[];
        reconnectAttempts: number;
    };
    disconnect(): void;
}
//# sourceMappingURL=directus-websocket.service.d.ts.map