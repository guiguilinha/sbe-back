# APIs de Persistência Directus

## Visão Geral

Este documento descreve a implementação completa das APIs de persistência para salvar e recuperar dados de usuários, empresas, diagnósticos e respostas no Directus, baseado na estrutura de collections definida no arquivo Postman.

## Arquitetura

```
Frontend (React)
    ↓ JSON de diagnóstico completo
Backend (Node.js/Express)
    ↓ Validação e processamento
Directus (CMS/Database)
    ↓ Collections estruturadas
Backend (Resposta enriquecida)
    ↓ Dados persistidos
Frontend (Confirmação)
```

## Estrutura de Collections

### Collections do Directus
- `users` - Dados dos usuários
- `companies` - Dados das empresas  
- `user_companies` - Relacionamento N:N usuário-empresa (junction)
- `diagnostics` - Sessões de diagnóstico
- `diagnostic_categories` - Resultados por categoria
- `answers_given` - Respostas individuais

### Relacionamentos
```
users ←→ user_companies ←→ companies
  ↓
diagnostics (user_id, company_id)
  ↓
diagnostic_categories (diagnostic_id)
  ↓
answers_given (diagnostic_category_id)
```

## Regras de Negócio

1. **Dados vêm do frontend**: Usuário e empresas são enviados pelo frontend
2. **Verificação antes de criar**: Sempre verificar se usuário/empresa existe antes de criar novo
3. **Relacionamento N:N**: Usuário pode ter múltiplas empresas, empresa pode ter múltiplos usuários
4. **Teste vinculado**: Cada teste (diagnóstico) é vinculado a UM usuário e UMA empresa específica
5. **Persistência obrigatória**: Todo teste finalizado deve ser salvo no banco

## Estrutura de Dados

### Usuário (User)
```typescript
interface User {
  id: number;
  given_name: string;
  last_name: string;
  cpf: string;
  data_nascimento: string;
  genero: string;
  uf: string;
  cidade: string;
  email: string;
  date_created?: string;
  date_updated?: string;
}
```

### Empresa (Company)
```typescript
interface Company {
  id: number;
  cnpj: string;
  nome: string;
  date_created?: string;
  date_updated?: string;
}
```

### Relacionamento Usuário-Empresa (UserCompany)
```typescript
interface UserCompany {
  id: number;
  user_id: number;
  company_id: number;
  is_principal: boolean;
  cod_status_empresa: string;
  des_tipo_vinculo: string;
}
```

### Diagnóstico (Diagnostic)
```typescript
interface Diagnostic {
  id: number;
  user_id: number;
  company_id: number;
  performed_at: string;
  overall_level_id: number;
  overall_score: number;
  overall_insight: string;
  status: string;
}
```

### Resultado por Categoria (DiagnosticCategory)
```typescript
interface DiagnosticCategory {
  id: number;
  diagnostic_id: number;
  category_id: number;
  level_id: number;
  score: number;
  insight: string;
  tip: string;
}
```

### Resposta Individual (AnswerGiven)
```typescript
interface AnswerGiven {
  id: number;
  diagnostic_category_id: number;
  question_id: number;
  answer_id: number;
  answer_text: string;
  score: number;
}
```

## Endpoints da API

