/**
 * Schema de validação para dados de empresa usando Zod
 */

import { z } from 'zod';

/**
 * Valida CNPJ (formato e dígitos verificadores)
 */
function validateCNPJ(cnpj: string): boolean {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  
  if (cleanCnpj.length !== 14) {
    return false;
  }
  
  // Verificar se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1{13}$/.test(cleanCnpj)) {
    return false;
  }
  
  // Validar dígitos verificadores
  let length = cleanCnpj.length - 2;
  let numbers = cleanCnpj.substring(0, length);
  const digits = cleanCnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  // Validar primeiro dígito verificador
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }
  
  // Validar segundo dígito verificador
  length = length + 1;
  numbers = cleanCnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }
  
  return true;
}

/**
 * Schema de validação para dados de empresa
 */
export const companySchema = z.object({
  cnpj: z.string()
    .min(14, 'CNPJ deve ter 14 dígitos')
    .max(18, 'CNPJ inválido')
    .refine((cnpj) => validateCNPJ(cnpj), {
      message: 'CNPJ inválido (dígitos verificadores incorretos)'
    }),
  nome: z.string()
    .min(1, 'Nome da empresa é obrigatório')
    .max(255, 'Nome da empresa muito longo')
});

/**
 * Schema para criação de empresa
 */
export const createCompanySchema = companySchema;

/**
 * Valida dados de empresa
 */
export function validateCompanyData(data: unknown): { success: boolean; error?: string; data?: z.infer<typeof companySchema> } {
  try {
    const validated = companySchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Erro de validação desconhecido' };
  }
}

