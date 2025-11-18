"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.LocalAuthProvider = exports.KeycloakAuthProvider = void 0;
class KeycloakAuthProvider {
    constructor() {
        this.name = 'keycloak';
        this.config = {
            realm: process.env.KEYCLOAK_REALM || 'externo',
            authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || 'https://auth.sebrae-mg.com.br',
            sslRequired: process.env.KEYCLOAK_SSL_REQUIRED || 'external',
            resource: process.env.KEYCLOAK_RESOURCE || 'maturidadedigital-backend',
            secret: process.env.KEYCLOAK_SECRET || 'aUOg6iGnSLivRtMNzVB7N6bHBFHbZ6nZ',
            confidentialPort: 0,
        };
    }
    isConfigured() {
        return this.validateConfig().isValid;
    }
    getConfig() {
        const { secret, ...publicConfig } = this.config;
        return publicConfig;
    }
    validateConfig() {
        const errors = [];
        if (!this.config.realm) {
            errors.push('Realm é obrigatório');
        }
        if (!this.config.authServerUrl) {
            errors.push('URL do servidor de autenticação é obrigatória');
        }
        if (!this.config.resource) {
            errors.push('Resource é obrigatório');
        }
        if (!this.config.secret) {
            errors.push('Secret é obrigatório');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    getStatus() {
        const validation = this.validateConfig();
        return {
            status: validation.isValid ? 'configured' : 'misconfigured',
            provider: this.name,
            isValid: validation.isValid,
            ...(validation.errors.length > 0 && { errors: validation.errors })
        };
    }
}
exports.KeycloakAuthProvider = KeycloakAuthProvider;
class LocalAuthProvider {
    constructor() {
        this.name = 'local';
        this.config = {
            enabled: process.env.LOCAL_AUTH_ENABLED === 'true',
            users: [
                { id: '1', email: 'admin@sebrae.com', roles: ['admin', 'user'] }
            ]
        };
    }
    isConfigured() {
        return this.config.enabled;
    }
    getConfig() {
        return {
            enabled: this.config.enabled,
            type: 'local'
        };
    }
    validateConfig() {
        const errors = [];
        if (!this.config.enabled) {
            errors.push('Autenticação local não está habilitada');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    getStatus() {
        const validation = this.validateConfig();
        return {
            status: validation.isValid ? 'configured' : 'disabled',
            provider: this.name,
            isValid: validation.isValid,
            ...(validation.errors.length > 0 && { errors: validation.errors })
        };
    }
}
exports.LocalAuthProvider = LocalAuthProvider;
class AuthService {
    constructor() {
        this.providers = new Map();
        this.currentProvider = null;
        this.registerProvider(new KeycloakAuthProvider());
        this.registerProvider(new LocalAuthProvider());
        this.setDefaultProvider();
    }
    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
    }
    setDefaultProvider() {
        const keycloakProvider = this.providers.get('keycloak');
        const localProvider = this.providers.get('local');
        if (keycloakProvider && keycloakProvider.isConfigured()) {
            this.currentProvider = keycloakProvider;
        }
        else if (localProvider && localProvider.isConfigured()) {
            this.currentProvider = localProvider;
        }
    }
    getCurrentProvider() {
        return this.currentProvider;
    }
    getProvider(name) {
        return this.providers.get(name) || null;
    }
    getAllProviders() {
        return Array.from(this.providers.values());
    }
    getConfig() {
        return this.currentProvider?.getConfig() || null;
    }
    getStatus() {
        if (!this.currentProvider) {
            return {
                status: 'not_configured',
                provider: 'none',
                isValid: false,
                errors: ['Nenhum provedor de autenticação configurado']
            };
        }
        return this.currentProvider.getStatus();
    }
    validateConfig() {
        if (!this.currentProvider) {
            return {
                isValid: false,
                errors: ['Nenhum provedor de autenticação configurado']
            };
        }
        return this.currentProvider.validateConfig();
    }
    switchProvider(providerName) {
        const provider = this.providers.get(providerName);
        if (provider && provider.isConfigured()) {
            this.currentProvider = provider;
            return true;
        }
        return false;
    }
}
exports.AuthService = AuthService;
exports.default = AuthService.getInstance();
//# sourceMappingURL=auth.service.js.map