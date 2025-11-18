# Directus Base Service

## Responsabilidade

O `DirectusBaseService` é a **classe base** que fornece funcionalidades compartilhadas para todos os outros serviços Directus. Ele encapsula a lógica de comunicação com a API do Directus.

## Funcionalidades

### Configuração
- Gerenciamento de URLs do Directus (Portainer vs Directus normal)
- Configuração de tokens de autenticação
- Configuração de credenciais (email/password)

### Comunicação HTTP
- Método `makeRequest()` genérico para todas as operações
- Configuração automática de headers
- Tratamento de erros centralizado
- Logs de debug detalhados

### Tratamento de Erros
- Captura de erros específicos do Directus
- Logs estruturados para debugging
- Propagação de erros com contexto

## Estrutura da Classe

```typescript
class DirectusBaseService {
  // Propriedades privadas para configuração
  private get baseUrl(): string
  private get token(): string | undefined
  private get email(): string | undefined
  private get password(): string | undefined

  // Método principal de comunicação
  public async makeRequest(endpoint: string, options: AxiosRequestConfig = {})

  // Métodos utilitários
  private logRequest(endpoint: string, options: any)
  private logResponse(response: any, endpoint: string)
  private logError(error: any, endpoint: string)
}
```

## Migração do Código Atual

### Extrair do `directus.service.ts`:

**Linhas 18-32:** Configurações
```typescript
private get baseUrl(): string {
  return process.env.DIRECTUS_PORTAINER_URL || process.env.DIRECTUS_URL || '';
}
private get token(): string | undefined {
  return process.env.DIRECTUS_PORTAINER_TOKEN || process.env.DIRECTUS_TOKEN;
}
// ... outras configurações
```

**Linhas 34-85:** Método `makeRequest()`
```typescript
public async makeRequest(endpoint: string, options: AxiosRequestConfig = {}) {
  // Lógica de comunicação HTTP
  // Tratamento de headers
  // Tratamento de erros
  // Logs
}
```

## Melhorias Propostas

### 1. Logs Mais Estruturados
```typescript
private logRequest(serviceName: string, endpoint: string, options: any) {
  console.log(`[${serviceName}] Request:`, {
    endpoint,
    method: options.method || 'GET',
    hasToken: !!this.token,
    timestamp: new Date().toISOString()
  });
}
```

### 2. Retry Logic
```typescript
private async makeRequestWithRetry(endpoint: string, options: AxiosRequestConfig = {}, retries = 3) {
  // Implementar retry automático para falhas temporárias
}
```

### 3. Cache Básico
```typescript
private cache = new Map<string, { data: any; timestamp: number }>();

private async makeRequestWithCache(endpoint: string, options: AxiosRequestConfig = {}, ttl = 300000) {
  // Cache simples para requests GET
}
```

## Interface Pública

```typescript
export abstract class DirectusBaseService {
  protected abstract serviceName: string;
  
  protected async makeRequest<T>(endpoint: string, options?: AxiosRequestConfig): Promise<DirectusResponse<T>>;
  protected logInfo(message: string, data?: any): void;
  protected logError(message: string, error?: any): void;
  protected logWarning(message: string, data?: any): void;
}
```

## Testes

### Cenários de Teste
- [ ] Configuração correta com variáveis de ambiente
- [ ] Fallback para configurações alternativas
- [ ] Tratamento de erros de rede
- [ ] Tratamento de erros de autenticação
- [ ] Logs estruturados
- [ ] Timeout de requests

### Mocks Necessários
- Mock do axios para simular requests
- Mock das variáveis de ambiente
- Mock do console.log para verificar logs

## Dependências

- `axios`: Cliente HTTP
- `process.env`: Variáveis de ambiente
- `console`: Logs de debug

## Integração com Outros Serviços

Todos os outros serviços devem estender esta classe base:

```typescript
export class QuestionsService extends DirectusBaseService {
  protected serviceName = 'QuestionsService';
  
  async getQuestions(): Promise<Question[]> {
    return this.makeRequest<Question[]>('quiz_questions?sort=order&fields=*,category_id.*');
  }
}
``` 