### POST /api/diagnostics
**Descrição:** Salva diagnóstico completo no Directus

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (CompleteDiagnosticRequest):**
```json
{
  "usuario": {
    "given_name": "GUILHERME",
    "lastName": "MOACIR CAMPOS",
    "cpf": "996.020.320-49",
    "dataNascimento": "1983-02-21",
    "genero": "masculino",
    "uf": "RS",
    "cidade": "Porto Alegre",
    "email": "guilhermemcmps@gmail.com",
    "empresa": [
      {
        "cnpj": "23937390000126",
        "nome": "RONALDO LÚCIO LIMA DOS SANTOS 60206020600",
        "isPrincipal": false,
        "codStatusEmpresa": "ANL",
        "desTipoVinculo": "REPRESENTANTE"
      }
    ]
  },
  "diagnostico": {
    "empresaSelecionada": "23937390000126",
    "dataRealizacao": "2023-10-01T10:00:00Z",
    "nivelGeral": "Iniciante digital",
    "pontuacaoGeral": 45,
    "insightGeral": "Sua empresa está no caminho certo...",
    "status": "Concluído",
    "categorias": [
      {
        "idCategoria": 1,
        "nomeCategoria": "Presença Digital",
        "idNivelCategoria": 1,
        "nivelCategoria": "Básico",
        "pontuacaoCategoria": 15,
        "insightCategoria": "Sua empresa tem uma presença digital básica...",
        "dicaCategoria": "Invista na criação de um site responsivo...",
        "respostasCategoria": [
          {
            "idPergunta": 1,
            "pergunta": "Sua empresa possui um site?",
            "idResposta": 1,
            "resposta": "Sim",
            "pontuacao": 10
          }
        ]
      }
    ]
  }
}
```

**Resposta (CompleteDiagnosticResponse):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "given_name": "GUILHERME",
      "last_name": "MOACIR CAMPOS",
      "cpf": "996.020.320-49",
      // ... outros campos
    },
    "company": {
      "id": 1,
      "cnpj": "23937390000126",
      "nome": "RONALDO LÚCIO LIMA DOS SANTOS 60206020600"
    },
    "diagnostic": {
      "id": 1,
      "user_id": 1,
      "company_id": 1,
      "performed_at": "2023-10-01T10:00:00Z",
      "overall_level_id": 1,
      "overall_score": 45,
      "overall_insight": "Sua empresa está no caminho certo...",
      "status": "Concluído"
    },
    "categories": [
      {
        "id": 1,
        "diagnostic_id": 1,
        "category_id": 1,
        "level_id": 1,
        "score": 15,
        "insight": "Sua empresa tem uma presença digital básica...",
        "tip": "Invista na criação de um site responsivo..."
      }
    ]
  }
}
```

### GET /api/diagnostics/user/:userId
**Descrição:** Lista diagnósticos de um usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "company_id": 1,
      "performed_at": "2023-10-01T10:00:00Z",
      "overall_level_id": 1,
      "overall_score": 45,
      "overall_insight": "Sua empresa está no caminho certo...",
      "status": "Concluído"
    }
  ]
}
```

