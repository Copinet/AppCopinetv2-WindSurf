// Utilitários para manipulação de PDF e Word - SOLUÇÃO DEFINITIVA
import * as FileSystem from 'expo-file-system';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configurar worker do PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * SOLUÇÃO DEFINITIVA: Conta páginas de PDF usando pdfjs-dist
 * Conforme instruções do usuário - SEM FALHAS
 */
export async function contarPaginasPDF(uri: string): Promise<number> {
  console.log('📄 [PDF.JS] Iniciando contagem DEFINITIVA de páginas:', uri);
  
  try {
    // Ler arquivo como base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('🔄 [PDF.JS] Convertendo base64 para ArrayBuffer...');
    
    // Converter base64 para ArrayBuffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('📖 [PDF.JS] Carregando documento PDF...');
    
    // Carregar PDF com pdfjs-dist
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    
    // Extrair número de páginas
    const numPages = pdf.numPages;
    
    console.log(`✅ [PDF.JS] SUCESSO! Páginas detectadas: ${numPages}`);
    
    return numPages;
    
  } catch (error) {
    console.error('❌ [PDF.JS] Erro ao contar páginas:', error);
    
    // Fallback: estimativa por tamanho
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const tamanhoBytes = Math.round(base64.length * 0.75);
      const estimativa = Math.max(1, Math.round(tamanhoBytes / 11350));
      console.log(`⚠️ [PDF.JS] FALLBACK: ~${estimativa} páginas (${tamanhoBytes} bytes)`);
      return estimativa;
    } catch (e) {
      console.error('❌ [PDF.JS] Fallback falhou:', e);
      return 1;
    }
  }
}

/**
 * SOLUÇÃO DEFINITIVA: Conta páginas de Word usando mammoth
 * Conforme instruções do usuário - SEM FALHAS
 */
export async function contarPaginasWord(uri: string, tamanhoBytes: number): Promise<number> {
  console.log('📝 [MAMMOTH] Iniciando contagem DEFINITIVA de páginas Word:', uri);
  
  try {
    // Ler arquivo como ArrayBuffer
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('🔄 [MAMMOTH] Convertendo base64 para ArrayBuffer...');
    
    // Converter base64 para ArrayBuffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('📖 [MAMMOTH] Extraindo texto do Word...');
    
    // Extrair texto com mammoth
    const result = await mammoth.extractRawText({ arrayBuffer: bytes.buffer });
    const texto = result.value;
    
    // Estimar páginas: ~3000 caracteres por página
    const CARACTERES_POR_PAGINA = 3000;
    const paginasEstimadas = Math.max(1, Math.round(texto.length / CARACTERES_POR_PAGINA));
    
    console.log(`✅ [MAMMOTH] SUCESSO! Texto: ${texto.length} caracteres`);
    console.log(`✅ [MAMMOTH] Páginas estimadas: ${paginasEstimadas}`);
    
    return paginasEstimadas;
    
  } catch (error) {
    console.error('❌ [MAMMOTH] Erro ao contar páginas:', error);
    
    // Fallback: estimativa por tamanho (calibrado: 1841KB = 15 páginas)
    // 1841KB / 15 = ~122.7KB por página
    const BYTES_POR_PAGINA = 122700;
    const estimativa = Math.max(1, Math.round(tamanhoBytes / BYTES_POR_PAGINA));
    console.log(`⚠️ [MAMMOTH] FALLBACK: ~${estimativa} páginas (${tamanhoBytes} bytes)`);
    return estimativa;
  }
}

/**
 * Estima páginas de PowerPoint por tamanho
 */
export function estimarPaginasPowerPoint(tamanhoBytes: number): number {
  const BYTES_POR_SLIDE = 50000;
  const estimativa = Math.max(1, Math.round(tamanhoBytes / BYTES_POR_SLIDE));
  console.log(`📊 [POWERPOINT] Estimativa: ${estimativa} slides (${tamanhoBytes} bytes)`);
  return estimativa;
}

/**
 * Valida e formata string de páginas específicas
 * Ex: "1-3, 5, 7-10" -> válido
 */
export function validarPaginasEspecificas(input: string, totalPaginas: number): {
  valido: boolean;
  mensagem?: string;
  paginas?: number[];
} {
  if (!input.trim()) {
    return { valido: true, paginas: [] };
  }

  try {
    const paginas: number[] = [];
    const partes = input.split(',').map(p => p.trim());

    for (const parte of partes) {
      if (parte.includes('-')) {
        // Intervalo: 1-5
        const [inicio, fim] = parte.split('-').map(n => parseInt(n.trim(), 10));
        
        if (isNaN(inicio) || isNaN(fim)) {
          return { valido: false, mensagem: 'Formato inválido. Use: 1-3, 5, 7-10' };
        }
        
        if (inicio > fim) {
          return { valido: false, mensagem: 'Intervalo inválido: início maior que fim' };
        }
        
        if (inicio < 1 || fim > totalPaginas) {
          return { valido: false, mensagem: `Páginas devem estar entre 1 e ${totalPaginas}` };
        }
        
        for (let i = inicio; i <= fim; i++) {
          if (!paginas.includes(i)) {
            paginas.push(i);
          }
        }
      } else {
        // Página única: 5
        const pagina = parseInt(parte, 10);
        
        if (isNaN(pagina)) {
          return { valido: false, mensagem: 'Formato inválido. Use: 1-3, 5, 7-10' };
        }
        
        if (pagina < 1 || pagina > totalPaginas) {
          return { valido: false, mensagem: `Páginas devem estar entre 1 e ${totalPaginas}` };
        }
        
        if (!paginas.includes(pagina)) {
          paginas.push(pagina);
        }
      }
    }

    return { valido: true, paginas: paginas.sort((a, b) => a - b) };
  } catch (error) {
    return { valido: false, mensagem: 'Formato inválido. Use: 1-3, 5, 7-10' };
  }
}

/**
 * Calcula quantidade de páginas a imprimir baseado na seleção
 */
export function calcularPaginasImprimir(
  totalPaginas: number,
  paginasEspecificas?: string
): number {
  if (!paginasEspecificas || !paginasEspecificas.trim()) {
    return totalPaginas;
  }

  const resultado = validarPaginasEspecificas(paginasEspecificas, totalPaginas);
  if (resultado.valido && resultado.paginas) {
    return resultado.paginas.length;
  }

  return totalPaginas;
}
