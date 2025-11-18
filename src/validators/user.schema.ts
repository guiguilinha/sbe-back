/**
 * Schema de validação para dados de usuário usando Zod
 */

import { z } from 'zod';

/**
 * Valida CPF (formato e dígitos verificadores)
 */
function validateCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, '');
  
  if (cleanCpf.length !== 11) {
    return false;
  }
  
  // Verificar se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }
  
  // Validar dígitos verificadores
  let sum = 0;
  let remainder;
  
  // Validar primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) {
    return false;
  }
  
  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) {
    return false;
  }
  
  return true;
}

/**
 * Schema de validação para dados de usuário
 */
export const userSchema = z.object({
  given_name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  last_name: z.string().min(1, 'Sobrenome é obrigatório').max(100, 'Sobrenome muito longo'),
  cpf: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(14, 'CPF inválido')
    .refine((cpf) => validateCPF(cpf), {
      message: 'CPF inválido (dígitos verificadores incorretos)'
    }),
  data_nascimento: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  genero: z.string().optional(),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').optional(),
  cidade: z.string().max(100, 'Cidade muito longa').optional(),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
});

/**
 * Schema para criação de usuário (todos os campos opcionais exceto os essenciais)
 */
export const createUserSchema = userSchema.partial().required({
  cpf: true,
  email: true
});

/**
 * Valida dados de usuário
 */
export function validateUserData(data: unknown): { success: boolean; error?: string; data?: z.infer<typeof userSchema> } {
  try {
    const validated = userSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Erro de validação desconhecido' };
  }
}

