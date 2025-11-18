"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticPersistenceService = void 0;
const users_service_1 = require("./users.service");
const companies_service_1 = require("./companies.service");
const user_companies_service_1 = require("./user-companies.service");
const diagnostics_service_1 = require("./diagnostics.service");
const diagnostic_categories_service_1 = require("./diagnostic-categories.service");
const answers_given_service_1 = require("./answers-given.service");
const levels_service_1 = require("../general/levels.service");
class DiagnosticPersistenceService {
    constructor() {
        this.usersService = new users_service_1.UsersService();
        this.companiesService = new companies_service_1.CompaniesService();
        this.userCompaniesService = new user_companies_service_1.UserCompaniesService();
        this.diagnosticsService = new diagnostics_service_1.DiagnosticsService();
        this.diagnosticCategoriesService = new diagnostic_categories_service_1.DiagnosticCategoriesService();
        this.answersGivenService = new answers_given_service_1.AnswersGivenService();
        this.levelsService = new levels_service_1.LevelsService();
    }
    async saveCompleteDiagnostic(requestData, token) {
        try {
            console.log('🔍 [DiagnosticPersistence] ===== INICIANDO SALVAMENTO COMPLETO =====');
            console.log('📥 [DiagnosticPersistence] Dados recebidos do frontend:');
            console.log(JSON.stringify(requestData, null, 2));
            console.log('👤 [DiagnosticPersistence] ===== PROCESSANDO USUÁRIO =====');
            console.log('📋 [DiagnosticPersistence] Dados do usuário recebidos:', requestData.usuario);
            const userDataToSave = {
                given_name: requestData.usuario.given_name,
                last_name: requestData.usuario.lastName,
                cpf: requestData.usuario.cpf,
                data_nascimento: requestData.usuario.dataNascimento,
                genero: requestData.usuario.genero,
                uf: requestData.usuario.uf,
                cidade: requestData.usuario.cidade,
                email: requestData.usuario.email
            };
            console.log('💾 [DiagnosticPersistence] Dados do usuário para salvar no Directus:');
            console.log(JSON.stringify(userDataToSave, null, 2));
            const user = await this.usersService.findOrCreateUser(userDataToSave, token);
            console.log('✅ [DiagnosticPersistence] Usuário processado com sucesso:');
            console.log('🆔 [DiagnosticPersistence] ID do usuário:', user.id);
            console.log('📧 [DiagnosticPersistence] Email do usuário:', user.email);
            console.log('🆔 [DiagnosticPersistence] CPF do usuário:', user.cpf);
            console.log('🏢 [DiagnosticPersistence] ===== PROCESSANDO EMPRESAS =====');
            console.log('📋 [DiagnosticPersistence] Empresas recebidas:', requestData.usuario.empresa);
            const companies = [];
            for (const empresaData of requestData.usuario.empresa) {
                console.log('🏢 [DiagnosticPersistence] Processando empresa:', empresaData.nome);
                console.log('📋 [DiagnosticPersistence] Dados da empresa para salvar:', {
                    cnpj: empresaData.cnpj,
                    nome: empresaData.nome
                });
                const company = await this.companiesService.findOrCreateCompany({
                    cnpj: empresaData.cnpj,
                    nome: empresaData.nome
                }, token);
                console.log('✅ [DiagnosticPersistence] Empresa processada com sucesso:');
                console.log('🆔 [DiagnosticPersistence] ID da empresa:', company.id);
                console.log('🏢 [DiagnosticPersistence] Nome da empresa:', company.nome);
                console.log('🆔 [DiagnosticPersistence] CNPJ da empresa:', company.cnpj);
                companies.push(company);
                console.log('🔗 [DiagnosticPersistence] Vinculando usuário à empresa...');
                const linkData = {
                    is_principal: empresaData.isPrincipal,
                    cod_status_empresa: empresaData.codStatusEmpresa,
                    des_tipo_vinculo: empresaData.desTipoVinculo
                };
                console.log('📋 [DiagnosticPersistence] Dados do vínculo:', linkData);
                await this.userCompaniesService.linkUserToCompany(user.id, company.id, linkData, token);
                console.log('✅ [DiagnosticPersistence] Empresa vinculada com sucesso:', company.id);
            }
            console.log('🎯 [DiagnosticPersistence] ===== IDENTIFICANDO EMPRESA SELECIONADA =====');
            console.log('🔍 [DiagnosticPersistence] CNPJ da empresa selecionada:', requestData.diagnostico.empresaSelecionada);
            console.log('📋 [DiagnosticPersistence] Empresas disponíveis:', companies.map(c => ({ id: c.id, nome: c.nome, cnpj: c.cnpj })));
            const empresaSelecionada = companies.find(c => c.cnpj === requestData.diagnostico.empresaSelecionada);
            if (!empresaSelecionada) {
                throw new Error(`Empresa selecionada não encontrada: ${requestData.diagnostico.empresaSelecionada}`);
            }
            console.log('✅ [DiagnosticPersistence] Empresa selecionada encontrada:');
            console.log('🆔 [DiagnosticPersistence] ID da empresa selecionada:', empresaSelecionada.id);
            console.log('🏢 [DiagnosticPersistence] Nome da empresa selecionada:', empresaSelecionada.nome);
            console.log('📊 [DiagnosticPersistence] ===== BUSCANDO NÍVEL GERAL =====');
            console.log('🔍 [DiagnosticPersistence] Nível geral recebido:', requestData.diagnostico.nivelGeral);
            const levels = await this.levelsService.getLevels(token);
            console.log('📋 [DiagnosticPersistence] Níveis disponíveis:', levels.map(l => ({ id: l.id, title: l.title })));
            const generalLevel = levels.find(l => l.title === requestData.diagnostico.nivelGeral);
            if (!generalLevel) {
                throw new Error(`Nível geral não encontrado: ${requestData.diagnostico.nivelGeral}`);
            }
            console.log('✅ [DiagnosticPersistence] Nível geral encontrado:');
            console.log('🆔 [DiagnosticPersistence] ID do nível geral:', generalLevel.id);
            console.log('📊 [DiagnosticPersistence] Título do nível geral:', generalLevel.title);
            console.log('📝 [DiagnosticPersistence] ===== CRIANDO DIAGNÓSTICO PRINCIPAL =====');
            const diagnosticData = {
                user_id: user.id,
                company_id: empresaSelecionada.id,
                performed_at: requestData.diagnostico.dataRealizacao,
                overall_level_id: generalLevel.id,
                overall_score: requestData.diagnostico.pontuacaoGeral,
                overall_insight: requestData.diagnostico.insightGeral,
                status: requestData.diagnostico.status
            };
            console.log('💾 [DiagnosticPersistence] Dados do diagnóstico para salvar:');
            console.log(JSON.stringify(diagnosticData, null, 2));
            const diagnostic = await this.diagnosticsService.createDiagnostic(diagnosticData, token);
            console.log('✅ [DiagnosticPersistence] Diagnóstico criado com sucesso:');
            console.log('🆔 [DiagnosticPersistence] ID do diagnóstico:', diagnostic.id);
            console.log('📊 [DiagnosticPersistence] Pontuação geral:', diagnostic.overall_score);
            console.log('📅 [DiagnosticPersistence] Data de realização:', diagnostic.performed_at);
            console.log('📊 [DiagnosticPersistence] ===== PROCESSANDO CATEGORIAS =====');
            console.log('📋 [DiagnosticPersistence] Categorias recebidas:', requestData.diagnostico.categorias.length);
            console.log('📋 [DiagnosticPersistence] Detalhes das categorias:', requestData.diagnostico.categorias.map(c => ({
                idCategoria: c.idCategoria,
                nomeCategoria: c.nomeCategoria,
                pontuacaoCategoria: c.pontuacaoCategoria,
                insightCategoria: c.insightCategoria?.substring(0, 50) + '...',
                dicaCategoria: c.dicaCategoria?.substring(0, 50) + '...',
                respostasCount: c.respostasCategoria?.length || 0
            })));
            const categoryResults = [];
            for (const categoria of requestData.diagnostico.categorias) {
                console.log('📊 [DiagnosticPersistence] Processando categoria:', categoria.nomeCategoria);
                console.log('📋 [DiagnosticPersistence] Dados da categoria para salvar:', {
                    diagnostic_id: diagnostic.id,
                    category_id: categoria.idCategoria,
                    level_id: categoria.idNivelCategoria,
                    score: categoria.pontuacaoCategoria,
                    insight: categoria.insightCategoria,
                    tip: categoria.dicaCategoria
                });
                const categoryResult = await this.diagnosticCategoriesService.createCategoryResult({
                    diagnostic_id: diagnostic.id,
                    category_id: categoria.idCategoria,
                    level_id: categoria.idNivelCategoria,
                    score: categoria.pontuacaoCategoria,
                    insight: categoria.insightCategoria,
                    tip: categoria.dicaCategoria
                }, token);
                console.log('✅ [DiagnosticPersistence] Categoria processada com sucesso:');
                console.log('🆔 [DiagnosticPersistence] ID da categoria:', categoryResult.id);
                console.log('📊 [DiagnosticPersistence] Pontuação da categoria:', categoryResult.score);
                categoryResults.push(categoryResult);
                if (categoria.respostasCategoria && categoria.respostasCategoria.length > 0) {
                    console.log('📝 [DiagnosticPersistence] Salvando respostas da categoria:', categoria.nomeCategoria);
                    console.log('📋 [DiagnosticPersistence] Número de respostas:', categoria.respostasCategoria.length);
                    const answersData = categoria.respostasCategoria.map(resposta => ({
                        diagnostic_category_id: categoryResult.id,
                        question_id: resposta.idPergunta,
                        answer_id: resposta.idResposta,
                        score: resposta.pontuacao
                    }));
                    console.log('💾 [DiagnosticPersistence] Dados das respostas para salvar:');
                    console.log(JSON.stringify(answersData, null, 2));
                    await this.answersGivenService.saveAnswers(answersData, token);
                    console.log('✅ [DiagnosticPersistence] Respostas salvas com sucesso para categoria:', categoria.idCategoria);
                }
                else {
                    console.log('⚠️ [DiagnosticPersistence] Nenhuma resposta encontrada para categoria:', categoria.nomeCategoria);
                }
            }
            console.log('🎉 [DiagnosticPersistence] ===== DIAGNÓSTICO COMPLETO SALVO COM SUCESSO =====');
            console.log('✅ [DiagnosticPersistence] Resumo do salvamento:');
            console.log('👤 [DiagnosticPersistence] Usuário ID:', user.id);
            console.log('🏢 [DiagnosticPersistence] Empresa ID:', empresaSelecionada.id);
            console.log('📝 [DiagnosticPersistence] Diagnóstico ID:', diagnostic.id);
            console.log('📊 [DiagnosticPersistence] Categorias processadas:', categoryResults.length);
            console.log('📊 [DiagnosticPersistence] Pontuação geral:', diagnostic.overall_score);
            return {
                success: true,
                data: {
                    user,
                    company: empresaSelecionada,
                    diagnostic,
                    categories: categoryResults
                }
            };
        }
        catch (error) {
            console.error('[DiagnosticPersistence] Erro ao salvar diagnóstico:', error);
            throw error;
        }
    }
}
exports.DiagnosticPersistenceService = DiagnosticPersistenceService;
//# sourceMappingURL=diagnostic-persistence.service.js.map