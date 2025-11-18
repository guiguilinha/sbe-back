import { DirectusResponse, DirectusRequestOptions } from './directus.types';
export declare abstract class DirectusBaseService<T = any> {
    protected abstract serviceName: string;
    private get baseUrl();
    private resolveToken;
    private readonly defaultTimeout;
    protected makeRequest<R = T>(endpoint: string, options?: DirectusRequestOptions & {
        token?: string;
    }, attempt?: number): Promise<DirectusResponse<R>>;
    protected makeRequestWithPreview<R = T>(endpoint: string, previewToken: string, options?: DirectusRequestOptions, attempt?: number): Promise<DirectusResponse<R>>;
    protected fetch(options?: DirectusRequestOptions & {
        filter?: Record<string, any>;
        limit?: number;
        fields?: string[];
    } & {
        token?: string;
    }): Promise<T[]>;
    protected fetchWithPreview(previewToken: string, options?: DirectusRequestOptions & {
        filter?: Record<string, any>;
        limit?: number;
        fields?: string[];
    }): Promise<T[]>;
    fetchSectionWithExtras<S, E = any>(extrasConfig: Record<string, {
        endpoint: string;
        sort?: string;
    }>, options?: {
        token?: string;
        filter?: Record<string, any>;
        fields?: string[];
    }): Promise<{
        section: S;
    } & Record<string, E[]>>;
    healthCheck(): Promise<boolean>;
    protected create(data: Partial<T>, token?: string): Promise<T>;
    protected createMany(data: Partial<T>[], token?: string): Promise<T[]>;
    protected update(id: string | number, data: Partial<T>, token?: string): Promise<T>;
    protected delete(id: string | number, token?: string): Promise<void>;
    protected getById(id: string | number, token?: string): Promise<T>;
}
//# sourceMappingURL=directus-base.service.d.ts.map