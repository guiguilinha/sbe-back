// Tipos compartilhados para usuário enriquecido
// Usados tanto pelo backend quanto pelo frontend

export interface ProcessedUserData {
  id: string;
  name: string;
  email: string;
  
  // Dados pessoais específicos do Keycloak
  given_name?: string;
  lastName?: string;
  cpf?: string;
  dataNascimento?: string;
  genero?: string;
  escolaridade?: string;
  
  // Endereço
  cidade?: string;
  uf?: string;
  
  // Contatos
  telefoneCelular?: string;
  telefoneResidencial?: string;
  telefoneTrabalho?: string;
  
  // Dados Sebrae
  codParceiro?: string;
  
  // Roles e permissões
  roles?: string[];
  permissions?: string[];
}

// Interface simplificada para empresa (baseada na resposta da API CPE)
export interface EmpresaVinculo {
  id: string; // UUID para identificar cada empresa
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
  empresas: EmpresaVinculo[]; // Array de empresas - pode estar vazio
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
