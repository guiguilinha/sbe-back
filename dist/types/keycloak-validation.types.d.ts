export interface KeycloakUserData {
    exp: number;
    iat: number;
    auth_time: number;
    jti: string;
    iss: string;
    aud: string;
    sub: string;
    typ: string;
    azp: string;
    nonce: string;
    session_state: string;
    at_hash: string;
    sid: string;
    telefoneResidencial?: string;
    lastName: string;
    cidade: string;
    email_verified: boolean;
    bairro: string;
    preferred_username: string;
    telefoneCelular?: string;
    given_name: string;
    cep: string;
    codParceiro?: string;
    firstName: string;
    uf: string;
    logradouro: string;
    telefoneTrabalho?: string;
    genero?: string;
    name: string;
    cpf: string;
    escolaridade?: string;
    dataNascimento?: string;
    family_name: string;
    email: string;
    realm_access?: {
        roles: string[];
    };
    resource_access?: {
        [clientId: string]: {
            roles: string[];
        };
    };
}
export interface KeycloakTokenIntrospectionResponse {
    active: boolean;
    exp?: number;
    iat?: number;
    aud?: string;
    iss?: string;
    sub?: string;
    typ?: string;
    azp?: string;
    nonce?: string;
    session_state?: string;
    acr?: string;
    realm_access?: {
        roles: string[];
    };
    resource_access?: {
        [clientId: string]: {
            roles: string[];
        };
    };
    scope?: string;
    sid?: string;
    email_verified?: boolean;
    name?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
}
export interface CpeBackendResponse {
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
//# sourceMappingURL=keycloak-validation.types.d.ts.map