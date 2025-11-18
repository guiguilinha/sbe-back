"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiagnosticoById = exports.listDiagnosticos = void 0;
const diagnosticos_service_1 = require("../services/directus/diagnosticos.service");
const diagnosticosService = new diagnosticos_service_1.DiagnosticosService();
const listDiagnosticos = async (_req, res) => {
    try {
        const data = await diagnosticosService.list();
        res.json(data);
    }
    catch (error) {
        console.error('❌ Error in listDiagnosticos:', error);
        res.status(500).json({ message: 'Failed to load diagnosticos list' });
    }
};
exports.listDiagnosticos = listDiagnosticos;
const getDiagnosticoById = async (req, res) => {
    try {
        const data = await diagnosticosService.getById(req.params.id);
        if (!data) {
            return res.status(404).json({ message: 'Diagnostico not found' });
        }
        return res.json(data);
    }
    catch (error) {
        console.error('❌ Error in getDiagnosticoById:', error);
        return res.status(500).json({ message: 'Failed to load diagnostico' });
    }
};
exports.getDiagnosticoById = getDiagnosticoById;
//# sourceMappingURL=diagnostico.controller.js.map