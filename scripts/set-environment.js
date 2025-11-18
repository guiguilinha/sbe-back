const fs = require('fs');
const path = require('path');

// Função para detectar ambiente automaticamente
function detectEnvironment() {
  // Detecta ambiente baseado em variáveis disponíveis
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  if (process.env.COMPOSE_PROJECT_NAME && process.env.COMPOSE_PROJECT_NAME.includes('prod')) {
    return 'production';
  }
  
  if (process.env.COMPOSE_PROJECT_NAME && process.env.COMPOSE_PROJECT_NAME.includes('homolog')) {
    return 'homologation';
  }
  
  // Verifica se está rodando em Docker
  if (process.env.DOCKER_CONTAINER === 'true' || process.env.HOSTNAME?.includes('docker')) {
    return 'production';
  }
  
  return 'development';
}

// Função para carregar variáveis de um arquivo .env
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Arquivo não encontrado: ${envPath}`);
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    // Ignora comentários e linhas vazias
    line = line.trim();
    if (!line || line.startsWith('#')) {
      return;
    }
    
    // Divide por '=' e trata valores que podem conter '='
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) {
      return;
    }
    
    const key = line.substring(0, equalIndex).trim();
    const value = line.substring(equalIndex + 1).trim();
    
    if (key && value) {
      envVars[key] = value;
    }
  });
  
  return envVars;
}

// Função para determinar o prefixo baseado no ambiente
function getEnvironmentPrefix(environment) {
  const prefixes = {
    'development': 'DEVELOPMENT_',
    'production': 'PRODUCTION_',
    'homologation': 'HOMOLOGATION_'
  };
  
  return prefixes[environment] || '';
}

// Função para remover prefixo de uma chave
function removePrefix(key, prefix) {
  if (key.startsWith(prefix)) {
    return key.substring(prefix.length);
  }
  return key;
}

// Função para gerar o arquivo .env a partir do .env.{environment}
function generateRootEnv(environment) {
  const envFileName = `.env.${environment}`;
  const envPath = path.join(__dirname, '..', envFileName);
  
  console.log(`📖 Lendo arquivo: ${envFileName}`);
  
  const envVars = loadEnvFile(envPath);
  
  if (!envVars) {
    console.error(`❌ Não foi possível carregar variáveis de ${envFileName}`);
    process.exit(1);
  }
  
  const prefix = getEnvironmentPrefix(environment);
  let content = `# Configurações do Backend - Ambiente: ${environment.toUpperCase()}\n`;
  content += `# Gerado automaticamente em: ${new Date().toISOString()}\n`;
  content += `# Fonte: ${envFileName}\n\n`;
  
  // Processa todas as variáveis do arquivo .env.{environment}
  Object.keys(envVars).forEach(key => {
    const value = envVars[key];
    
    // Se a chave tem o prefixo do ambiente, remove o prefixo
    // Se não tem prefixo, mantém como está
    const finalKey = removePrefix(key, prefix);
    
    content += `${finalKey}=${value}\n`;
  });
  
  return content;
}

function setEnvironment(environment) {
  // Se não foi especificado ambiente, detecta automaticamente
  if (!environment) {
    environment = detectEnvironment();
    console.log(`🔍 Ambiente detectado automaticamente: ${environment}`);
  }
  
  const validEnvironments = ['development', 'production', 'homologation'];
  if (!validEnvironments.includes(environment)) {
    console.error(`❌ Ambiente '${environment}' inválido.`);
    console.log('Ambientes disponíveis:', validEnvironments.join(', '));
    process.exit(1);
  }
  
  try {
    // Gera arquivo .env na raiz (backend) - variáveis SEM sufixos
    const rootEnvContent = generateRootEnv(environment);
    const rootEnvPath = path.join(__dirname, '..', '.env');
    
    fs.writeFileSync(rootEnvPath, rootEnvContent);
    console.log(`✅ Arquivo .env criado para ambiente: ${environment.toUpperCase()}`);
    
    console.log(`\n🎉 Ambiente configurado para: ${environment.toUpperCase()}`);
    console.log('📁 Arquivo gerado:');
    console.log(`   - .env (backend) - variáveis SEM prefixos, baseado em .env.${environment}`);
    
  } catch (error) {
    console.error('❌ Erro ao configurar ambiente:', error.message);
    process.exit(1);
  }
}

// Verifica argumentos da linha de comando
const environment = process.argv[2] || detectEnvironment();

if (!environment) {
  console.error('❌ Ambiente não especificado.');
  console.log('Uso: node scripts/set-environment.js <environment>');
  console.log('Ambientes disponíveis: development, production, homologation');
  process.exit(1);
}

setEnvironment(environment);
