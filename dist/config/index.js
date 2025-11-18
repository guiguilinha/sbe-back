"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    server: {
        port: process.env.PORT || 3001,
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    directus: {
        url: process.env.DIRECTUS_URL || 'http://localhost:8055',
        token: process.env.DIRECTUS_TOKEN,
        email: process.env.DIRECTUS_EMAIL,
        password: process.env.DIRECTUS_PASSWORD,
    },
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    },
    keycloak: {
        realm: process.env.KEYCLOAK_REALM || 'externo',
        authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || 'https://auth.sebrae-mg.com.br',
        sslRequired: process.env.KEYCLOAK_SSL_REQUIRED || 'external',
        resource: process.env.KEYCLOAK_RESOURCE || 'maturidadedigital-backend',
        secret: process.env.KEYCLOAK_SECRET || 'aUOg6iGnSLivRtMNzVB7N6bHBFHbZ6nZ',
        confidentialPort: 0,
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    },
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map