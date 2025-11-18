"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enriched_user_controller_1 = require("../controllers/enriched-user.controller");
const router = (0, express_1.Router)();
router.post('/enrich-user-data', async (req, res) => {
    await enriched_user_controller_1.enrichedUserController.enrichUserData(req, res);
});
router.get('/enrich-user-status', async (req, res) => {
    await enriched_user_controller_1.enrichedUserController.getServiceStatus(req, res);
});
router.get('/debug-empresa/:cpf', async (req, res) => {
    await enriched_user_controller_1.enrichedUserController.debugEmpresaData(req, res);
});
exports.default = router;
//# sourceMappingURL=enriched-user.routes.js.map