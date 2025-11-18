"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const homepage_controller_1 = require("../controllers/homepage.controller");
const router = (0, express_1.Router)();
router.get('/', homepage_controller_1.getHomepage);
exports.default = router;
//# sourceMappingURL=homepage.routes.js.map