### GET /api/diagnostics/:id
**Descrição:** Busca diagnóstico específico

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "company_id": 1,
    "performed_at": "2023-10-01T10:00:00Z",
    "overall_level_id": 1,
    "overall_score": 45,
    "overall_insight": "Sua empresa está no caminho certo...",
    "status": "Concluído"
  }
}
```

## Serviços Implementados

### DirectusBaseService (Estendido)
**Localização:** `src/services/directus/base/directus-base.service.ts`

**Métodos adicionados:**
- `create(data, token?)` - Cria um novo item
- `createMany(data[], token?)` - Cria múltiplos itens (batch)
- `update(id, data, token?)` - Atualiza item existente
- `delete(id, token?)` - Deleta item por ID
- `getById(id, token?)` - Busca item por ID

### UsersService
**Localização:** `src/services/directus/persistence/users.service.ts`

**Métodos:**
- `createUser(userData, token?)` - Cria novo usuário
- `getUserByCpf(cpf, token?)` - Busca usuário por CPF
- `updateUser(id, userData, token?)` - Atualiza dados do usuário
- `getUserById(id, token?)` - Busca usuário por ID
- `findOrCreateUser(userData, token?)` - Verifica existência ou cria novo

### CompaniesService
**Localização:** `src/services/directus/persistence/companies.service.ts`

**Métodos:**
- `createCompany(companyData, token?)` - Cria nova empresa
- `getCompanyByCnpj(cnpj, token?)` - Busca empresa por CNPJ
- `updateCompany(id, companyData, token?)` - Atualiza dados da empresa
- `getCompanyById(id, token?)` - Busca empresa por ID
- `findOrCreateCompany(companyData, token?)` - Verifica existência ou cria nova

### UserCompaniesService
**Localização:** `src/services/directus/persistence/user-companies.service.ts`

**Métodos:**
- `linkUserToCompany(userId, companyId, linkData, token?)` - Vincula usuário à empresa
- `getUserCompanyLink(userId, companyId, token?)` - Busca vínculo específico
- `getUserCompanies(userId, token?)` - Busca empresas do usuário
- `getCompanyUsers(companyId, token?)` - Busca usuários da empresa
- `unlinkUserFromCompany(userId, companyId, token?)` - Desvincula usuário da empresa

### DiagnosticsService
**Localização:** `src/services/directus/persistence/diagnostics.service.ts`

**Métodos:**
- `createDiagnostic(diagnosticData, token?)` - Cria novo diagnóstico
- `getUserDiagnostics(userId, token?)` - Busca diagnósticos do usuário
- `getCompanyDiagnostics(companyId, token?)` - Busca diagnósticos da empresa
- `getDiagnosticById(id, token?)` - Busca diagnóstico por ID
- `updateDiagnosticStatus(id, status, token?)` - Atualiza status do diagnóstico

### DiagnosticCategoriesService
**Localização:** `src/services/directus/persistence/diagnostic-categories.service.ts`

**Métodos:**
- `createCategoryResult(categoryData, token?)` - Cria resultado de categoria
- `createCategoryResults(categoriesData, token?)` - Cria múltiplos resultados (batch)
- `getDiagnosticCategories(diagnosticId, token?)` - Busca categorias do diagnóstico

### AnswersGivenService
**Localização:** `src/services/directus/persistence/answers-given.service.ts`

**Métodos:**
- `saveAnswers(answersData, token?)` - Salva múltiplas respostas (batch)
- `getAnswersByDiagnosticCategory(diagnosticCategoryId, token?)` - Busca respostas da categoria
- `getAnswersByDiagnostic(diagnosticId, token?)` - Busca todas as respostas do diagnóstico

### DiagnosticPersistenceService (Orquestrador)
**Localização:** `src/services/directus/persistence/diagnostic-persistence.service.ts`

**Método principal:**
- `saveCompleteDiagnostic(requestData, token?)` - Orquestra todo o processo de persistência

**Fluxo de execução:**
1. Verificar se usuário existe (por CPF), senão criar
2. Para cada empresa: verificar se existe (por CNPJ), senão criar
3. Vincular usuário às empresas (user_companies)
4. Criar diagnóstico principal
5. Para cada categoria: criar resultado de categoria
6. Para cada resposta: salvar em answers_given
7. Retornar estrutura completa

## Controllers e Rotas

### DiagnosticController
**Localização:** `src/controllers/diagnostic.controller.ts`

**Métodos:**
- `saveDiagnostic(req, res)` - POST /api/diagnostics
- `getUserDiagnostics(req, res)` - GET /api/diagnostics/user/:userId
- `getDiagnosticById(req, res)` - GET /api/diagnostics/:id

### Rotas
**Localização:** `src/routes/diagnostic.routes.ts`

**Endpoints:**
- `POST /api/diagnostics` - Salvar diagnóstico completo
- `GET /api/diagnostics/user/:userId` - Listar diagnósticos do usuário
- `GET /api/diagnostics/:id` - Buscar diagnóstico específico

## Configuração

### Variáveis de Ambiente
```env
# Directus
DIRECTUS_URL=https://your-directus-instance.com
DIRECTUS_TOKEN=your-directus-token

# Aplicação
NODE_ENV=development
PORT=8080
```

### Integração no app.ts
```typescript
import diagnosticRoutes from './routes/diagnostic.routes';

