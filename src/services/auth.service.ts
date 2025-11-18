import { Request, Response } from 'express';

// Interface para provedores de autenticação
export interface AuthProvider {
  name: string;
  isConfigured(): boolean;
  getConfig(): Record<string, any>;
  validateConfig(): { isValid: boolean; errors: string[] };
  getStatus(): { status: string; provider: string; isValid: boolean; errors?: string[] };
}

// Implementação do Keycloak
export class KeycloakAuthProvider implements AuthProvider {
  name = 'keycloak';
  private config: Record<string, any>;

  constructor() {
    this.config = {
      realm: process.env.KEYCLOAK_REALM || 'externo',
      authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || 'https://auth.sebrae-mg.com.br',
      sslRequired: process.env.KEYCLOAK_SSL_REQUIRED || 'external',
      resource: process.env.KEYCLOAK_RESOURCE || 'maturidadedigital-backend',
      secret: process.env.KEYCLOAK_SECRET || 'aUOg6iGnSLivRtMNzVB7N6bHBFHbZ6nZ',
      confidentialPort: 0,
    };
  }

  isConfigured(): boolean {
    return this.validateConfig().isValid;
  }

  getConfig(): Record<string, any> {
    const { secret, ...publicConfig } = this.config;
    return publicConfig;
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

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

  getStatus(): { status: string; provider: string; isValid: boolean; errors?: string[] } {
    const validation = this.validateConfig();
    return {
      status: validation.isValid ? 'configured' : 'misconfigured',
      provider: this.name,
      isValid: validation.isValid,
      ...(validation.errors.length > 0 && { errors: validation.errors })
    };
  }
}

// Implementação de autenticação local (para desenvolvimento)
export class LocalAuthProvider implements AuthProvider {
  name = 'local';
  private config: Record<string, any>;

  constructor() {
    this.config = {
      enabled: process.env.LOCAL_AUTH_ENABLED === 'true',
      users: [
        { id: '1', email: 'admin@sebrae.com', roles: ['admin', 'user'] }
      ]
    };
  }

  isConfigured(): boolean {
    return this.config.enabled;
  }

  getConfig(): Record<string, any> {
    return {
      enabled: this.config.enabled,
      type: 'local'
    };
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.enabled) {
      errors.push('Autenticação local não está habilitada');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getStatus(): { status: string; provider: string; isValid: boolean; errors?: string[] } {
    const validation = this.validateConfig();
    return {
      status: validation.isValid ? 'configured' : 'disabled',
      provider: this.name,
      isValid: validation.isValid,
      ...(validation.errors.length > 0 && { errors: validation.errors })
    };
  }
}

// Serviço principal de autenticação
export class AuthService {
  private static instance: AuthService;
  private providers: Map<string, AuthProvider> = new Map();
  private currentProvider: AuthProvider | null = null;

  private constructor() {
    // Registrar provedores disponíveis
    this.registerProvider(new KeycloakAuthProvider());
    this.registerProvider(new LocalAuthProvider());
    
    // Definir provedor padrão baseado na configuração
    this.setDefaultProvider();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private registerProvider(provider: AuthProvider): void {
    this.providers.set(provider.name, provider);
  }

  private setDefaultProvider(): void {
    // Priorizar Keycloak se configurado, senão usar local se habilitado
    const keycloakProvider = this.providers.get('keycloak');
    const localProvider = this.providers.get('local');

    if (keycloakProvider && keycloakProvider.isConfigured()) {
      this.currentProvider = keycloakProvider;
    } else if (localProvider && localProvider.isConfigured()) {
      this.currentProvider = localProvider;
    }
  }

  public getCurrentProvider(): AuthProvider | null {
    return this.currentProvider;
  }

  public getProvider(name: string): AuthProvider | null {
    return this.providers.get(name) || null;
  }

  public getAllProviders(): AuthProvider[] {
    return Array.from(this.providers.values());
  }

  public getConfig(): Record<string, any> | null {
    return this.currentProvider?.getConfig() || null;
  }

  public getStatus(): { status: string; provider: string; isValid: boolean; errors?: string[] } {
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

  public validateConfig(): { isValid: boolean; errors: string[] } {
    if (!this.currentProvider) {
      return {
        isValid: false,
        errors: ['Nenhum provedor de autenticação configurado']
      };
    }

    return this.currentProvider.validateConfig();
  }

  public switchProvider(providerName: string): boolean {
    const provider = this.providers.get(providerName);
    if (provider && provider.isConfigured()) {
      this.currentProvider = provider;
      return true;
    }
    return false;
  }
}

export default AuthService.getInstance(); 