// Utilitários para Upload e Contagem de Páginas via Supabase Edge Function
// Implementação conforme documento técnico de referência

import { supabase } from './supabase';
import {
  contarPaginasPDF,
  contarPaginasWord,
  contarPaginasPowerPoint,
} from './pdfUtils';

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

async function countPagesFallback(
  uri: string,
  fileName: string,
  mimeType?: string
): Promise<number> {
  try {
    const extension = getFileExtension(fileName);
    const lowerMimeType = (mimeType || '').toLowerCase();

    if (lowerMimeType.startsWith('image/')) {
      return 1;
    }

    if (extension === 'pdf' || lowerMimeType.includes('pdf')) {
      return await contarPaginasPDF(uri);
    }

    if (
      extension === 'doc' ||
      extension === 'docx' ||
      lowerMimeType.includes('word') ||
      lowerMimeType.includes('document')
    ) {
      return await contarPaginasWord(uri);
    }

    if (
      extension === 'ppt' ||
      extension === 'pptx' ||
      lowerMimeType.includes('powerpoint') ||
      lowerMimeType.includes('presentation')
    ) {
      return await contarPaginasPowerPoint(uri);
    }

    // Fallback genérico para tipo desconhecido
    return 1;
  } catch (fallbackError) {
    console.error('❌ [UPLOAD] Erro no fallback local de contagem:', fallbackError);
    return 1;
  }
}

/**
 * Envia arquivo para Edge Function de contagem de páginas
 * Retorna pageCount com fallback para 1 em caso de erro
 */
export async function countPagesViaServer(
  uri: string,
  fileName: string,
  mimeTypeHint?: string
): Promise<number> {
  let mimeType = mimeTypeHint || '';
  const extension = getFileExtension(fileName);
  const lowerMimeTypeHint = mimeType.toLowerCase();

  // PDFs grandes podem falhar no upload para Edge Function; contar localmente evita distorção.
  if (extension === 'pdf' || lowerMimeTypeHint.includes('pdf')) {
    console.log('📄 [UPLOAD] PDF detectado: usando contagem local precisa');
    return await contarPaginasPDF(uri);
  }

  async function invokeCountPages(formData: FormData): Promise<number | null> {
    const { data, error } = await supabase.functions.invoke('count-pages', {
      body: formData,
    });

    if (error) {
      return null;
    }

    const pageCountRaw = data?.pageCount;
    const pageCount = Number(pageCountRaw);

    if (!Number.isFinite(pageCount) || pageCount < 1) {
      return null;
    }

    return pageCount;
  }

  try {
    console.log('📤 [UPLOAD] Enviando arquivo para contagem:', fileName);

    // Ler arquivo como blob
    const response = await fetch(uri);
    const blob = await response.blob();
    mimeType = blob.type || '';

    // Criar FormData
    const formData = new FormData();
    formData.append('file', blob, fileName);

    console.log('🔄 [UPLOAD] Chamando Edge Function count-pages...');

    let pageCount = await invokeCountPages(formData);

    // Retry único para reduzir falso fallback em instabilidade de rede/server.
    if (pageCount === null) {
      console.warn('⚠️ [UPLOAD] Primeira tentativa falhou, tentando novamente...');
      await new Promise(resolve => setTimeout(resolve, 700));
      pageCount = await invokeCountPages(formData);
    }

    if (pageCount === null) {
      console.warn('⚠️ [UPLOAD] Edge Function indisponível após retry, usando fallback local');
      return await countPagesFallback(uri, fileName, mimeType);
    }

    const isOfficeDoc = extension === 'doc' || extension === 'docx' || extension === 'ppt' || extension === 'pptx';
    if (isOfficeDoc && pageCount <= 1) {
      const fallbackPages = await countPagesFallback(uri, fileName, mimeType);
      if (fallbackPages > pageCount) {
        console.warn(`⚠️ [UPLOAD] Ajuste Office aplicado (${fileName}): server=${pageCount}, fallback=${fallbackPages}`);
        pageCount = fallbackPages;
      }
    }

    console.log(`✅ [UPLOAD] Contagem recebida: ${pageCount} páginas`);

    return pageCount;

  } catch (error) {
    console.warn('⚠️ [UPLOAD] Falha no envio para Edge Function, usando fallback local');
    console.log('🔄 [UPLOAD] Aplicando fallback local após erro de upload...');
    return await countPagesFallback(uri, fileName, mimeType);
  }
}

/**
 * Parser de intervalos de páginas
 * Suporta: "1-3, 5, 8-10"
 * Conforme documento técnico (p. 3)
 */
export function parsePagesToPrint(
  pageRange: string,
  totalPages: number
): number {
  // Se vazio ou "todas", retorna total
  if (!pageRange || pageRange.trim() === '' || pageRange.toLowerCase() === 'todas') {
    return totalPages;
  }

  try {
    const pages = new Set<number>();
    const parts = pageRange.split(',').map(p => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        // Intervalo: 1-5
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end)) {
          console.warn('⚠️ [PARSER] Intervalo inválido:', part);
          continue;
        }

        // Clamp para limites válidos
        const clampedStart = Math.max(1, Math.min(start, totalPages));
        const clampedEnd = Math.max(1, Math.min(end, totalPages));

        for (let i = clampedStart; i <= clampedEnd; i++) {
          pages.add(i);
        }
      } else {
        // Página única: 5
        const page = parseInt(part, 10);

        if (isNaN(page)) {
          console.warn('⚠️ [PARSER] Página inválida:', part);
          continue;
        }

        // Clamp para limites válidos
        if (page >= 1 && page <= totalPages) {
          pages.add(page);
        }
      }
    }

    const pagesToPrint = pages.size > 0 ? pages.size : totalPages;
    console.log(`📊 [PARSER] "${pageRange}" → ${pagesToPrint} páginas`);

    return pagesToPrint;

  } catch (error) {
    console.error('❌ [PARSER] Erro ao processar intervalo:', error);
    return totalPages; // Fallback: todas as páginas
  }
}

/**
 * Valida intervalo de páginas
 * Retorna objeto com validação e mensagem de erro
 */
export function validatePageRange(
  pageRange: string,
  totalPages: number
): { valid: boolean; message?: string } {
  if (!pageRange || pageRange.trim() === '' || pageRange.toLowerCase() === 'todas') {
    return { valid: true };
  }

  try {
    const parts = pageRange.split(',').map(p => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end)) {
          return { valid: false, message: 'Formato inválido. Use: 1-3, 5, 8-10' };
        }

        if (start > end) {
          return { valid: false, message: 'Intervalo inválido: início maior que fim' };
        }

        if (start < 1 || end > totalPages) {
          return { valid: false, message: `Páginas devem estar entre 1 e ${totalPages}` };
        }
      } else {
        const page = parseInt(part, 10);

        if (isNaN(page)) {
          return { valid: false, message: 'Formato inválido. Use: 1-3, 5, 8-10' };
        }

        if (page < 1 || page > totalPages) {
          return { valid: false, message: `Páginas devem estar entre 1 e ${totalPages}` };
        }
      }
    }

    return { valid: true };

  } catch (error) {
    return { valid: false, message: 'Formato inválido. Use: 1-3, 5, 8-10' };
  }
}
