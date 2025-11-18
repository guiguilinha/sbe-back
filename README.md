# 🚀 Maturidade Digital Backend
## Sistema de Maturidade Digital - Sebrae MG

---

## 📋 **DESCRIÇÃO**

Backend API independente para o Sistema de Maturidade Digital, desenvolvido com Node.js, Express, TypeScript e integração com Directus CMS.

---

## 🏗️ **ARQUITETURA**

### **Tecnologias:**
- **Node.js** + **Express** - Servidor web
- **TypeScript** - Linguagem tipada
- **MySQL** - Banco de dados
- **Directus** - CMS headless
- **Redis** - Cache
- **Keycloak** - Autenticação
- **Docker** - Containerização
- **Kubernetes** - Orquestração (produção)

### **Estrutura:**
```
maturidade-digital-backend/
├── src/                    # Código fonte
├── k8s/                    # Manifests Kubernetes
├── scripts/                # Scripts de gerenciamento
├── config/                 # Configurações
├── volumes/                # Dados persistentes
├── docker-compose.yml      # Desenvolvimento
├── Dockerfile             # Imagem Docker
└── package.json           # Dependências
```

---

## 🚀 **INÍCIO RÁPIDO**

### **Desenvolvimento:**
```bash
# 1. Clonar repositório
git clone https://github.com/sebrae-mg/maturidade-digital-backend.git
cd maturidade-digital-backend

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Iniciar ambiente de desenvolvimento
./scripts/dev.sh
```

### **Produção (Kubernetes):**
```bash
# 1. Configurar secrets
# Editar k8s/secret.yaml com valores reais

# 2. Deploy para Kubernetes
./scripts/prod.sh

# 3. Verificar status
kubectl get pods -n maturidade-digital
```

---

## 🔧 **CONFIGURAÇÃO**

### **Variáveis de Ambiente:**

#### **Desenvolvimento (.env):**
```bash
# Servidor
PORT=8080
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=your_token_here
DIRECTUS_EMAIL=your_email@example.com
DIRECTUS_PASSWORD=your_password_here

# Keycloak
KEYCLOAK_REALM=externo
KEYCLOAK_AUTH_SERVER_URL=https://auth.sebrae-mg.com.br
KEYCLOAK_SSL_REQUIRED=external
KEYCLOAK_RESOURCE=maturidadedigital-backend
KEYCLOAK_SECRET=your_keycloak_secret_here

# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=maturidade_digital
DB_USER=root
DB_PASSWORD=your_db_password

# Redis
REDIS_URL=redis://localhost:6379
```

#### **Produção (Kubernetes):**
- Configurações via ConfigMap e Secrets
- Valores específicos para ambiente Sebrae

---

## 📚 **APIS DISPONÍVEIS**

### **Endpoints Ativos:**
- **GET /api/homepage** - Dados da página inicial
- **GET /api/quiz** - Dados do quiz
- **POST /api/results/calculate** - Cálculo de resultados

### **Documentação:**
- **Swagger/OpenAPI** - Em desenvolvimento
- **Postman Collection** - Disponível em `/docs`

---

## 🐳 **DOCKER**

### **Desenvolvimento:**
```bash
# Construir imagem
docker build -t maturidade-digital-backend .

# Executar container
docker run -p 8080:8080 maturidade-digital-backend

# Docker Compose (com dependências)
docker-compose up -d
```

### **Produção:**
```bash
# Construir para produção
docker build -t maturidade-digital-backend:latest .

# Push para registry
docker push maturidade-digital-backend:latest
```

---

## ☸️ **KUBERNETES**

### **Manifests Disponíveis:**
- **namespace.yaml** - Namespace do projeto
- **configmap.yaml** - Configurações
- **secret.yaml** - Secrets (credenciais)
- **backend-deployment.yaml** - Deployment do backend
- **backend-service.yaml** - Service do backend
- **ingress.yaml** - Ingress para acesso externo

### **Comandos:**
```bash
# Aplicar todos os manifests
kubectl apply -f k8s/

# Verificar status
kubectl get pods -n maturidade-digital

# Ver logs
kubectl logs -f deployment/backend-deployment -n maturidade-digital

# Deletar recursos
kubectl delete -f k8s/
```

---

## 🧪 **TESTES**

### **Executar Testes:**
```bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com coverage
npm run test:coverage
```

### **Linting:**
```bash
# Verificar código
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

---

## 📊 **MONITORAMENTO**

### **Health Checks:**
- **GET /health** - Status da aplicação
- **GET /api/health** - Status detalhado

### **Logs:**
- **Desenvolvimento:** Console logs
- **Produção:** Kubernetes logs

### **Métricas:**
- **CPU/Memory:** Kubernetes metrics
- **Requests:** Nginx ingress metrics

---

## 🔒 **SEGURANÇA**

### **Implementado:**
- **CORS** configurável por ambiente
- **Helmet** para headers de segurança
- **Rate limiting** (em desenvolvimento)
- **JWT** para autenticação
- **Secrets** gerenciados via Kubernetes

### **Recomendações:**
- Configurar HTTPS em produção
- Implementar rate limiting
- Monitorar logs de segurança
- Atualizar dependências regularmente

---

## 🚀 **DEPLOY**

### **Desenvolvimento:**
```bash
./scripts/dev.sh
```

### **Produção:**
```bash
./scripts/prod.sh
```

### **CI/CD:**
- **GitHub Actions** configurado
- **Deploy automático** em push para main
- **Testes automatizados** antes do deploy

---

## 📞 **SUPORTE**

### **Documentação:**
- **README** - Este arquivo
- **API Docs** - `/docs` (em desenvolvimento)
- **Troubleshooting** - `/docs/troubleshooting.md`

### **Contato:**
- **Equipe:** Desenvolvimento Sebrae MG
- **Email:** dev@sebraemg.com.br
- **Issues:** GitHub Issues

---

**Versão:** 1.0.0  
**Última Atualização:** 19/09/2025  
**Licença:** MIT
