import { AxiosRequestConfig } from 'axios';

// Interface base para respostas do Directus
export interface DirectusResponse<T> {
  data: T;
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

// Interface para configuração de logs
export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  includeTimestamp?: boolean;
  includeServiceName?: boolean;
}

// Interface para configuração de cache
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live em milissegundos
  maxSize?: number; // Máximo de itens no cache
}

// Interface para configuração de retry
export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  delay: number; // Delay entre tentativas em milissegundos
  backoffMultiplier: number;
}

// Interface para configuração do serviço base
export interface BaseServiceConfig {
  baseUrl: string;
  timeout: number;
  retry: RetryConfig;
  cache: CacheConfig;
  logging: LogConfig;
}

// Interface para erros do Directus
export interface DirectusError {
  message: string;
  code: string;
  status?: number;
  details?: any;
}

// Interface para métricas de performance
export interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorCount: number;
  cacheHitRate: number;
}

// Interface para dados de cache
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Interface para configuração de headers
export interface RequestHeaders {
  'Content-Type': string;
  'Authorization'?: string;
  [key: string]: string | undefined;
}

// Interface para opções de request
export interface DirectusRequestOptions extends AxiosRequestConfig {
  skipCache?: boolean;
  retryOnFailure?: boolean;
  timeout?: number;
}

// Interface para resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Interface para status do serviço
export interface ServiceStatus {
  isHealthy: boolean;
  lastCheck: Date;
  errors: string[];
  performance: PerformanceMetrics;
}

// Tipos para diferentes níveis de log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Tipos para métodos HTTP
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Tipos para status de cache
export type CacheStatus = 'hit' | 'miss' | 'expired' | 'disabled';

// Interface para eventos de auditoria
export interface AuditEvent {
  timestamp: string;
  service: string;
  event: string;
  data?: any;
  userId?: string;
  ipAddress?: string;
}

// Interface para configuração de rate limiting
export interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  windowMs: number; // Janela de tempo em milissegundos
}

// Interface para configuração de timeout
export interface TimeoutConfig {
  request: number; // Timeout para requests individuais
  connection: number; // Timeout para estabelecer conexão
  response: number; // Timeout para receber resposta
}

// Interface para configuração de proxy
export interface ProxyConfig {
  enabled: boolean;
  host?: string;
  port?: number;
  auth?: {
    username: string;
    password: string;
  };
}

// Interface para configuração de SSL/TLS
export interface SSLConfig {
  enabled: boolean;
  rejectUnauthorized: boolean;
  ca?: string;
  cert?: string;
  key?: string;
}

// Interface para configuração completa do serviço
export interface DirectusServiceConfig {
  base: BaseServiceConfig;
  timeout: TimeoutConfig;
  rateLimit: RateLimitConfig;
  proxy?: ProxyConfig;
  ssl?: SSLConfig;
}

// Interface para resultado de health check
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

// Interface para configuração de monitoramento
export interface MonitoringConfig {
  enabled: boolean;
  metricsEndpoint?: string;
  healthCheckInterval: number;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
  };
}

// Interface para dados de métricas
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

// Interface para configuração de fallback
export interface FallbackConfig {
  enabled: boolean;
  primaryEndpoint: string;
  fallbackEndpoints: string[];
  strategy: 'failover' | 'load-balance' | 'retry';
}

// Interface para configuração de circuit breaker
export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  recoveryTimeout: number;
  expectedErrors: string[];
}

// Interface para configuração de compressão
export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'deflate' | 'br';
  threshold: number; // Tamanho mínimo para compressão
}

// Interface para configuração de cache distribuído
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

// Interface para configuração de logging estruturado
export interface StructuredLoggingConfig {
  enabled: boolean;
  format: 'json' | 'text';
  includeFields: string[];
  excludeFields: string[];
  destination: 'console' | 'file' | 'external';
  filePath?: string;
  externalEndpoint?: string;
}

// Interface para configuração de autenticação
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
  refreshThreshold: number; // Segundos antes da expiração
}

// Interface para configuração de validação de dados
export interface ValidationConfig {
  enabled: boolean;
  strict: boolean; // Se true, rejeita dados inválidos
  sanitize: boolean; // Se true, limpa dados inválidos
  customValidators?: Record<string, (value: any) => boolean>;
}

// Interface para configuração de transformação de dados
export interface TransformationConfig {
  enabled: boolean;
  inputTransformers?: Record<string, (data: any) => any>;
  outputTransformers?: Record<string, (data: any) => any>;
  defaultTransformers: boolean;
}

// Interface para configuração de versionamento de API
export interface APIVersionConfig {
  version: string;
  deprecatedVersions: string[];
  migrationPaths: Record<string, string>;
  backwardCompatibility: boolean;
}

// Interface para configuração de documentação automática
export interface AutoDocumentationConfig {
  enabled: boolean;
  generateOpenAPI: boolean;
  includeExamples: boolean;
  outputPath: string;
  title: string;
  version: string;
}

// Interface para configuração de testes
export interface TestConfig {
  enabled: boolean;
  mockResponses: boolean;
  recordResponses: boolean;
  testDataPath: string;
  coverageThreshold: number;
}

// Interface para configuração de desenvolvimento
export interface DevelopmentConfig {
  hotReload: boolean;
  debugMode: boolean;
  verboseLogging: boolean;
  mockServices: boolean;
  testMode: boolean;
}

// Interface para configuração de produção
export interface ProductionConfig {
  optimization: boolean;
  minification: boolean;
  compression: boolean;
  caching: boolean;
  monitoring: boolean;
  alerting: boolean;
}

// Interface para configuração de ambiente
export interface EnvironmentConfig {
  name: 'development' | 'staging' | 'production' | 'test';
  variables: Record<string, string>;
  secrets: Record<string, string>;
  overrides: Record<string, any>;
}

// Interface para configuração de segurança
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

// Interface para configuração de backup e recuperação
export interface BackupConfig {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly';
  retention: number; // Dias
  storage: 'local' | 'cloud' | 'hybrid';
  encryption: boolean;
  compression: boolean;
}

// Interface para configuração de deploy
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

// Interface para configuração de CI/CD
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

// Interface para configuração de observabilidade
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

// Interface para configuração completa do sistema
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