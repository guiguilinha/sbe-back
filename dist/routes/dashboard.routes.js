"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
router.get('/', dashboard_controller_1.DashboardController.getDashboard);
router.get('/evolution/general', dashboard_controller_1.DashboardController.getEvolutionGeneral);
router.get('/evolution/categories', dashboard_controller_1.DashboardController.getEvolutionCategories);
router.get('/performance/general', dashboard_controller_1.DashboardController.getPerformanceGeneral);
router.get('/performance/category/:categoryId', dashboard_controller_1.DashboardController.getPerformanceCategory);
router.get('/level-labels', dashboard_controller_1.DashboardController.getLevelLabels);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map