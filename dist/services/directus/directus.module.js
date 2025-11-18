"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectusServiceFactory = exports.DirectusModuleConfig = exports.ResultsService = exports.QuizService = exports.HomepageService = exports.DirectusBaseService = void 0;
const homepage_service_1 = require("./homepage.service");
const quiz_service_1 = require("./quiz.service");
const results_service_1 = require("./results.service");
var directus_base_service_1 = require("./base/directus-base.service");
Object.defineProperty(exports, "DirectusBaseService", { enumerable: true, get: function () { return directus_base_service_1.DirectusBaseService; } });
__exportStar(require("./base/directus.types"), exports);
var homepage_service_2 = require("./homepage.service");
Object.defineProperty(exports, "HomepageService", { enumerable: true, get: function () { return homepage_service_2.HomepageService; } });
var quiz_service_2 = require("./quiz.service");
Object.defineProperty(exports, "QuizService", { enumerable: true, get: function () { return quiz_service_2.QuizService; } });
var results_service_2 = require("./results.service");
Object.defineProperty(exports, "ResultsService", { enumerable: true, get: function () { return results_service_2.ResultsService; } });
exports.DirectusModuleConfig = {
    cache: {
        enabled: true,
        ttl: 300,
        maxSize: 100,
    },
    retry: {
        enabled: true,
        maxRetries: 3,
        delay: 1000,
        backoffMultiplier: 2,
    },
    logging: {
        level: 'info',
        includeTimestamp: true,
        includeServiceName: true,
    },
    timeout: 30000,
};
class DirectusServiceFactory {
    static createHomepageService() {
        return new homepage_service_1.HomepageService();
    }
    static createQuizService() {
        return new quiz_service_1.QuizService();
    }
    static createResultsService() {
        return new results_service_1.ResultsService();
    }
    static createAllServices() {
        return {
            homepage: this.createHomepageService(),
            quiz: this.createQuizService(),
            results: this.createResultsService(),
        };
    }
}
exports.DirectusServiceFactory = DirectusServiceFactory;
//# sourceMappingURL=directus.module.js.map