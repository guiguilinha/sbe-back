export interface DirectusChangeEvent {
    type: 'create' | 'update' | 'delete';
    collection: string;
    id?: string;
    data?: any;
    timestamp: Date;
}
export declare class DirectusRealtimeService {
    private baseService;
    private pollingInterval;
    private isPolling;
    private lastChecks;
    private callbacks;
    private pollTimer;
    constructor();
    startPolling(): void;
    stopPolling(): void;
    subscribeToCollection(collection: string, callback: (event: DirectusChangeEvent) => void): void;
    unsubscribeFromCollection(collection: string, callback?: (event: DirectusChangeEvent) => void): void;
    private poll;
    private checkCollectionChanges;
    private generateHash;
    getStats(): {
        isPolling: boolean;
        pollingInterval: number;
        totalSubscriptions: number;
        collections: string[];
        lastChecks: {
            [k: string]: string;
        };
    };
}
//# sourceMappingURL=directus-realtime.service.d.ts.map