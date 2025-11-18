import { KeycloakUserData } from '../types/keycloak-validation.types';
import { ProcessedUserData, EmpresaData, EmpresaVinculo, EnrichedUserData } from '../contracts/enriched-user.types';
export declare class DataMappingService {
    mapKeycloakUserData(keycloakData: KeycloakUserData): ProcessedUserData;
    mapCpeEmpresaData(cpeData: any[]): EmpresaVinculo[];
    combineUserAndEmpresaData(userData: ProcessedUserData, empresasData: EmpresaVinculo[]): EnrichedUserData;
    validateUserData(userData: ProcessedUserData): boolean;
    validateEmpresaData(empresaData: EmpresaData): boolean;
    createDataSummary(enrichedData: EnrichedUserData): any;
}
export declare const dataMappingService: DataMappingService;
//# sourceMappingURL=data-mapping.service.d.ts.map