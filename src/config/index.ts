import dotenv from 'dotenv';
// dotenv.config() foi movido para server.ts

export const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Configurações do Directus
  directus: {
    url: process.env.DIRECTUS_URL || 'http://localhost:8055',
    token: process.env.DIRECTUS_TOKEN,
    email: process.env.DIRECTUS_EMAIL,
    password: process.env.DIRECTUS_PASSWORD,
  },

  // Configurações do CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },

  // Configurações do Keycloak
  keycloak: {
    realm: process.env.KEYCLOAK_REALM || 'externo',
    authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || 'https://auth.sebrae-mg.com.br',
    sslRequired: process.env.KEYCLOAK_SSL_REQUIRED || 'external',
    resource: process.env.KEYCLOAK_RESOURCE || 'maturidadedigital-backend',
    secret: process.env.KEYCLOAK_SECRET || 'aUOg6iGnSLivRtMNzVB7N6bHBFHbZ6nZ',
    confidentialPort: 0,
  },

  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  },
};

export default config; 