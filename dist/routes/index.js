"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const homepage_routes_1 = __importDefault(require("./homepage.routes"));
const quiz_routes_1 = __importDefault(require("./quiz.routes"));
const results_routes_1 = __importDefault(require("./results.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const diagnosticos_routes_1 = __importDefault(require("./diagnosticos.routes"));
const router = (0, express_1.Router)();
router.use('/homepage', homepage_routes_1.default);
router.use('/quiz', quiz_routes_1.default);
router.use('/results', results_routes_1.default);
router.use('/dashboard', dashboard_routes_1.default);
router.use('/diagnosticos', diagnosticos_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map