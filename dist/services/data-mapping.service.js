"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataMappingService = exports.DataMappingService = void 0;
const uuid_1 = require("uuid");
class DataMappingService {
    mapKeycloakUserData(keycloakData) {
        console.log('🔄 [DataMapping] Mapeando dados do usuário Keycloak...');
        console.log('🔄 [DataMapping] Dados Keycloak recebidos:', JSON.stringify(keycloakData, null, 2));
        console.log('🔄 [DataMapping] Campos disponíveis:', Object.keys(keycloakData));
        const processedData = {
            id: keycloakData.sub,
            name: keycloakData.name,
            email: keycloakData.email,
            given_name: keycloakData.given_name,
            lastName: keycloakData.family_name,
            cpf: keycloakData.cpf,
            dataNascimento: keycloakData.dataNascimento,
            genero: keycloakData.genero,
            escolaridade: keycloakData.escolaridade,
            cidade: keycloakData.cidade,
            uf: keycloakData.uf,
            telefoneCelular: keycloakData.telefoneCelular,
            telefoneResidencial: keycloakData.telefoneResidencial,
            telefoneTrabalho: keycloakData.telefoneTrabalho,
            codParceiro: keycloakData.codParceiro,
            roles: keycloakData.realm_access?.roles || [],
            permissions: keycloakData.resource_access?.[keycloakData.azp]?.roles || []
        };
        console.log('✅ [DataMapping] Dados do usuário mapeados:', {
            id: processedData.id,
            name: processedData.name,
            email: processedData.email,
            cpf: processedData.cpf
        });
        return processedData;
    }
    mapCpeEmpresaData(cpeData) {
        console.log('🔄 [DataMapping] Mapeando dados das empresas da API CPE...');
        console.log('🔄 [DataMapping] Dados CPE recebidos:', JSON.stringify(cpeData, null, 2));
        if (!Array.isArray(cpeData)) {
            console.warn('⚠️ [DataMapping] Dados CPE não são um array:', typeof cpeData);
            return [];
        }
        const empresas = cpeData.map((empresa, index) => {
            const empresaVinculo = {
                id: (0, uuid_1.v4)(),
                cnpj: empresa.cnpj || '',
                nome: empresa.nome || '',
                isPrincipal: empresa.isPrincipal || false,
                codStatusEmpresa: empresa.codStatusEmpresa || '',
                desTipoVinculo: empresa.desTipoVinculo || ''
            };
            console.log(`✅ [DataMapping] Empresa ${index + 1} mapeada:`, {
                id: empresaVinculo.id,
                cnpj: empresaVinculo.cnpj,
                nome: empresaVinculo.nome,
                isPrincipal: empresaVinculo.isPrincipal
            });
            return empresaVinculo;
        });
        console.log('✅ [DataMapping] Total de empresas mapeadas:', empresas.length);
        return empresas;
    }
    combineUserAndEmpresaData(userData, empresasData) {
        console.log('🔄 [DataMapping] Combinando dados do usuário e empresas...');
        const enrichedData = {
            user: userData,
            empresas: empresasData,
            metadata: {
                hasEmpresaData: empresasData.length > 0,
                empresaSource: empresasData.length > 0 ? 'cpe-backend' : null,
                lastUpdated: new Date().toISOString(),
                processingTime: Date.now()
            }
        };
        console.log('✅ [DataMapping] Dados combinados:', {
            hasUserData: !!enrichedData.user,
            hasEmpresaData: enrichedData.metadata.hasEmpresaData,
            empresaSource: enrichedData.metadata.empresaSource
        });
        if (enrichedData.empresas.length > 0) {
            console.log('🏢 [DataMapping] Dados das empresas incluídos:', {
                totalEmpresas: enrichedData.empresas.length,
                empresas: enrichedData.empresas.map(emp => ({
                    id: emp.id,
                    cnpj: emp.cnpj,
                    nome: emp.nome,
                    isPrincipal: emp.isPrincipal
                }))
            });
        }
        return enrichedData;
    }
    validateUserData(userData) {
        const requiredFields = ['id', 'name', 'email', 'cpf'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                console.error(`❌ [DataMapping] Campo obrigatório ausente: ${field}`);
                return false;
            }
        }
        const cpf = userData.cpf.replace(/\D/g, '');
        if (cpf.length !== 11) {
            console.error(`❌ [DataMapping] CPF inválido: ${userData.cpf}`);
            return false;
        }
        console.log('✅ [DataMapping] Dados do usuário validados');
        return true;
    }
    validateEmpresaData(empresaData) {
        const requiredFields = ['cnpj', 'razaoSocial'];
        for (const field of requiredFields) {
            if (!empresaData[field]) {
                console.error(`❌ [DataMapping] Campo obrigatório da empresa ausente: ${field}`);
                return false;
            }
        }
        console.log('✅ [DataMapping] Dados da empresa validados');
        return true;
    }
    createDataSummary(enrichedData) {
        return {
            user: {
                id: enrichedData.user.id,
                name: enrichedData.user.name,
                email: enrichedData.user.email,
                given_name: enrichedData.user.given_name,
                lastName: enrichedData.user.lastName,
                cpf: enrichedData.user.cpf,
                cidade: enrichedData.user.cidade,
                uf: enrichedData.user.uf
            },
            empresas: enrichedData.empresas.map(emp => ({
                id: emp.id,
                cnpj: emp.cnpj,
                nome: emp.nome,
                isPrincipal: emp.isPrincipal,
                codStatusEmpresa: emp.codStatusEmpresa,
                desTipoVinculo: emp.desTipoVinculo
            })),
            metadata: enrichedData.metadata
        };
    }
}
exports.DataMappingService = DataMappingService;
exports.dataMappingService = new DataMappingService();
//# sourceMappingURL=data-mapping.service.js.map