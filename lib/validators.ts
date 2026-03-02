/**
 * Funções de validação para formulários
 */

/**
 * Valida CPF
 * @param cpf - CPF com ou sem formatação
 * @returns true se válido
 */
export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Validação dos dígitos verificadores
  let soma = 0;
  let resto;
  
  // Valida primeiro dígito
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
  
  // Valida segundo dígito
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
  
  return true;
}

/**
 * Formata CPF
 * @param cpf - CPF sem formatação
 * @returns CPF formatado XXX.XXX.XXX-XX
 */
export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, '');
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Valida data no formato DD/MM/AAAA
 * @param data - Data no formato DD/MM/AAAA
 * @returns true se válida
 */
export function validarData(data: string): boolean {
  // Verifica formato
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return false;
  
  const [dia, mes, ano] = data.split('/').map(Number);
  
  // Verifica valores básicos
  if (mes < 1 || mes > 12) return false;
  if (dia < 1 || dia > 31) return false;
  if (ano < 1900 || ano > 2100) return false;
  
  // Verifica dias por mês
  const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Verifica ano bissexto
  if ((ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0) {
    diasPorMes[1] = 29;
  }
  
  if (dia > diasPorMes[mes - 1]) return false;
  
  return true;
}

/**
 * Formata data
 * @param data - Data sem formatação
 * @returns Data formatada DD/MM/AAAA
 */
export function formatarData(data: string): string {
  const dataLimpa = data.replace(/\D/g, '');
  if (dataLimpa.length <= 2) return dataLimpa;
  if (dataLimpa.length <= 4) return `${dataLimpa.slice(0, 2)}/${dataLimpa.slice(2)}`;
  return `${dataLimpa.slice(0, 2)}/${dataLimpa.slice(2, 4)}/${dataLimpa.slice(4, 8)}`;
}

/**
 * Valida telefone no formato (XX)XXXXX-XXXX
 * @param telefone - Telefone com ou sem formatação
 * @returns true se válido
 */
export function validarTelefone(telefone: string): boolean {
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
  if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) return false;
  
  // Verifica DDD válido (11 a 99)
  const ddd = parseInt(telefoneLimpo.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  return true;
}

/**
 * Formata telefone
 * @param telefone - Telefone sem formatação
 * @returns Telefone formatado (XX)XXXXX-XXXX ou (XX)XXXX-XXXX
 */
export function formatarTelefone(telefone: string): string {
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  if (telefoneLimpo.length <= 2) return `(${telefoneLimpo}`;
  if (telefoneLimpo.length <= 6) return `(${telefoneLimpo.slice(0, 2)})${telefoneLimpo.slice(2)}`;
  if (telefoneLimpo.length <= 10) {
    return `(${telefoneLimpo.slice(0, 2)})${telefoneLimpo.slice(2, 6)}-${telefoneLimpo.slice(6)}`;
  }
  return `(${telefoneLimpo.slice(0, 2)})${telefoneLimpo.slice(2, 7)}-${telefoneLimpo.slice(7, 11)}`;
}

/**
 * Valida email
 * @param email - Email
 * @returns true se válido
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida CNPJ
 * @param cnpj - CNPJ com ou sem formatação
 * @returns true se válido
 */
export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;
  
  // Validação dos dígitos verificadores
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

/**
 * Formata CNPJ
 * @param cnpj - CNPJ sem formatação
 * @returns CNPJ formatado XX.XXX.XXX/XXXX-XX
 */
export function formatarCNPJ(cnpj: string): string {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
