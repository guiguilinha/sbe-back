# ��� IMPLEMENTAÇÃO CORS AGNÓSTICO
## Sistema de Maturidade Digital - Sebrae MG

---

## ��� **OBJETIVO**

Tornar o backend mais flexível e agnóstico para diferentes ambientes, permitindo configuração dinâmica de CORS através de variáveis de ambiente.

---

## ��� **IMPLEMENTAÇÃO REALIZADA**

### **1. Configuração CORS Agnóstica**

#### **Antes (Hardcoded):**
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
];
```

#### **Depois (Agnóstico):**
```typescript
const getAllowedOrigins = (): string[] => {
  const origins: string[] = [];
  
  // 1. Origens padrão para desenvolvimento
  origins.push('http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080');
  
  // 2. URL do frontend configurada
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  // 3. Origens adicionais via variável de ambiente
  if (process.env.CORS_ORIGIN) {
    const additionalOrigins = process.env.CORS_ORIGIN
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
    origins.push(...additionalOrigins);
  }
  
  // 4. Origens dinâmicas baseadas no ambiente
  if (process.env.NODE_ENV === 'production') {
    origins.push(
      'https://sebraemg.com.br',
      'https://www.sebraemg.com.br',
      'https://maturidade.sebraemg.com.br'
    );
  }
  
  return [...new Set(origins)];
};
```

### **2. Validação Inteligente**

#### **Funcionalidades Implementadas:**
- ✅ **Requisições sem origin** (mobile apps, curl, Postman)
- ✅ **Localhost flexível** em desenvolvimento
- ✅ **Origens dinâmicas** baseadas no ambiente
- ✅ **Logs detalhados** para debugging
- ✅ **Headers adicionais** para melhor compatibilidade

#### **Código de Validação:**
```typescript
origin: (origin, callback) => {
  const allowedOrigins = getAllowedOrigins();
  
  // Permite requisições sem 'origin'
  if (!origin) {
    console.log('��� CORS: Requisição sem origin permitida');
    return callback(null, true);
  }
  
  // Verifica se a origem está na lista de permitidas
  if (allowedOrigins.includes(origin)) {
    console.log(`✅ CORS: Origem permitida: ${origin}`);
    return callback(null, true);
  }
  
  // Em desenvolvimento, permite localhost com qualquer porta
  if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
    console.log(`��� CORS: Localhost permitido em desenvolvimento: ${origin}`);
    return callback(null, true);
  }
  
  console.log(`❌ CORS: Origem bloqueada: ${origin}`);
  console.log(`��� CORS: Origens permitidas: ${allowedOrigins.join(', ')}`);
  callback(new Error('Não permitido pela política de CORS'));
}
```

### **3. Configuração de Ambiente**

#### **Arquivo .env.example criado:**
```bash
# Configuração do Frontend
FRONTEND_URL=http://localhost:5173

# Configuração CORS Agnóstica
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://sebraemg.com.br

# Configuração do Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=your_directus_token_here
DIRECTUS_EMAIL=your_email@example.com
DIRECTUS_PASSWORD=your_password_here

# Configuração do Keycloak (Backend - API Gateway)
KEYCLOAK_REALM=externo
KEYCLOAK_AUTH_SERVER_URL=https://auth.sebrae-mg.com.br
KEYCLOAK_SSL_REQUIRED=external
KEYCLOAK_RESOURCE=maturidadedigital-backend
KEYCLOAK_SECRET=your_keycloak_secret_here
```

---

## ��� **BENEFÍCIOS DA IMPLEMENTAÇÃO**

### **1. Flexibilidade**
- **Múltiplas origens** via variável de ambiente
- **Desenvolvimento flexível** com localhost
- **Produção segura** com domínios específicos

### **2. Manutenibilidade**
- **Configuração centralizada** em variáveis de ambiente
- **Logs detalhados** para debugging
- **Código limpo** e bem documentado

### **3. Segurança**
- **Origens específicas** em produção
- **Desenvolvimento permissivo** apenas em dev
- **Validação rigorosa** de origens

---

## ��� **COMO USAR**

### **Desenvolvimento:**
```bash
# .env
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
NODE_ENV=development
```

### **Produção:**
```bash
# .env
FRONTEND_URL=https://maturidade.sebraemg.com.br
CORS_ORIGIN=https://sebraemg.com.br,https://www.sebraemg.com.br
NODE_ENV=production
```

### **Homologação:**
```bash
# .env
FRONTEND_URL=https://homolog.sebraemg.com.br
CORS_ORIGIN=https://homolog.sebraemg.com.br,https://sebraemg.com.br
NODE_ENV=production
```

---

## ✅ **VALIDAÇÃO**

### **Funcionalidades Testadas:**
- [x] Build do backend funcionando
- [x] Configuração CORS agnóstica
- [x] Variáveis de ambiente
- [x] Logs de debugging
- [x] Headers adicionais

### **Cenários Suportados:**
- [x] Desenvolvimento local (localhost:5173)
- [x] Desenvolvimento com múltiplas portas
- [x] Produção com domínios específicos
- [x] Requisições sem origin (APIs, mobile)
- [x] Debugging com logs detalhados

---

## ��� **PRÓXIMOS PASSOS**

### **Fase 4: Keycloak (Opcional)**
1. **Documentar diferenças** entre frontend e backend
2. **Validar funcionamento** em ambos os lados
3. **Testar integração** completa
4. **Finalizar documentação**

---

**Data de Criação:** 19/09/2025  
**Versão:** 1.0  
**Status:** ✅ CONCLUÍDO  
**Responsável:** Equipe de Desenvolvimento Sebrae MG
