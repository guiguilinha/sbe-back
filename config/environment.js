const environments = {
  development: {
    // Configurações de URLs
    DEVELOPMENT_FRONTEND_URL: 'http://localhost:5173',
    DEVELOPMENT_API_URL: 'http://localhost:8080',
    DEVELOPMENT_DIRECTUS_URL: 'http://localhost:8055',

    // Configurações de portas
    DEVELOPMENT_MYSQL_PORT: '3306',
    DEVELOPMENT_BACKEND_PORT: '8080',
    DEVELOPMENT_FRONTEND_PORT: '5173',
    DEVELOPMENT_DIRECTUS_PORT: '8055',

    // Configurações de acesso do Directus
    DEVELOPMENT_DIRECTUS_TOKEN: 'ZGFTMBSlb0O3VQ95dtRkSxD-TLt3oXmP',
    DEVELOPMENT_DIRECTUS_EMAIL: 'guilhermemcmps@gmail.com',
    DEVELOPMENT_DIRECTUS_PASSWORD: 'Admin2024!',

    // Configurações MySQL do Directus
    DEVELOPMENT_MYSQL_ROOT_PASSWORD: 'SenhaForteRoot2024!',
    DEVELOPMENT_MYSQL_HOST: 'localhost',
    DEVELOPMENT_MYSQL_DATABASE: 'maturidade_digital_db',
    DEVELOPMENT_MYSQL_USER: 'directus',
    DEVELOPMENT_MYSQL_PASSWORD: 'SenhaForteDirectus2024!',

    // Configurações MySQL de Registro de diagnosticos
    DEVELOPMENT_REGISTRO_MYSQL_HOST: '10.12.6.23',
    DEVELOPMENT_REGISTRO_MYSQL_PORT: '3306',
    DEVELOPMENT_REGISTRO_MYSQL_USER: 'app_maturidade_digital_dev',
    DEVELOPMENT_REGISTRO_MYSQL_PASSWORD: 'Msebrae@555',
    DEVELOPMENT_REGISTRO_MYSQL_DATABASE: 'maturidade_digital_db',

    // Configurações do Keycloak Backend
    DEVELOPMENT_KEYCLOAK_REALM: 'externo',
    DEVELOPMENT_KEYCLOAK_AUTH_SERVER_URL: 'https://amei.homolog.kubernetes.sebrae.com.br/auth',
    DEVELOPMENT_KEYCLOAK_SSL_REQUIRED: 'external',
    DEVELOPMENT_KEYCLOAK_RESOURCE: 'maturidadedigital-backend',
    DEVELOPMENT_KEYCLOAK_SECRET: 'aUOg6iGnSLivRtMNzVB7N6bHBFHbZ6nZ',

    // Configurações de APIs Externas        
    // API de Vinculo de Empresa CNPJ - Sebrae
    DEVELOPMENT_VINCULO_EMPRESA_API_URL: 'https://cpe-backend.homologacao.sebrae.com.br/v1/vinculo-empresa',
    DEVELOPMENT_CPE_URL: 'https://cpe-backend.homologacao.sebrae.com.br/v1',
    DEVELOPMENT_CPE_TIMEOUT: '10000',

    // API da Meta Sebrae
    DEVELOPMENT_META_API_URL: 'https://dev.api.partner.sebraemg.com.br/v1/interaction',
    DEVELOPMENT_META_API_KEY: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjcmVkZW50aWFsIjoiTUFUVVJJREFERS1ESUdJVEFMIiwiaXNzIjoiaHR0cHM6XC9cL2Rldi5hcGkucGFydG5lci5zZWJyYWVtZy5jb20uYnJcL3YxIiwiaWF0IjoxNzQxNjIyNjczLCJleHAiOjE4Mjg4ODY2NzN9.6qgFrrzFR77g50g23B3pJhuKrX4jdGor4wOMgmSByFo',

    // Configurações adicionais do Directus Websocket e Preview
    DEVELOPMENT_DIRECTUS_PREVIEW_TOKEN: 'Zoyq2M-Rq_I-yQHMyDzHhJpRaQ0CyE50',
    DEVELOPMENT_DIRECTUS_WEBSOCKET: 'true',
    DEVELOPMENT_DIRECTUS_WEBSOCKET_HEARTBEAT: '30',
    DEVELOPMENT_DIRECTUS_WEBSOCKET_REST_PATH: '/ws',

    // Configurações de logging
    DEVELOPMENT_LOG_LEVEL: 'info'
  },

  production: {
    // Configurações de URLs
    PRODUCTION_FRONTEND_URL: '',
    PRODUCTION_API_URL: '',
    PRODUCTION_DIRECTUS_URL: '',

    // Configurações de portas
    PRODUCTION_MYSQL_PORT: '3306',
    PRODUCTION_BACKEND_PORT: '8080',
    PRODUCTION_FRONTEND_PORT: '80',
    PRODUCTION_DIRECTUS_PORT: '8055',

    // Configurações de acesso do Directus
    PRODUCTION_DIRECTUS_TOKEN: '',
    PRODUCTION_DIRECTUS_EMAIL: '',
    PRODUCTION_DIRECTUS_PASSWORD: '',

    // Configurações MySQL do Directus
    PRODUCTION_MYSQL_ROOT_PASSWORD: '',
    PRODUCTION_MYSQL_HOST: '',
    PRODUCTION_MYSQL_DATABASE: '',
    PRODUCTION_MYSQL_USER: '',
    PRODUCTION_MYSQL_PASSWORD: '',

    // Configurações MySQL de Registro de diagnosticos
    PRODUCTION_REGISTRO_MYSQL_HOST: '10.12.6.23',
    PRODUCTION_REGISTRO_MYSQL_PORT: '3306',
    PRODUCTION_REGISTRO_MYSQL_USER: 'app_maturidade_digital_dev',
    PRODUCTION_REGISTRO_MYSQL_PASSWORD: 'Msebrae@555',
    PRODUCTION_REGISTRO_MYSQL_DATABASE: 'maturidade_digital_db',

    // Configurações do Keycloak Backend
    PRODUCTION_KEYCLOAK_REALM: '',
    PRODUCTION_KEYCLOAK_AUTH_SERVER_URL: '',
    PRODUCTION_KEYCLOAK_SSL_REQUIRED: '',
    PRODUCTION_KEYCLOAK_RESOURCE: '',
    PRODUCTION_KEYCLOAK_SECRET: '',

    // Configurações de APIs Externas        
    // API de Vinculo de Empresa CNPJ - Sebrae
    PRODUCTION_VINCULO_EMPRESA_API_URL: '',

    // API da Meta Sebrae
    PRODUCTION_META_API_URL: '',
    PRODUCTION_META_API_KEY: '',

    // Configurações adicionais do Directus Websocket e Preview
    PRODUCTION_DIRECTUS_PREVIEW_TOKEN: '',
    PRODUCTION_DIRECTUS_WEBSOCKET: 'true',
    PRODUCTION_DIRECTUS_WEBSOCKET_HEARTBEAT: '30',
    PRODUCTION_DIRECTUS_WEBSOCKET_REST_PATH: '/ws',

    // Configurações de logging
    PRODUCTION_LOG_LEVEL: 'info'
  }
};

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
  
  // Verifica se está rodando em produção baseado no hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('sebrae-mg.com.br') || hostname.includes('sebraemg.com.br')) {
      return 'production';
    }
    if (hostname.includes('homolog')) {
      return 'homologation';
    }
  }
  
  return 'development';
}

module.exports = {
  environments,
  detectEnvironment
};
