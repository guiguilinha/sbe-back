"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticController = void 0;
const diagnostic_persistence_service_1 = require("../services/directus/persistence/diagnostic-persistence.service");
const diagnostics_service_1 = require("../services/directus/persistence/diagnostics.service");
class DiagnosticController {
    constructor() {
        this.persistenceService = new diagnostic_persistence_service_1.DiagnosticPersistenceService();
        this.diagnosticsService = new diagnostics_service_1.DiagnosticsService();
    }
    async saveDiagnostic(req, res) {
        try {
            const requestData = req.body;
            const keycloakToken = req.headers.authorization?.replace('Bearer ', '');
            const directusToken = process.env.DIRECTUS_TOKEN;
            console.log('[DiagnosticController] Salvando diagnóstico...');
            console.log('[DiagnosticController] Token Keycloak:', keycloakToken ? 'Presente' : 'Ausente');
            console.log('[DiagnosticController] Token Directus:', directusToken ? 'Presente' : 'Ausente');
            const result = await this.persistenceService.saveCompleteDiagnostic(requestData, directusToken);
            res.status(201).json(result);
        }
        catch (error) {
            console.error('[DiagnosticController] Erro ao salvar diagnóstico:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
    async getUserDiagnostics(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const keycloakToken = req.headers.authorization?.replace('Bearer ', '');
            const directusToken = process.env.DIRECTUS_TOKEN;
            console.log('[DiagnosticController] Buscando diagnósticos completos do usuário:', userId);
            console.log('[DiagnosticController] Token Keycloak:', keycloakToken ? 'Presente' : 'Ausente');
            console.log('[DiagnosticController] Token Directus:', directusToken ? 'Presente' : 'Ausente');
            const diagnostics = await this.diagnosticsService.getUserDiagnosticsWithDetails(userId, directusToken);
            res.json({
                success: true,
                data: diagnostics
            });
        }
        catch (error) {
            console.error('[DiagnosticController] Erro ao buscar diagnósticos:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
    async getDiagnosticById(req, res) {
        try {
            const diagnosticId = parseInt(req.params.id);
            const token = req.headers.authorization?.replace('Bearer ', '');
            console.log('[DiagnosticController] Buscando diagnóstico:', diagnosticId);
            const diagnostic = await this.diagnosticsService.getDiagnosticById(diagnosticId, token);
            res.json({
                success: true,
                data: diagnostic
            });
        }
        catch (error) {
            console.error('[DiagnosticController] Erro ao buscar diagnóstico:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
}
exports.DiagnosticController = DiagnosticController;
//# sourceMappingURL=diagnostic.controller.js.map