"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureADAuthProvider = void 0;
class AzureADAuthProvider {
    constructor() {
        this.name = 'azure-ad';
        this.config = {
            tenantId: process.env.AZURE_AD_TENANT_ID,
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            redirectUri: process.env.AZURE_AD_REDIRECT_URI,
            authority: process.env.AZURE_AD_AUTHORITY || `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}`,
        };
    }
    isConfigured() {
        return this.validateConfig().isValid;
    }
    getConfig() {
        const { clientSecret, ...publicConfig } = this.config;
        return publicConfig;
    }
    validateConfig() {
        const errors = [];
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
exports.AzureADAuthProvider = AzureADAuthProvider;
//# sourceMappingURL=azure-ad.provider.js.map