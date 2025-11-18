export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    details?: any;
}
export interface DirectusConfig {
    url: string;
    token?: string;
    email?: string;
    password?: string;
}
//# sourceMappingURL=auth.d.ts.map