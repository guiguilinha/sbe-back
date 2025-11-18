"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpeBackendService = void 0;
exports.getCpeBackendService = getCpeBackendService;
const axios_1 = __importDefault(require("axios"));
class CpeBackendService {
    constructor() {
        this.loadConfig();
    }
    loadConfig() {
        this.baseUrl = process.env.CPE_BACKEND_URL || '';
        this.timeout = parseInt(process.env.CPE_BACKEND_TIMEOUT || '10000');
        console.log('🔧 [CpeBackend] Configuração carregada:', {
            baseUrl: this.baseUrl,
            timeout: this.timeout,
            configured: this.isConfigured()
        });
    }
    async getEmpresaData(cpf, serviceToken) {
        try {
            this.loadConfig();
            console.log('🏢 [CpeBackend] Buscando dados da empresa para CPF:', cpf);
            if (!serviceToken) {
                throw new Error('Token de serviço não fornecido');
            }
            const url = `${this.baseUrl}/vinculo-empresa?cpf=${cpf}`;
            const response = await axios_1.default.get(url, {
                timeout: this.timeout,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceToken}`
                }
            });
            if (response.status === 200 && response.data) {
                console.log('✅ [CpeBackend] Dados da empresa encontrados');
                console.log('✅ [CpeBackend] Dados recebidos (tipo):', typeof response.data);
                console.log('✅ [CpeBackend] Dados recebidos (completo):', JSON.stringify(response.data, null, 2));
                const empresaData = this.validateEmpresaData(response.data);
                if (empresaData) {
                    console.log('✅ [CpeBackend] Dados da empresa validados:', {
                        cnpj: empresaData.cnpj,
                        razaoSocial: empresaData.razaoSocial,
                        nomeFantasia: empresaData.nomeFantasia
                    });
                    return empresaData;
                }
                else {
                    console.log('⚠️ [CpeBackend] Dados da empresa não passaram na validação');
                }
            }
            console.log('ℹ️ [CpeBackend] Nenhuma empresa encontrada para o CPF');
            return null;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    console.log('ℹ️ [CpeBackend] Empresa não encontrada (404)');
                    return null;
                }
                console.error('❌ [CpeBackend] Erro na API:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                throw new Error(`Erro na API CPE: ${error.response?.status} - ${error.response?.statusText}`);
            }
            if (error instanceof Error && 'code' in error && error.code === 'ECONNABORTED') {
                throw new Error('Timeout na consulta à API CPE');
            }
            console.error('❌ [CpeBackend] Erro inesperado:', error);
            throw new Error(`Erro inesperado na API CPE: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    validateEmpresaData(rawData) {
        try {
            console.log('🔍 [CpeBackend] Validando dados da empresa...');
            console.log('🔍 [CpeBackend] Dados recebidos para validação:', JSON.stringify(rawData, null, 2));
            let dataToValidate = rawData;
            if (Array.isArray(rawData) && dataToValidate.length > 0) {
                console.log('🔍 [CpeBackend] É um array, pegando primeiro item');
                dataToValidate = rawData[0];
                console.log('🔍 [CpeBackend] Primeiro item:', JSON.stringify(dataToValidate, null, 2));
            }
            if (!dataToValidate.cnpj || !dataToValidate.razaoSocial) {
                console.warn('⚠️ [CpeBackend] Dados da empresa incompletos:', {
                    hasCnpj: !!dataToValidate.cnpj,
                    hasRazaoSocial: !!dataToValidate.razaoSocial,
                    cnpj: dataToValidate.cnpj,
                    razaoSocial: dataToValidate.razaoSocial
                });
                return null;
            }
            const empresaData = {
                cnpj: dataToValidate.cnpj,
                porte: dataToValidate.porte || 0,
                naturezaJuridicaSebrae: dataToValidate.naturezaJuridicaSebrae || 0,
                naturezaJuridicaConcla: dataToValidate.naturezaJuridicaConcla || 0,
                situacaoCadastral: dataToValidate.situacaoCadastral || '',
                cnaeFiscalPrimario: dataToValidate.cnaeFiscalPrimario || '',
                cep: dataToValidate.cep || '',
                razaoSocial: dataToValidate.razaoSocial,
                nomeFantasia: dataToValidate.nomeFantasia || '',
                dataOpcaoSimples: dataToValidate.dataOpcaoSimples,
                dataExclusaoSimples: dataToValidate.dataExclusaoSimples,
                opcaoSimples: dataToValidate.opcaoSimples || false,
                opcaoMei: dataToValidate.opcaoMei || false,
                capitalSocial: dataToValidate.capitalSocial || 0,
                tipoLogradouro: dataToValidate.tipoLogradouro || '',
                logradouro: dataToValidate.logradouro || '',
                numeroLogradouro: dataToValidate.numeroLogradouro || '',
                complemento: dataToValidate.complemento,
                bairro: dataToValidate.bairro || '',
                numeroLocalidade: dataToValidate.numeroLocalidade || '',
                uf: dataToValidate.uf || '',
                matriz: dataToValidate.matriz || '',
                dataAberturaEmpresa: dataToValidate.dataAberturaEmpresa || '',
                dataFechamento: dataToValidate.dataFechamento,
                dataSituacaoCadastral: dataToValidate.dataSituacaoCadastral || '',
                quantidadeFuncionarios: dataToValidate.quantidadeFuncionarios || 0,
                quantidadeSocios: dataToValidate.quantidadeSocios || 0,
                socios: dataToValidate.socios || [],
                cnaes: dataToValidate.cnaes || [],
                cnaePrimario: dataToValidate.cnaePrimario || [],
                cpfPessoaResponsavel: dataToValidate.cpfPessoaResponsavel || '',
                nomPessoaFisicaResponsavel: dataToValidate.nomPessoaFisicaResponsavel || '',
                codNaturezaJuridicaSas: dataToValidate.codNaturezaJuridicaSas || 0,
                naturezaJuridicaSas: dataToValidate.naturezaJuridicaSas || '',
                codSituacaoCadastralSas: dataToValidate.codSituacaoCadastralSas || '',
                situacaoCadastralSas: dataToValidate.situacaoCadastralSas || '',
                comunicacoes: dataToValidate.comunicacoes || [],
                codStatusEmpresa: dataToValidate.codStatusEmpresa || '',
                desStatusEmpresa: dataToValidate.desStatusEmpresa || '',
                isCpeOficial: dataToValidate.isCpeOficial || false,
                isQuarentena: dataToValidate.isQuarentena || false
            };
            return empresaData;
        }
        catch (error) {
            console.error('❌ [CpeBackend] Erro na validação dos dados:', error);
            return null;
        }
    }
    async getRawEmpresaData(cpf, serviceToken) {
        try {
            console.log('🔍 [CpeBackend] Buscando dados brutos da empresa para CPF:', cpf);
            console.log('🔍 [CpeBackend] === DADOS USADOS PARA CHAMAR API CPE ===');
            console.log('🔍 [CpeBackend] baseUrl:', this.baseUrl);
            console.log('🔍 [CpeBackend] cpf:', cpf);
            console.log('🔍 [CpeBackend] serviceToken (primeiros 20 chars):', serviceToken.substring(0, 20) + '...');
            if (!this.baseUrl) {
                throw new Error('URL da API CPE não configurada');
            }
            if (!serviceToken) {
                throw new Error('Token de serviço não fornecido');
            }
            const url = `${this.baseUrl}/vinculo-empresa?cpf=${cpf}`;
            console.log('🔍 [CpeBackend] URL completa da API CPE:', url);
            console.log('🔍 [CpeBackend] Fazendo requisição para:', url);
            console.log('🔍 [CpeBackend] Headers enviados:', {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceToken.substring(0, 20)}...`
            });
            const response = await axios_1.default.get(url, {
                timeout: this.timeout,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceToken}`
                }
            });
            console.log('🔍 [CpeBackend] === RESPOSTA COMPLETA DA API CPE ===');
            console.log('🔍 [CpeBackend] Status:', response.status);
            console.log('🔍 [CpeBackend] Status Text:', response.statusText);
            console.log('🔍 [CpeBackend] Headers:', JSON.stringify(response.headers, null, 2));
            console.log('🔍 [CpeBackend] Data (tipo):', typeof response.data);
            console.log('🔍 [CpeBackend] Data (completa):', JSON.stringify(response.data, null, 2));
            console.log('🔍 [CpeBackend] === DADOS BRUTOS DA EMPRESA PARA DEBUG ===');
            if (Array.isArray(response.data)) {
                console.log('🔍 [CpeBackend] É um array com', response.data.length, 'itens');
                response.data.forEach((item, index) => {
                    console.log(`🔍 [CpeBackend] Item ${index + 1}:`, JSON.stringify(item, null, 2));
                });
            }
            else {
                console.log('🔍 [CpeBackend] Não é um array:', response.data);
            }
            return response.data;
        }
        catch (error) {
            console.error('❌ [CpeBackend] Erro ao buscar dados brutos:', error);
            if (axios_1.default.isAxiosError(error)) {
                console.error('❌ [CpeBackend] Status do erro:', error.response?.status);
                console.error('❌ [CpeBackend] Dados do erro:', error.response?.data);
            }
            throw error;
        }
    }
    isConfigured() {
        return !!(this.baseUrl && this.baseUrl.length > 0);
    }
    getConfigInfo() {
        return {
            baseUrl: this.baseUrl,
            timeout: this.timeout,
            configured: this.isConfigured()
        };
    }
}
exports.CpeBackendService = CpeBackendService;
let cpeBackendService;
function getCpeBackendService() {
    if (!cpeBackendService) {
        cpeBackendService = new CpeBackendService();
    }
    return cpeBackendService;
}
//# sourceMappingURL=cpe-backend.service.js.map