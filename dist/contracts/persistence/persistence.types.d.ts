export interface User {
    id: number;
    given_name: string;
    last_name: string;
    cpf: string;
    data_nascimento: string;
    genero: string;
    uf: string;
    cidade: string;
    email: string;
    date_created?: string;
    date_updated?: string;
}
export interface Company {
    id: number;
    cnpj: string;
    nome: string;
    date_created?: string;
    date_updated?: string;
}
export interface UserCompany {
    id: number;
    user_id: number;
    company_id: number;
    is_principal: boolean;
    cod_status_empresa: string;
    des_tipo_vinculo: string;
}
export interface Diagnostic {
    id: number;
    user_id: number;
    company_id: number;
    performed_at: string;
    overall_level_id: number;
    overall_score: number;
    overall_insight: string;
    status: string;
}
export interface DiagnosticCategory {
    id: number;
    diagnostic_id: number;
    category_id: number;
    level_id: number;
    score: number;
    insight: string;
    tip: string;
}
export interface AnswerGiven {
    id: number;
    diagnostic_category_id: number;
    question_id: number;
    answer_id: number;
    answer_text: string;
    score: number;
}
export interface CompleteDiagnosticRequest {
    usuario: {
        given_name: string;
        lastName: string;
        cpf: string;
        dataNascimento: string;
        genero: string;
        uf: string;
        cidade: string;
        email: string;
        empresa: Array<{
            idEmpresa?: number;
            cnpj: string;
            nome: string;
            isPrincipal: boolean;
            codStatusEmpresa: string;
            desTipoVinculo: string;
        }>;
    };
    diagnostico: {
        empresaSelecionada: string;
        dataRealizacao: string;
        nivelGeral: string;
        pontuacaoGeral: number;
        insightGeral: string;
        status: string;
        categorias: Array<{
            idCategoria: number;
            nomeCategoria: string;
            idNivelCategoria: number;
            nivelCategoria: string;
            pontuacaoCategoria: number;
            insightCategoria: string;
            dicaCategoria: string;
            respostasCategoria: Array<{
                idPergunta: number;
                pergunta: string;
                idResposta: number;
                resposta: string;
                pontuacao: number;
            }>;
        }>;
    };
}
export interface CompleteDiagnosticResponse {
    success: boolean;
    data: {
        user: User;
        company: Company;
        diagnostic: Diagnostic;
        categories: DiagnosticCategory[];
    };
}
//# sourceMappingURL=persistence.types.d.ts.map