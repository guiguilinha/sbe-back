# Integração Keycloak + CPE Backend

## Visão Geral

Este documento descreve a implementação da integração entre o Keycloak (autenticação) e o CPE Backend (dados de empresas) no sistema de Maturidade Digital.

## Arquitetura

```
Frontend (React) 
    ↓ ID Token
Backend (Node.js/Express)
    ↓ Valida Token + Obtém Service Token
Keycloak (Servidor de Autenticação)
    ↓ Service Token
CPE Backend (API Externa)
    ↓ Dados das Empresas
Backend (Processamento)
    ↓ Dados Enriquecidos
Frontend (Exibição)
```

## Fluxo de Autenticação e Enriquecimento

### 1. Login do Usuário (Frontend → Keycloak)
- Usuário faz login no Keycloak
- Keycloak retorna um `idToken` com dados do usuário
- Frontend armazena o token e chama o backend

### 2. Validação do Token (Backend → Keycloak)
- Backend recebe o `idToken` do frontend
- Valida o token com o Keycloak
- Extrai dados do usuário (CPF, nome, email, etc.)

### 3. Obtenção de Service Token (Backend → Keycloak)
- Backend usa `client_credentials` para obter token de serviço
- Token de serviço é usado para chamar APIs externas

### 4. Busca de Dados da Empresa (Backend → CPE)
- Backend usa o CPF do usuário para buscar empresas
- CPE Backend retorna array de empresas vinculadas
- Cada empresa recebe um UUID único para identificação

### 5. Processamento e Retorno (Backend → Frontend)
- Dados do usuário + empresas são combinados
- Estrutura enriquecida é retornada ao frontend
- Frontend exibe dados seguros (sem informações sensíveis)

## Estrutura de Dados

### Usuário (ProcessedUserData)
```typescript
interface ProcessedUserData {
  id: string;
  name: string;
  email: string;
  given_name?: string;        // Nome do Keycloak
  lastName?: string;          // Sobrenome do Keycloak
  cpf?: string;
  dataNascimento?: string;
  genero?: string;
  cidade?: string;
  uf?: string;
  // ... outros campos
}
```

### Empresa (EmpresaVinculo)
```typescript
interface EmpresaVinculo {
  id: string;                 // UUID único
  cnpj: string;
  nome: string;
  isPrincipal: boolean;
  codStatusEmpresa: string;
  desTipoVinculo: string;
}
```

### Dados Enriquecidos (EnrichedUserData)
```typescript
interface EnrichedUserData {
  user: ProcessedUserData;
  empresas: EmpresaVinculo[]; // Array de empresas
  metadata: {
    hasEmpresaData: boolean;
    empresaSource: 'cpe-backend' | null;
    lastUpdated: string;
    processingTime: number;
  };
}
```

## Configuração de Ambiente

### Backend (.env)
```env
# Keycloak Backend
KEYCLOAK_BACKEND_REALM=externo
KEYCLOAK_BACKEND_AUTH_SERVER_URL=https://amei.homolog.kubernetes.sebrae.com.br/auth
KEYCLOAK_BACKEND_RESOURCE=maturidadedigital-backend
KEYCLOAK_BACKEND_SECRET=aUOg6iGnSLivRtMNzVB7N6bHBFHbZ6nZ

# CPE Backend
CPE_BACKEND_URL=https://cpe-backend.homologacao.sebrae.com.br/v1
CPE_BACKEND_TIMEOUT=10000
```

### Frontend (.env.development)
```env
VITE_API_URL=http://localhost:8080/api
```

## Endpoints da API

### POST /api/auth/enrich-user-data
**Descrição:** Enriquece dados do usuário com informações das empresas

**Headers:**
```
Authorization: Bearer <idToken>
Content-Type: application/json
```

