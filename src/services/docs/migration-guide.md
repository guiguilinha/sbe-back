# Guia de Migração - Refatoração dos Serviços Directus

## Visão Geral

Este guia detalha o processo de migração do serviço Directus monolítico para a nova arquitetura modular, garantindo uma transição segura e sem interrupções.

## Pré-requisitos

### Análise do Código Atual
- [ ] Identificar todos os usos do `directus.service.ts`
- [ ] Mapear dependências entre funcionalidades
- [ ] Documentar endpoints e tipos utilizados
- [ ] Verificar testes existentes

### Preparação do Ambiente
- [ ] Criar branch de desenvolvimento
- [ ] Configurar ambiente de testes
- [ ] Preparar rollback plan
- [ ] Documentar estado atual

## Estratégia de Migração

### Fase 1: Estrutura Base (Semana 1)

#### 1.1 Criar Estrutura de Diretórios
```bash
mkdir -p backend/src/services/directus/base
mkdir -p backend/src/services/directus/docs
```

#### 1.2 Implementar Base Service
- [ ] Criar `directus-base.service.ts`
- [ ] Migrar configurações do arquivo original
- [ ] Migrar método `makeRequest()`
- [ ] Implementar logs estruturados
- [ ] Adicionar tratamento de erros melhorado

#### 1.3 Criar Tipos Compartilhados
- [ ] Criar `directus.types.ts`
- [ ] Migrar interfaces existentes
- [ ] Adicionar novos tipos necessários
- [ ] Documentar tipos complexos

### Fase 2: Migração por Domínio (Semanas 2-3)

#### 2.1 Questions Service
- [ ] Criar `questions.service.ts`
- [ ] Migrar métodos de categorias e perguntas
- [ ] Implementar validações
- [ ] Adicionar cache para categorias
- [ ] Criar testes unitários

#### 2.2 Results Service
- [ ] Criar `results.service.ts`
- [ ] Migrar métodos de resultados e níveis
- [ ] Implementar lógica de recomendações
- [ ] Adicionar análise de tendências
- [ ] Criar testes unitários

#### 2.3 Homepage Service
- [ ] Criar `homepage.service.ts`
- [ ] Migrar funções de dados da homepage
- [ ] Implementar transformação de dados
- [ ] Adicionar cache inteligente
- [ ] Criar testes unitários

#### 2.4 Auth Service
- [ ] Criar `auth.service.ts`
- [ ] Migrar lógica de autenticação
- [ ] Implementar gerenciamento de tokens
- [ ] Adicionar logs de auditoria
- [ ] Criar testes unitários

### Fase 3: Integração e Testes (Semana 4)

#### 3.1 Criar Index de Exportações
```typescript
// backend/src/services/directus/index.ts
export { DirectusBaseService } from './base/directus-base.service';
export { QuestionsService } from './questions.service';
export { ResultsService } from './results.service';
export { HomepageService } from './homepage.service';
export { DirectusAuthService } from './auth.service';

// Manter compatibilidade com código existente
export { directusService } from './legacy-compatibility';
```

#### 3.2 Atualizar Controllers
- [ ] Identificar todos os controllers que usam `directus.service.ts`
- [ ] Migrar para novos serviços
- [ ] Manter compatibilidade durante transição
- [ ] Adicionar logs de migração

#### 3.3 Testes de Integração
- [ ] Testar todos os endpoints
- [ ] Verificar performance
- [ ] Validar logs
- [ ] Testar cenários de erro

### Fase 4: Deploy e Monitoramento (Semana 5)

#### 4.1 Deploy Gradual
- [ ] Deploy em ambiente de staging
- [ ] Testes de carga
- [ ] Monitoramento de performance
- [ ] Validação de logs

#### 4.2 Deploy em Produção
- [ ] Deploy com feature flags
- [ ] Monitoramento ativo
- [ ] Rollback plan pronto
- [ ] Documentação atualizada

## Plano de Rollback

### Cenários de Rollback
1. **Erro Crítico**: Voltar imediatamente para versão anterior
2. **Performance Degradada**: Investigar e otimizar
3. **Logs Excessivos**: Ajustar níveis de log
4. **Problemas de Cache**: Limpar caches ou desabilitar temporariamente

