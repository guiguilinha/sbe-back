"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const homepage_routes_1 = __importDefault(require("./routes/homepage.routes"));
const quiz_routes_1 = __importDefault(require("./routes/quiz.routes"));
const results_routes_1 = __importDefault(require("./routes/results.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const diagnosticos_routes_1 = __importDefault(require("./routes/diagnosticos.routes"));
const enriched_user_routes_1 = __importDefault(require("./routes/enriched-user.routes"));
const diagnostic_routes_1 = __importDefault(require("./routes/diagnostic.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use((0, helmet_1.default)());
const getAllowedOrigins = () => {
    const origins = [];
    origins.push('http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080');
    if (process.env.FRONTEND_URL) {
        origins.push(process.env.FRONTEND_URL);
    }
    if (process.env.CORS_ORIGIN) {
        const additionalOrigins = process.env.CORS_ORIGIN
            .split(',')
            .map(origin => origin.trim())
            .filter(origin => origin.length > 0);
        origins.push(...additionalOrigins);
    }
    if (process.env.NODE_ENV === 'production') {
        origins.push('https://sebraemg.com.br', 'https://www.sebraemg.com.br', 'https://maturidade.sebraemg.com.br');
    }
    return [...new Set(origins)];
};
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = getAllowedOrigins();
        if (!origin) {
            console.log('🔓 CORS: Requisição sem origin permitida');
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            console.log(`✅ CORS: Origem permitida: ${origin}`);
            return callback(null, true);
        }
        if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
            console.log(`🔓 CORS: Localhost permitido em desenvolvimento: ${origin}`);
            return callback(null, true);
        }
        console.log(`❌ CORS: Origem bloqueada: ${origin}`);
        console.log(`📋 CORS: Origens permitidas: ${allowedOrigins.join(', ')}`);
        callback(new Error('Não permitido pela política de CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)('combined'));
app.use(body_parser_1.default.json({ limit: '10mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/homepage', homepage_routes_1.default);
app.use('/api/quiz', quiz_routes_1.default);
app.use('/api/results', results_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/diagnosticos', diagnosticos_routes_1.default);
app.use('/api/auth', enriched_user_routes_1.default);
app.use('/api/diagnostics', diagnostic_routes_1.default);
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'API do Diagnóstico de Maturidade Digital',
        version: '1.0.0',
        endpoints: {
            homepage: '/api/homepage',
            quiz: '/api/quiz',
            results: '/api/results',
            dashboard: '/api/dashboard',
            diagnosticos: '/api/diagnosticos',
            auth: '/api/auth',
            diagnostics: '/api/diagnostics'
        }
    });
});
app.use((err, req, res, next) => {
    console.error('Erro na aplicação:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: `A rota ${req.originalUrl} não existe`
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map