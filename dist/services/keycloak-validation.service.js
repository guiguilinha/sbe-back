"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakValidationService = void 0;
exports.getKeycloakValidationService = getKeycloakValidationService;
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class KeycloakValidationService {
    constructor() {
        this.loadConfig();
    }
    loadConfig() {
        this.authServerUrl = process.env.KEYCLOAK_BACKEND_AUTH_SERVER_URL || '';
        this.realm = process.env.KEYCLOAK_BACKEND_REALM || '';
        this.clientId = process.env.KEYCLOAK_BACKEND_RESOURCE || '';
        this.clientSecret = process.env.KEYCLOAK_BACKEND_SECRET || '';
        console.log('🔧 [KeycloakValidation] Configuração carregada:', {
            authServerUrl: this.authServerUrl,
            realm: this.realm,
            clientId: this.clientId,
            hasSecret: !!this.clientSecret
        });
    }
    async validateIdToken(idToken) {
        try {
            this.loadConfig();
            console.log('🔍 [KeycloakValidation] Iniciando validação do token...');
            const decodedToken = jsonwebtoken_1.default.decode(idToken);
            if (!decodedToken) {
                throw new Error('Token inválido ou malformado');
            }
            console.log('🔍 [KeycloakValidation] Token decodificado (resumo):', {
                iss: decodedToken.iss,
                aud: decodedToken.aud,
                sub: decodedToken.sub,
                exp: decodedToken.exp
            });
            console.log('🔍 [KeycloakValidation] === TOKEN COMPLETO DECODIFICADO ===');
            console.log('🔍 [KeycloakValidation] TODOS os dados do token:', JSON.stringify(decodedToken, null, 2));
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedToken.exp && decodedToken.exp < currentTime) {
                throw new Error('Token expirado');
            }
            const expectedIssuerPattern = `/realms/${this.realm}`;
            if (!decodedToken.iss || !decodedToken.iss.includes(expectedIssuerPattern)) {
                throw new Error(`Issuer inválido. Esperado: contendo ${expectedIssuerPattern}, Recebido: ${decodedToken.iss}`);
            }
            if (decodedToken.aud !== 'maturidadedigital') {
                throw new Error(`Audience inválido. Esperado: maturidadedigital, Recebido: ${decodedToken.aud}`);
            }
            console.log('✅ [KeycloakValidation] Token validado com sucesso (validação básica)');
            return decodedToken;
        }
        catch (error) {
            console.error('❌ [KeycloakValidation] Erro na validação:', error);
            throw new Error(`Falha na validação do token: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async getServiceToken() {
        try {
            this.loadConfig();
            console.log('🔑 [KeycloakValidation] Obtendo token de serviço...');
            console.log('🔑 [KeycloakValidation] === DADOS USADOS PARA CHAMAR KEYCLOAK ===');
            console.log('🔑 [KeycloakValidation] authServerUrl:', this.authServerUrl);
            console.log('🔑 [KeycloakValidation] realm:', this.realm);
            console.log('🔑 [KeycloakValidation] clientId:', this.clientId);
            console.log('🔑 [KeycloakValidation] clientSecret (primeiros 10 chars):', this.clientSecret.substring(0, 10) + '...');
            if (!this.authServerUrl || !this.realm || !this.clientId || !this.clientSecret) {
                throw new Error('Configuração do Keycloak incompleta');
            }
            const tokenUrl = `${this.authServerUrl}/realms/${this.realm}/protocol/openid-connect/token`;
            console.log('🔑 [KeycloakValidation] URL completa do Keycloak:', tokenUrl);
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('client_id', this.clientId);
            params.append('client_secret', this.clientSecret);
            console.log('🔑 [KeycloakValidation] Parâmetros enviados:', {
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret.substring(0, 10) + '...'
            });
            const response = await axios_1.default.post(tokenUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000
            });
            console.log('🔍 [KeycloakValidation] === RESPOSTA COMPLETA DO KEYCLOAK ===');
            console.log('🔍 [KeycloakValidation] Status:', response.status);
            console.log('🔍 [KeycloakValidation] Headers:', JSON.stringify(response.headers, null, 2));
            console.log('🔍 [KeycloakValidation] Data (completa):', JSON.stringify(response.data, null, 2));
            if (response.data.access_token) {
                console.log('✅ [KeycloakValidation] Token de serviço obtido com sucesso');
                console.log('✅ [KeycloakValidation] Token (primeiros 50 chars):', response.data.access_token.substring(0, 50) + '...');
                return response.data.access_token;
            }
            else {
                throw new Error('Token de acesso não encontrado na resposta');
            }
        }
        catch (error) {
            console.error('❌ [KeycloakValidation] Erro ao obter token de serviço:', error);
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Erro na requisição: ${error.response?.status} - ${error.response?.statusText}`);
            }
            throw error;
        }
    }
    async validateTokenWithKeycloak(idToken) {
        try {
            const introspectUrl = `${this.authServerUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`;
            const params = new URLSearchParams();
            params.append('token', idToken);
            params.append('client_id', this.clientId);
            params.append('client_secret', this.clientSecret);
            const response = await axios_1.default.post(introspectUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000
            });
            if (!response.data.active) {
                throw new Error('Token inativo ou inválido');
            }
            console.log('✅ [KeycloakValidation] Token validado pelo Keycloak');
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Erro na validação com Keycloak: ${error.response?.status} - ${error.response?.statusText}`);
            }
            throw error;
        }
    }
    extractCpfFromToken(userData) {
        if (!userData.cpf) {
            throw new Error('CPF não encontrado no token do usuário');
        }
        const cleanCpf = userData.cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11) {
            throw new Error(`CPF inválido: ${userData.cpf}`);
        }
        console.log('🔍 [KeycloakValidation] CPF extraído:', cleanCpf);
        return cleanCpf;
    }
}
exports.KeycloakValidationService = KeycloakValidationService;
let keycloakValidationService;
function getKeycloakValidationService() {
    if (!keycloakValidationService) {
        keycloakValidationService = new KeycloakValidationService();
    }
    return keycloakValidationService;
}
//# sourceMappingURL=keycloak-validation.service.js.map