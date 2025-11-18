export interface ProcessedUserData {
    id: string;
    name: string;
    email: string;
    given_name?: string;
    lastName?: string;
    cpf?: string;
    dataNascimento?: string;
    genero?: string;
    escolaridade?: string;
    cidade?: string;
    uf?: string;
    telefoneCelular?: string;
    telefoneResidencial?: string;
    telefoneTrabalho?: string;
    codParceiro?: string;
    roles?: string[];
    permissions?: string[];
}
export interface EmpresaVinculo {
    id: string;
    cnpj: string;
    nome: string;
    isPrincipal: boolean;
    codStatusEmpresa: string;
    desTipoVinculo: string;
}
export interface EmpresaData {
    cnpj: string;
    porte: number;
    naturezaJuridicaSebrae: number;
    naturezaJuridicaConcla: number;
    situacaoCadastral: string;
    cnaeFiscalPrimario: string;
    cep: string;
    razaoSocial: string;
    nomeFantasia: string;
    dataOpcaoSimples?: string;
    dataExclusaoSimples?: string;
    opcaoSimples: boolean;
    opcaoMei: boolean;
    capitalSocial: number;
    tipoLogradouro: string;
    logradouro: string;
    numeroLogradouro: string;
    complemento?: string;
    bairro: string;
    numeroLocalidade: string;
    uf: string;
    matriz: string;
    dataAberturaEmpresa?: string;
    dataFechamento?: string;
    dataSituacaoCadastral?: string;
    quantidadeFuncionarios: number;
    quantidadeSocios: number;
    socios: Array<{
        nome: string;
        cpf: string;
        principal: boolean;
    }>;
    cnaes: Array<{
        codigo: string;
        descricao: string;
        primario: boolean;
    }>;
    cnaePrimario: Array<{
        codCNAEFiscal: string;
        descricao: string;
    }>;
    cpfPessoaResponsavel: string;
    nomPessoaFisicaResponsavel: string;
    codNaturezaJuridicaSas: number;
    naturezaJuridicaSas: string;
    codSituacaoCadastralSas: string;
    situacaoCadastralSas: string;
    comunicacoes: Array<{
        id: {
            cnpj: string;
            tipoComunicacao: number;
        };
        comunicacao: string;
        situacaoComunicacao: string;
        autorizaContato: boolean;
        tipoComunicacao: {
            id: number;
            descricao: string;
        };
    }>;
    codStatusEmpresa: string;
    desStatusEmpresa: string;
    isCpeOficial: boolean;
    isQuarentena: boolean;
}
export interface EnrichedUserData {
    user: ProcessedUserData;
    empresas: EmpresaVinculo[];
    metadata: {
        hasEmpresaData: boolean;
        empresaSource: 'cpe-backend' | null;
        lastUpdated: string;
        processingTime: number;
    };
}
export interface EnrichUserDataRequest {
    idToken: string;
}
export interface EnrichUserDataResponse {
    success: boolean;
    data?: EnrichedUserData;
    error?: string;
    message?: string;
}
//# sourceMappingURL=enriched-user.types.d.ts.map