**Resposta:**
```json
{
  "user": {
    "id": "629c05d3-ab8e-44f5-8f63-ebf3207289bb",
    "name": "Rafael Ornelas",
    "email": "faelso@gmail.com",
    "given_name": "Rafael",
    "lastName": "Ornelas",
    "cpf": "06249336605",
    // ... outros campos
  },
  "empresas": [
    {
      "id": "03f0266f-f85f-48d4-9098-904641c83434",
      "cnpj": "23937390000126",
      "nome": "RONALDO LÚCIO LIMA DOS SANTOS 60206020600",
      "isPrincipal": false,
      "codStatusEmpresa": "ANL",
      "desTipoVinculo": "REPRESENTANTE"
    },
    {
      "id": "211d8dde-4c84-4fd2-8dd5-573441e1f7f6",
      "cnpj": "16589137000163",
      "nome": "SEBRAE-MG",
      "isPrincipal": true,
      "codStatusEmpresa": "ANL",
      "desTipoVinculo": "REPRESENTANTE"
    }
  ],
  "metadata": {
    "hasEmpresaData": true,
    "empresaSource": "cpe-backend",
    "lastUpdated": "2025-10-16T18:08:00.000Z",
    "processingTime": 450
  }
}
```

### GET /api/auth/enrich-user-status
**Descrição:** Verifica status dos serviços de integração

### GET /api/auth/debug-empresa/:cpf
**Descrição:** Endpoint de debug para buscar dados de empresa por CPF

## Serviços Implementados

### KeycloakValidationService
- Valida tokens ID do Keycloak
- Obtém tokens de serviço via `client_credentials`
- Extrai CPF do token do usuário

### CpeBackendService
- Busca dados de empresas no CPE Backend
- Processa respostas da API externa
- Trata erros e timeouts

### DataMappingService
- Mapeia dados do Keycloak para estrutura interna
- Mapeia dados do CPE para estrutura de empresas
- Combina dados do usuário e empresas
- Gera UUIDs únicos para cada empresa

## Logs e Debug

O sistema inclui logs detalhados para facilitar o debug:

```
🔧 [KeycloakValidation] Configuração carregada
🔍 [KeycloakValidation] Token decodificado (resumo)
✅ [KeycloakValidation] Token validado com sucesso
🔑 [KeycloakValidation] Obtendo token de serviço
🏢 [CpeBackend] Buscando dados das empresas
✅ [DataMapping] Total de empresas mapeadas: 2
✅ [EnrichedUser] Dados enriquecidos com sucesso
```

## Segurança

- **Tokens de serviço:** Usados apenas no backend
- **Dados sensíveis:** Não enviados ao frontend
- **Validação de tokens:** Sempre validados com Keycloak
- **Timeouts:** Configuráveis para evitar travamentos
- **CORS:** Configurado para origens permitidas

## Tratamento de Erros

- **Token inválido:** Retorna 401
- **CPF não encontrado:** Retorna 400
- **API CPE indisponível:** Continua sem dados de empresa
- **Timeout:** Configurável (padrão 10s)
- **Erros de rede:** Logados e tratados graciosamente

## Exemplo de Uso

```typescript
// Frontend
const { enrichedUserData } = useSimpleAuth();

if (enrichedUserData?.empresas.length > 0) {
  console.log('Usuário tem empresas:', enrichedUserData.empresas);
  
  const empresaPrincipal = enrichedUserData.empresas.find(emp => emp.isPrincipal);
  if (empresaPrincipal) {
    console.log('Empresa principal:', empresaPrincipal.nome);
  }
}
```

## Monitoramento

- **Tempo de processamento:** Logado em cada requisição
- **Status dos serviços:** Endpoint dedicado para verificação
- **Logs estruturados:** Facilitam análise e debug
- **Métricas de performance:** Incluídas nos metadados

## Próximos Passos

1. **Cache:** Implementar cache para tokens de serviço
2. **Retry:** Adicionar retry automático para falhas de rede
3. **Métricas:** Implementar coleta de métricas detalhadas
4. **Testes:** Adicionar testes automatizados
5. **Documentação:** Expandir documentação da API
