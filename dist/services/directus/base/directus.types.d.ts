import { AxiosRequestConfig } from 'axios';
export interface DirectusResponse<T> {
    data: T;
    meta?: {
        total_count?: number;
        filter_count?: number;
    };
}
export interface LogConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    includeTimestamp?: boolean;
    includeServiceName?: boolean;
}
export interface CacheConfig {
    enabled: boolean;
    ttl: number;
    maxSize?: number;
}
export interface RetryConfig {
    enabled: boolean;
    maxRetries: number;
    delay: number;
    backoffMultiplier: number;
}
export interface BaseServiceConfig {
    baseUrl: string;
    timeout: number;
    retry: RetryConfig;
    cache: CacheConfig;
    logging: LogConfig;
}
export interface DirectusError {
    message: string;
    code: string;
    status?: number;
    details?: any;
}
export interface PerformanceMetrics {
    requestCount: number;
    averageResponseTime: number;
    errorCount: number;
    cacheHitRate: number;
}
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}
export interface RequestHeaders {
    'Content-Type': string;
    'Authorization'?: string;
    [key: string]: string | undefined;
}
export interface DirectusRequestOptions extends AxiosRequestConfig {
    skipCache?: boolean;
    retryOnFailure?: boolean;
    timeout?: number;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}
export interface ServiceStatus {
    isHealthy: boolean;
    lastCheck: Date;
    errors: string[];
    performance: PerformanceMetrics;
}
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type CacheStatus = 'hit' | 'miss' | 'expired' | 'disabled';
export interface AuditEvent {
    timestamp: string;
    service: string;
    event: string;
    data?: any;
    userId?: string;
    ipAddress?: string;
}
export interface RateLimitConfig {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
}
export interface TimeoutConfig {
    request: number;
    connection: number;
    response: number;
}
export interface ProxyConfig {
    enabled: boolean;
    host?: string;
    port?: number;
    auth?: {
        username: string;
        password: string;
    };
}
export interface SSLConfig {
    enabled: boolean;
    rejectUnauthorized: boolean;
    ca?: string;
    cert?: string;
    key?: string;
}
export interface DirectusServiceConfig {
    base: BaseServiceConfig;
    timeout: TimeoutConfig;
    rateLimit: RateLimitConfig;
    proxy?: ProxyConfig;
    ssl?: SSLConfig;
}
export interface HealthCheckResult {
    status: 'healthy' | 'unhealthy' | 'degraded';
    checks: {
        connectivity: boolean;
        authentication: boolean;
        database: boolean;
    };
    details: {
        responseTime: number;
        lastError?: string;
        uptime: number;
    };
}
export interface MonitoringConfig {
    enabled: boolean;
    metricsEndpoint?: string;
    healthCheckInterval: number;
    alertThresholds: {
        responseTime: number;
        errorRate: number;
    };
}
export interface MetricsData {
    timestamp: Date;
    service: string;
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
    success: boolean;
    cacheStatus?: CacheStatus;
}
export interface FallbackConfig {
    enabled: boolean;
    primaryEndpoint: string;
    fallbackEndpoints: string[];
    strategy: 'failover' | 'load-balance' | 'retry';
}
export interface CircuitBreakerConfig {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
    expectedErrors: string[];
}
export interface CompressionConfig {
    enabled: boolean;
    algorithm: 'gzip' | 'deflate' | 'br';
    threshold: number;
}
export interface DistributedCacheConfig {
    enabled: boolean;
    type: 'redis' | 'memcached' | 'memory';
    connection: {
        host: string;
        port: number;
        password?: string;
    };
    prefix: string;
    ttl: number;
}
export interface StructuredLoggingConfig {
    enabled: boolean;
    format: 'json' | 'text';
    includeFields: string[];
    excludeFields: string[];
    destination: 'console' | 'file' | 'external';
    filePath?: string;
    externalEndpoint?: string;
}
export interface AuthConfig {
    type: 'token' | 'credentials' | 'oauth';
    token?: string;
    credentials?: {
        email: string;
        password: string;
    };
    oauth?: {
        clientId: string;
        clientSecret: string;
        redirectUri: string;
    };
    autoRefresh: boolean;
    refreshThreshold: number;
}
export interface ValidationConfig {
    enabled: boolean;
    strict: boolean;
    sanitize: boolean;
    customValidators?: Record<string, (value: any) => boolean>;
}
export interface TransformationConfig {
    enabled: boolean;
    inputTransformers?: Record<string, (data: any) => any>;
    outputTransformers?: Record<string, (data: any) => any>;
    defaultTransformers: boolean;
}
export interface APIVersionConfig {
    version: string;
    deprecatedVersions: string[];
    migrationPaths: Record<string, string>;
    backwardCompatibility: boolean;
}
export interface AutoDocumentationConfig {
    enabled: boolean;
    generateOpenAPI: boolean;
    includeExamples: boolean;
    outputPath: string;
    title: string;
    version: string;
}
export interface TestConfig {
    enabled: boolean;
    mockResponses: boolean;
    recordResponses: boolean;
    testDataPath: string;
    coverageThreshold: number;
}
export interface DevelopmentConfig {
    hotReload: boolean;
    debugMode: boolean;
    verboseLogging: boolean;
    mockServices: boolean;
    testMode: boolean;
}
export interface ProductionConfig {
    optimization: boolean;
    minification: boolean;
    compression: boolean;
    caching: boolean;
    monitoring: boolean;
    alerting: boolean;
}
export interface EnvironmentConfig {
    name: 'development' | 'staging' | 'production' | 'test';
    variables: Record<string, string>;
    secrets: Record<string, string>;
    overrides: Record<string, any>;
}
export interface SecurityConfig {
    enabled: boolean;
    cors: {
        enabled: boolean;
        origins: string[];
        methods: string[];
        headers: string[];
    };
    rateLimiting: RateLimitConfig;
    inputValidation: ValidationConfig;
    outputSanitization: boolean;
    auditLogging: boolean;
}
export interface BackupConfig {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    retention: number;
    storage: 'local' | 'cloud' | 'hybrid';
    encryption: boolean;
    compression: boolean;
}
export interface DeployConfig {
    strategy: 'blue-green' | 'rolling' | 'canary';
    healthCheck: HealthCheckResult;
    rollback: {
        enabled: boolean;
        automatic: boolean;
        threshold: number;
    };
    monitoring: MonitoringConfig;
}
export interface CICDConfig {
    enabled: boolean;
    pipeline: string[];
    tests: TestConfig;
    quality: {
        linting: boolean;
        formatting: boolean;
        security: boolean;
        coverage: boolean;
    };
    deployment: DeployConfig;
}
export interface ObservabilityConfig {
    logging: StructuredLoggingConfig;
    metrics: {
        enabled: boolean;
        endpoint: string;
        interval: number;
    };
    tracing: {
        enabled: boolean;
        sampler: number;
        exporter: string;
    };
    alerting: {
        enabled: boolean;
        rules: Record<string, any>;
        channels: string[];
    };
}
export interface CompleteServiceConfig {
    base: DirectusServiceConfig;
    auth: AuthConfig;
    cache: DistributedCacheConfig;
    compression: CompressionConfig;
    monitoring: MonitoringConfig;
    security: SecurityConfig;
    observability: ObservabilityConfig;
    development: DevelopmentConfig;
    production: ProductionConfig;
    environment: EnvironmentConfig;
    backup: BackupConfig;
    deploy: DeployConfig;
    cicd: CICDConfig;
}
//# sourceMappingURL=directus.types.d.ts.map