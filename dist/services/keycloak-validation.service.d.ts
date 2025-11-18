import { KeycloakUserData } from '../types/keycloak-validation.types';
export declare class KeycloakValidationService {
    private authServerUrl;
    private realm;
    private clientId;
    private clientSecret;
    constructor();
    private loadConfig;
    validateIdToken(idToken: string): Promise<KeycloakUserData>;
    getServiceToken(): Promise<string>;
    private validateTokenWithKeycloak;
    extractCpfFromToken(userData: KeycloakUserData): string;
}
export declare function getKeycloakValidationService(): KeycloakValidationService;
//# sourceMappingURL=keycloak-validation.service.d.ts.map