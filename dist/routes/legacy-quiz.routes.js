"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const legacy_quiz_controller_1 = require("../controllers/legacy-quiz.controller");
const router = (0, express_1.Router)();
router.post('/legacy-quiz', legacy_quiz_controller_1.LegacyQuizController.processQuiz);
router.get('/legacy-quiz/health', legacy_quiz_controller_1.LegacyQuizController.healthCheck);
exports.default = router;
//# sourceMappingURL=legacy-quiz.routes.js.map