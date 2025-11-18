// Exemplo de como adicionar um novo provedor de autenticação
// Este arquivo demonstra a flexibilidade da arquitetura desacoplada

import { AuthProvider } from '../auth.service';

export class AzureADAuthProvider implements AuthProvider {
  name = 'azure-ad';
  private config: Record<string, any>;

  constructor() {
    this.config = {
      tenantId: process.env.AZURE_AD_TENANT_ID,
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      redirectUri: process.env.AZURE_AD_REDIRECT_URI,
      authority: process.env.AZURE_AD_AUTHORITY || `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}`,
    };
  }

  isConfigured(): boolean {
    return this.validateConfig().isValid;
  }

  getConfig(): Record<string, any> {
    const { clientSecret, ...publicConfig } = this.config;
    return publicConfig;
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.tenantId) {
      errors.push('Tenant ID é obrigatório');
    }

    if (!this.config.clientId) {
      errors.push('Client ID é obrigatório');
    }

    if (!this.config.clientSecret) {
      errors.push('Client Secret é obrigatório');
    }

    if (!this.config.redirectUri) {
      errors.push('Redirect URI é obrigatório');
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

// Para usar este provedor, adicione no AuthService:
// this.registerProvider(new AzureADAuthProvider()); 