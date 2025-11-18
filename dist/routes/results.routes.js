"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const results_controller_1 = require("../controllers/results.controller");
const router = (0, express_1.Router)();
router.post('/calculate', results_controller_1.ResultsController.calculate);
router.get('/debug-trails', results_controller_1.ResultsController.debugTrails);
exports.default = router;
//# sourceMappingURL=results.routes.js.map