"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diagnostic_controller_1 = require("../controllers/diagnostic.controller");
const router = (0, express_1.Router)();
const diagnosticController = new diagnostic_controller_1.DiagnosticController();
router.post('/', (req, res) => diagnosticController.saveDiagnostic(req, res));
router.get('/user/:userId', (req, res) => diagnosticController.getUserDiagnostics(req, res));
router.get('/:id', (req, res) => diagnosticController.getDiagnosticById(req, res));
exports.default = router;
//# sourceMappingURL=diagnostic.routes.js.map