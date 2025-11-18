"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diagnostico_controller_1 = require("../controllers/diagnostico.controller");
const router = (0, express_1.Router)();
router.get('/', diagnostico_controller_1.listDiagnosticos);
router.get('/:id', diagnostico_controller_1.getDiagnosticoById);
exports.default = router;
//# sourceMappingURL=diagnosticos.routes.js.map