// Rotas da API
app.use('/api/diagnostics', diagnosticRoutes);
```

## Logs e Debug

O sistema inclui logs estruturados para facilitar o debug:

```
[UsersService] Verificando existência do usuário...
[UsersService] Usuário já existe, retornando existente
[CompaniesService] Verificando existência da empresa...
[CompaniesService] Empresa não existe, criando nova
[UserCompaniesService] Vinculando usuário à empresa: { userId: 1, companyId: 1 }
[DiagnosticsService] Criando novo diagnóstico: { user_id: 1, company_id: 1 }
[DiagnosticPersistence] Diagnóstico completo salvo com sucesso
```

## Segurança

- **Validação de tokens**: Sempre validados em todas as requisições
- **Sanitização de inputs**: Dados são validados antes de persistir
- **Logs seguros**: Não expõe dados sensíveis em logs
- **Controle de permissões**: Por usuário e empresa
- **Transações lógicas**: Operações atômicas para dados relacionados

## Tratamento de Erros

- **Token inválido**: Retorna 401
- **Dados inválidos**: Retorna 400
- **Empresa não encontrada**: Retorna 400
- **Nível não encontrado**: Retorna 400
- **Erro de persistência**: Retorna 500
- **Rollback manual**: Se necessário, registros são deletados manualmente

## Exemplo de Uso

```typescript
// Frontend - Enviar diagnóstico
const response = await fetch('/api/diagnostics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(diagnosticData)
});

const result = await response.json();
if (result.success) {
  console.log('Diagnóstico salvo:', result.data);
}
```

## Monitoramento

- **Tempo de processamento**: Logado em cada operação
- **Status das operações**: Logs estruturados
- **Métricas de performance**: Incluídas nos logs
- **Rastreabilidade**: Cada operação é logada com contexto

## Estrutura de Arquivos

```
src/
├── contracts/persistence/
│   └── persistence.types.ts          # Interfaces TypeScript
├── services/directus/persistence/
│   ├── users.service.ts              # Gerenciar usuários
│   ├── companies.service.ts          # Gerenciar empresas
│   ├── user-companies.service.ts     # Relacionamento N:N
│   ├── diagnostics.service.ts        # Gerenciar diagnósticos
│   ├── diagnostic-categories.service.ts # Resultados por categoria
│   ├── answers-given.service.ts      # Respostas individuais
│   ├── diagnostic-persistence.service.ts # Orquestrador
│   └── index.ts                      # Exports
├── controllers/
│   └── diagnostic.controller.ts      # Endpoints REST
└── routes/
    └── diagnostic.routes.ts          # Rotas de diagnóstico
```

## Commits Realizados

Cada task foi commitada individualmente seguindo o padrão:
- `feat: [Task 1.1] Adicionar métodos CRUD ao DirectusBaseService`
- `feat: [Task 1.2] Criar tipos de persistência`
- `feat: [Task 1.3] Implementar UsersService`
- `feat: [Task 1.4] Implementar CompaniesService`
- `feat: [Task 1.5] Implementar UserCompaniesService`
- `feat: [Task 1.6] Implementar DiagnosticsService`
- `feat: [Task 1.7] Implementar DiagnosticCategoriesService`
- `feat: [Task 1.8] Implementar AnswersGivenService`
- `feat: [Task 1.9] Implementar DiagnosticPersistenceService (orquestrador)`
- `feat: [Task 1.10] Criar index de exports dos serviços de persistência`
- `feat: [Task 1.11] Implementar DiagnosticController`
- `feat: [Task 1.12] Criar rotas REST para diagnósticos`
- `feat: [Task 1.13] Integrar rotas no app.ts`

## Próximos Passos

1. **Task 1.14**: Adicionar campo `company_id` na collection `diagnostics` do Directus
2. **Testes unitários**: Criar testes para todos os serviços
3. **Testes de integração**: Testar fluxo completo
4. **Validações de dados**: Implementar validações de CPF, CNPJ, email
5. **Integração com dashboard**: Substituir dados mockados por dados reais
6. **Cache**: Implementar cache para consultas frequentes
7. **Retry logic**: Adicionar retry automático para falhas de rede
8. **Métricas**: Implementar coleta de métricas detalhadas
9. **Documentação**: Expandir documentação da API
10. **Deploy**: Configurar deploy em staging e produção
