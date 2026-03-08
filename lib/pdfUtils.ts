// Utilitários para manipulação de PDF e Word - SOLUÇÃO DEFINITIVA
// Método por tamanho de arquivo - SIMPLES, CONFIÁVEL, FUNCIONA
import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib';
import { estimateDocxPagesFromContent, getDocxPagesFromAppXml, getPptxSlidesFromAppXml } from './openXmlUtils';

function isWhitespaceByte(byte: number): boolean {
  return byte === 9 || byte === 10 || byte === 13 || byte === 32;
}

function countPdfPageObjectsFromBytes(bytes: Uint8Array): number {
  // Busca padrão ASCII: /Type <spaces> /Page(?!s)
  const len = bytes.length;
  let count = 0;

  for (let i = 0; i < len - 12; i++) {
    // /Type
    if (
      bytes[i] === 47 && // /
      bytes[i + 1] === 84 && // T
      bytes[i + 2] === 121 && // y
      bytes[i + 3] === 112 && // p
      bytes[i + 4] === 101 // e
    ) {
      let j = i + 5;

      while (j < len && isWhitespaceByte(bytes[j])) {
        j++;
      }

      // /Page
      if (
        j + 4 < len &&
        bytes[j] === 47 && // /
        bytes[j + 1] === 80 && // P
        bytes[j + 2] === 97 && // a
        bytes[j + 3] === 103 && // g
        bytes[j + 4] === 101 // e
      ) {
        const nextByte = j + 5 < len ? bytes[j + 5] : -1;
        // Ignora /Pages
        if (nextByte !== 115) {
          count++;
        }
      }
    }
  }

  return count;
}

/**
 * SOLUÇÃO REACT NATIVE: Conta páginas de PDF com leitura real
 * Método primário: pdf-lib (preciso)
 * Fallbacks: regex de estrutura PDF e estimativa por tamanho
 */
export async function contarPaginasPDF(uri: string): Promise<number> {
  console.log('📄 [PDF] Iniciando contagem de páginas:', uri);
  
  try {
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const pdfDoc = await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    const pageCount = pdfDoc.getPageCount();
    console.log(`✅ [PDF] Contagem real (pdf-lib): ${pageCount} páginas`);
    return Math.max(1, pageCount);

  } catch (primaryError) {
    console.warn('⚠️ [PDF] Falha no pdf-lib, tentando fallback por assinatura de bytes...');

    try {
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const pageCount = Math.max(1, countPdfPageObjectsFromBytes(bytes));

      console.log(`⚠️ [PDF] Fallback assinatura bytes: ${pageCount} páginas`);
      return pageCount;
    } catch (regexFallbackError) {
      console.warn('⚠️ [PDF] Falha no fallback de bytes, usando fallback por tamanho...');

      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          return 1;
        }

        const tamanhoBytes = fileInfo.size || 0;
        const BYTES_POR_PAGINA = 11350;
        const paginasEstimadas = Math.max(1, Math.round(tamanhoBytes / BYTES_POR_PAGINA));

        console.log(`⚠️ [PDF] Fallback tamanho: ${paginasEstimadas} páginas`);
        return paginasEstimadas;
      } catch (sizeFallbackError) {
        console.error('❌ [PDF] Todos os métodos de contagem falharam', {
          primaryError,
          regexFallbackError,
          sizeFallbackError,
        });
        return 1;
      }
    }
  }
}

/**
 * SOLUÇÃO DEFINITIVA: Conta páginas de Word por tamanho de arquivo
 * Método calibrado - FUNCIONA NO MOBILE
 * Calibração: 1.841KB = 15 páginas → 122.7KB por página
 */
export async function contarPaginasWord(uri: string): Promise<number> {
  console.log('📝 [WORD] Iniciando contagem de páginas:', uri);
  
  try {
    const pagesFromAppXml = await getDocxPagesFromAppXml(uri);
    if (pagesFromAppXml && pagesFromAppXml > 0) {
      console.log(`✅ [WORD] OpenXML docProps/app.xml: ${pagesFromAppXml} páginas`);
      return pagesFromAppXml;
    }

    const pagesFromContent = await estimateDocxPagesFromContent(uri);
    if (pagesFromContent && pagesFromContent > 0) {
      console.log(`✅ [WORD] Estimativa por conteúdo DOCX: ${pagesFromContent} páginas`);
      return pagesFromContent;
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    if (!fileInfo.exists) {
      console.error('❌ [WORD] Arquivo não encontrado');
      return 1;
    }
    
    const tamanhoBytes = fileInfo.size || 0;
    const tamanhoKB = (tamanhoBytes / 1024).toFixed(2);
    
    console.log(`� [WORD] Tamanho do arquivo: ${tamanhoBytes} bytes (${tamanhoKB}KB)`);
    
    // Heurística mais conservadora para reduzir falso 1 página em DOCX com pouco texto.
    const BYTES_POR_PAGINA = 48000;
    const paginasEstimadas = Math.max(1, Math.round(tamanhoBytes / BYTES_POR_PAGINA));
    
    console.log(`✅ [WORD] Páginas estimadas: ${paginasEstimadas}`);
    console.log(`📐 [WORD] Cálculo: ${tamanhoBytes} bytes ÷ ${BYTES_POR_PAGINA} = ${paginasEstimadas} páginas`);
    
    return paginasEstimadas;
    
  } catch (error) {
    console.error('❌ [WORD] Erro ao contar páginas:', error);
    return 1;
  }
}

/**
 * SOLUÇÃO DEFINITIVA: Conta páginas de PowerPoint por tamanho de arquivo
 * Método calibrado - FUNCIONA NO MOBILE
 * Calibração: ~200KB por slide (média com imagens)
 */
export async function contarPaginasPowerPoint(uri: string): Promise<number> {
  console.log('📊 [PPT] Iniciando contagem de slides:', uri);
  
  try {
    const slidesFromAppXml = await getPptxSlidesFromAppXml(uri);
    if (slidesFromAppXml && slidesFromAppXml > 0) {
      console.log(`✅ [PPT] OpenXML docProps/app.xml: ${slidesFromAppXml} slides`);
      return slidesFromAppXml;
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    if (!fileInfo.exists) {
      console.error('❌ [PPT] Arquivo não encontrado');
      return 1;
    }
    
    const tamanhoBytes = fileInfo.size || 0;
    const tamanhoKB = (tamanhoBytes / 1024).toFixed(2);
    
    console.log(`📊 [PPT] Tamanho do arquivo: ${tamanhoBytes} bytes (${tamanhoKB}KB)`);
    
    // CALIBRAÇÃO: ~200KB por slide (média)
    // Slides com muitas imagens: ~500KB
    // Slides simples: ~50KB
    // Média: 200KB
    const BYTES_POR_SLIDE = 204800; // 200KB
    const slidesEstimados = Math.max(1, Math.round(tamanhoBytes / BYTES_POR_SLIDE));
    
    console.log(`✅ [PPT] Slides estimados: ${slidesEstimados}`);
    console.log(`📐 [PPT] Cálculo: ${tamanhoBytes} bytes ÷ ${BYTES_POR_SLIDE} = ${slidesEstimados} slides`);
    
    return slidesEstimados;
    
  } catch (error) {
    console.error('❌ [PPT] Erro ao contar slides:', error);
    return 1;
  }
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
