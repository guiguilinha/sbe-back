// Tipos para o endpoint legacy-quiz
// Mapeia dados do frontend para estrutura MySQL do PHP

export interface LegacyQuizRequest {
  answers: UserAnswer[];
  userData?: {
    nome: string;
    empresa: string;
    email: string;
    whatsapp: string;
    estado: string;
    cidade: string;
    newsletter: boolean;
  };
}

export interface UserAnswer {
  question_id: number;
  answer_id: number;
  score: number;
  category_id: number;
}

export interface LegacyQuizResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    affectedRows: number;
  };
}

// Estrutura para mapear respostas para formato PHP
export interface LegacyQuizMapping {
  // Processo (perguntas 1-3)
  processo_r1: string;
  processo_r2: string;
  processo_r3: string;
  processo_p1: number;
  processo_p2: number;
  processo_p3: number;
  
  // Vendas (perguntas 4-6)
  vendas_r1: string;
  vendas_r2: string;
  vendas_r3: string;
  vendas_p1: number;
  vendas_p2: number;
  vendas_p3: number;
  
  // Presença (perguntas 7-9)
  presenca_r1: string;
  presenca_r2: string;
  presenca_r3: string;
  presenca_p1: number;
  presenca_p2: number;
  presenca_p3: number;
  
  // Comunicação (perguntas 10-12)
  com_r1: string;
  com_r2: string;
  com_r3: string;
  com_p1: number;
  com_p2: number;
  com_p3: number;
  
  // Finanças (perguntas 13-15)
  financas_r1: string;
  financas_r2: string;
  financas_r3: string;
  financas_p1: number;
  financas_p2: number;
  financas_p3: number;
  
  // Dados do usuário
  nome: string;
  empresa: string;
  email: string;
  whatsapp: string;
  uf: string;
  cidade: string;
  newsletter: boolean;
  
  // Níveis e pontuações calculadas
  nvl_processo: string;
  total_pts_processo: number;
  nvl_vendas: string;
  total_pts_venda: number;
  nvl_presenca: string;
  total_pts_presenca: number;
  nvl_com: string;
  total_pts_com: number;
  nvl_financas: string;
  total_pts_financas: number;
  nvl_geral: string;
  total_pts: number;
}