### Procedimento de Rollback
```bash
# 1. Reverter para branch anterior
git checkout main
git revert <commit-hash>

# 2. Restaurar arquivo original
git checkout <commit-hash> -- backend/src/services/directus.service.ts

# 3. Deploy de emergência
npm run deploy:emergency
```

## Checklist de Migração

### Pré-Migração
- [ ] Backup do código atual
- [ ] Documentação do estado atual
- [ ] Testes de regressão passando
- [ ] Ambiente de staging configurado
- [ ] Equipe notificada

### Durante Migração
- [ ] Implementar um serviço por vez
- [ ] Testes unitários para cada serviço
- [ ] Validação de logs
- [ ] Verificação de performance
- [ ] Documentação atualizada

### Pós-Migração
- [ ] Remover arquivo original
- [ ] Limpar imports não utilizados
- [ ] Atualizar documentação
- [ ] Treinamento da equipe
- [ ] Monitoramento contínuo

## Métricas de Sucesso

### Performance
- [ ] Tempo de resposta mantido ou melhorado
- [ ] Uso de memória otimizado
- [ ] Logs estruturados e informativos
- [ ] Cache funcionando corretamente

### Qualidade
- [ ] Cobertura de testes > 80%
- [ ] Zero regressões funcionais
- [ ] Logs sem informações sensíveis
- [ ] Tratamento de erros robusto

### Manutenibilidade
- [ ] Código mais legível
- [ ] Responsabilidades bem definidas
- [ ] Documentação completa
- [ ] Fácil adição de novos recursos

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Import
```typescript
// Erro: Cannot find module './directus.service'
// Solução: Atualizar imports para nova estrutura
import { QuestionsService } from './directus/questions.service';
```

#### 2. Token de Autenticação
```typescript
// Erro: Unauthorized 401
// Solução: Verificar configuração do AuthService
const authService = new DirectusAuthService();
await authService.validateConfiguration();
```

#### 3. Cache Não Funcionando
```typescript
// Problema: Dados não atualizados
// Solução: Limpar cache ou ajustar TTL
await questionsService.clearCache();
```

#### 4. Logs Excessivos
```typescript
// Problema: Muitos logs
// Solução: Ajustar nível de log
process.env.LOG_LEVEL = 'warn';
```

## Comandos Úteis

### Desenvolvimento
```bash
# Criar novo serviço
npm run generate:service questions

# Executar testes
npm run test:services

# Verificar cobertura
npm run test:coverage

# Lint do código
npm run lint:services
```

### Deploy
```bash
# Build de produção
npm run build

# Deploy com feature flag
npm run deploy:gradual

# Rollback
npm run deploy:rollback
```

### Monitoramento
```bash
# Verificar logs
npm run logs:services

# Monitorar performance
npm run monitor:performance

# Verificar saúde dos serviços
npm run health:check
```

## Próximos Passos

### Após Migração Completa
1. **Otimizações**: Implementar cache avançado
2. **Monitoramento**: Adicionar métricas detalhadas
3. **Documentação**: Criar guias de uso
4. **Treinamento**: Capacitar equipe
5. **Melhorias**: Implementar funcionalidades avançadas

### Roadmap Futuro
- [ ] Implementar cache distribuído (Redis)
- [ ] Adicionar métricas de performance
- [ ] Criar dashboard de monitoramento
- [ ] Implementar rate limiting
- [ ] Adicionar mais provedores de autenticação

## Contatos e Suporte

### Equipe Responsável
- **Tech Lead**: Responsável pela arquitetura
- **DevOps**: Suporte ao deploy e monitoramento
- **QA**: Validação e testes
- **Product**: Definição de requisitos

### Canais de Comunicação
- **Slack**: #backend-refactoring
- **Email**: backend-team@company.com
- **Jira**: Projeto BACKEND-REFACTOR
- **Documentação**: Confluence

---

**Nota**: Este guia deve ser atualizado conforme a migração progride e novos aprendizados são identificados. 