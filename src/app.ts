import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';

// dotenv.config() foi movido para server.ts

// Importar rotas ativas
import homepageRoutes from './routes/homepage.routes';
import quizRoutes from './routes/quiz.routes';
import resultsRoutes from './routes/results.routes';
import dashboardRoutes from './routes/dashboard.routes';
import diagnosticosRoutes from './routes/diagnosticos.routes';
import enrichedUserRoutes from './routes/enriched-user.routes';
import diagnosticRoutes from './routes/diagnostic.routes';

const app: Application = express();
const PORT = process.env.PORT || 8080;

// Middleware de segurança
app.use(helmet());

// Middleware de CORS - Configuração Agnóstica
const getAllowedOrigins = (): string[] => {
  const origins: string[] = [];
  
  // 1. Origens padrão para desenvolvimento
  origins.push('http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080');
  
  // 2. URL do frontend configurada
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  // 3. Origens adicionais via variável de ambiente
  if (process.env.CORS_ORIGIN) {
    const additionalOrigins = process.env.CORS_ORIGIN
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
    origins.push(...additionalOrigins);
  }
  
  // 4. Origens dinâmicas baseadas no ambiente
  if (process.env.NODE_ENV === 'production') {
    // Em produção, permite domínios do Sebrae
    origins.push(
      'https://sebraemg.com.br',
      'https://www.sebraemg.com.br',
      'https://maturidade.sebraemg.com.br'
    );
  }
  
  // Remove duplicatas
  return [...new Set(origins)];
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Permite requisições sem 'origin' (ex: mobile apps, curl, Postman)
    if (!origin) {
      console.log('🔓 CORS: Requisição sem origin permitida');
      return callback(null, true);
    }
    
    // Verifica se a origem está na lista de permitidas
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Origem permitida: ${origin}`);
      return callback(null, true);
    }
    
    // Em desenvolvimento, permite localhost com qualquer porta
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
app.use(cors(corsOptions));

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsing de JSON usando body-parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Rotas da API ativas
app.use('/api/homepage', homepageRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/diagnosticos', diagnosticosRoutes);
app.use('/api/auth', enrichedUserRoutes);
app.use('/api/diagnostics', diagnosticRoutes);

// Rota raiz
app.get('/', (req: Request, res: Response) => {
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

// Middleware de tratamento de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro na aplicação:', err);
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe`
  });
});

export default app; 