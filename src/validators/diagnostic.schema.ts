/**
 * Schema de validação para dados de diagnóstico usando Zod
 */

import { z, type ZodIssue } from 'zod';

/**
 * Schema de validação para resposta de categoria
 */
const categoryAnswerSchema = z.object({
  idPergunta: z.number().int().positive(),
  idResposta: z.number().int().positive(),
  pontuacao: z.number().int().min(0).max(5)
});

/**
 * Schema de validação para categoria de diagnóstico
 */
const diagnosticCategorySchema = z.object({
  idCategoria: z.number().int().positive(),
  nomeCategoria: z.string().min(1),
  idNivelCategoria: z.number().int().positive(),
  nivelCategoria: z.string().min(1),
  pontuacaoCategoria: z.number().int().min(0),
  insightCategoria: z.string().optional(),
  dicaCategoria: z.string().optional(),
  respostasCategoria: z.array(categoryAnswerSchema).optional()
});

/**
 * Schema de validação para dados de diagnóstico completo
 */
export const diagnosticSchema = z.object({
  empresaSelecionada: z.string().min(1, 'Empresa selecionada é obrigatória'),
  dataRealizacao: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Data deve estar no formato ISO 8601'),
  nivelGeral: z.string().min(1, 'Nível geral é obrigatório'),
  pontuacaoGeral: z.number().int().min(0).max(60, 'Pontuação geral inválida'),
  insightGeral: z.string().min(1, 'Insight geral é obrigatório'),
  status: z.string().min(1, 'Status é obrigatório'),
  categorias: z.array(diagnosticCategorySchema).min(1, 'Pelo menos uma categoria é obrigatória')
});

/**
 * Valida dados de diagnóstico
 */
export function validateDiagnosticData(data: unknown): { success: boolean; error?: string; data?: z.infer<typeof diagnosticSchema> } {
  try {
    const validated = diagnosticSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((e: ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Erro de validação desconhecido' };
  }
}

