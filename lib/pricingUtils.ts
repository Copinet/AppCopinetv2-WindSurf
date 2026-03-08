// Utilitários para Cálculo de Preço com Desconto Progressivo
// Implementação conforme prompt mestre

import { supabase } from './supabase';

interface PrecoPorFaixa {
  tipo_impressao: 'pb' | 'colorido';
  paginas_min: number;
  paginas_max: number | null;
  preco_por_pagina: number;
}

export interface RegraDescontoVolume {
  ativo: boolean;
  minPaginas: number | null;
}

// Cache de preços para evitar múltiplas consultas
let precosCache: PrecoPorFaixa[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Busca tabela de preços do Supabase com cache
 */
async function fetchPrecos(): Promise<PrecoPorFaixa[]> {
  const now = Date.now();
  
  // Retornar cache se ainda válido
  if (precosCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return precosCache;
  }

  try {
    const { data, error } = await supabase
      .from('precos_impressao')
      .select('tipo_impressao, paginas_min, paginas_max, preco_por_pagina')
      .eq('ativo', true)
      .order('tipo_impressao')
      .order('paginas_min');

    if (error) {
      console.error('❌ [PRICING] Erro ao buscar preços:', error);
      return getPrecosDefault();
    }

    precosCache = data as PrecoPorFaixa[];
    cacheTimestamp = now;
    
    console.log('✅ [PRICING] Preços carregados do Supabase:', precosCache.length);
    return precosCache;

  } catch (error) {
    console.error('❌ [PRICING] Erro ao buscar preços:', error);
    return getPrecosDefault();
  }
}

/**
 * Preços padrão (fallback se banco falhar)
 */
function getPrecosDefault(): PrecoPorFaixa[] {
  return [
    // P&B
    { tipo_impressao: 'pb', paginas_min: 1, paginas_max: 20, preco_por_pagina: 1.00 },
    { tipo_impressao: 'pb', paginas_min: 21, paginas_max: 40, preco_por_pagina: 0.90 },
    { tipo_impressao: 'pb', paginas_min: 41, paginas_max: 60, preco_por_pagina: 0.70 },
    { tipo_impressao: 'pb', paginas_min: 61, paginas_max: null, preco_por_pagina: 0.60 },
    // Colorido
    { tipo_impressao: 'colorido', paginas_min: 1, paginas_max: 20, preco_por_pagina: 1.50 },
    { tipo_impressao: 'colorido', paginas_min: 21, paginas_max: 40, preco_por_pagina: 1.20 },
    { tipo_impressao: 'colorido', paginas_min: 41, paginas_max: 60, preco_por_pagina: 1.00 },
    { tipo_impressao: 'colorido', paginas_min: 61, paginas_max: null, preco_por_pagina: 0.90 },
  ];
}

/**
 * Obtém preço por página baseado na quantidade total
 * Conforme prompt mestre: desconto progressivo
 */
export async function getPrecoPorPagina(
  tipoImpressao: 'pb' | 'colorido',
  totalPaginas: number
): Promise<number> {
  const precos = await fetchPrecos();
  
  // Filtrar por tipo e encontrar faixa correta
  const faixa = precos
    .filter(p => p.tipo_impressao === tipoImpressao)
    .find(p => {
      const dentroMin = totalPaginas >= p.paginas_min;
      const dentroMax = p.paginas_max === null || totalPaginas <= p.paginas_max;
      return dentroMin && dentroMax;
    });

  if (faixa) {
    console.log(`💰 [PRICING] ${tipoImpressao} - ${totalPaginas} páginas → R$ ${faixa.preco_por_pagina}/pág`);
    return faixa.preco_por_pagina;
  }

  // Fallback
  const precoFallback = tipoImpressao === 'pb' ? 1.00 : 1.50;
  console.warn(`⚠️ [PRICING] Faixa não encontrada, usando fallback: R$ ${precoFallback}`);
  return precoFallback;
}

/**
 * Calcula preço total de um arquivo
 * Fórmula: pagesToPrint * copies * precoPorPagina
 */
export async function calcularPrecoArquivo(
  pagesToPrint: number,
  copies: number,
  colorMode: 'pb' | 'colorido'
): Promise<number> {
  const totalPaginas = pagesToPrint * copies;
  const precoPorPagina = await getPrecoPorPagina(colorMode, totalPaginas);
  const precoTotal = totalPaginas * precoPorPagina;

  console.log(`📊 [PRICING] ${pagesToPrint} pág × ${copies} cópias × R$ ${precoPorPagina} = R$ ${precoTotal.toFixed(2)}`);
  
  return precoTotal;
}

/**
 * Calcula preço total de múltiplos arquivos
 */
export async function calcularPrecoTotal(
  arquivos: Array<{
    pagesToPrint: number;
    copies: number;
    colorMode: 'pb' | 'colorido';
  }>
): Promise<{ total: number; totalPaginas: number }> {
  let totalPaginas = 0;

  // Regra de volume: aplicar faixa pelo volume total do pedido por tipo de impressão.
  // Ex.: 3 arquivos coloridos de 10 páginas cada => 30 páginas coloridas (faixa 21-40).
  const totalPaginasPorTipo: Record<'pb' | 'colorido', number> = {
    pb: 0,
    colorido: 0,
  };

  for (const arquivo of arquivos) {
    const paginasArquivo = arquivo.pagesToPrint * arquivo.copies;
    totalPaginasPorTipo[arquivo.colorMode] += paginasArquivo;
    totalPaginas += paginasArquivo;
  }

  let total = 0;

  for (const tipo of ['pb', 'colorido'] as const) {
    const paginasTipo = totalPaginasPorTipo[tipo];
    if (paginasTipo <= 0) continue;

    const precoPorPagina = await getPrecoPorPagina(tipo, paginasTipo);
    total += paginasTipo * precoPorPagina;
  }

  console.log(`💵 [PRICING] Total: ${totalPaginas} páginas → R$ ${total.toFixed(2)}`);
  
  return { total, totalPaginas };
}

/**
 * Invalida cache de preços (chamar quando admin atualizar tabela)
 */
export function invalidarCachePrecos(): void {
  precosCache = null;
  cacheTimestamp = 0;
  console.log('🔄 [PRICING] Cache de preços invalidado');
}

/**
 * Obtém tabela de preços formatada para exibição
 */
export async function getTabelaPrecos(): Promise<{
  pb: Array<{ faixa: string; preco: string }>;
  colorido: Array<{ faixa: string; preco: string }>;
}> {
  const precos = await fetchPrecos();
  
  const formatarFaixa = (min: number, max: number | null): string => {
    if (max === null) {
      return `Acima de ${min} páginas`;
    }
    if (min === max) {
      return `${min} página${min > 1 ? 's' : ''}`;
    }
    return `${min} a ${max} páginas`;
  };

  const pb = precos
    .filter(p => p.tipo_impressao === 'pb')
    .map(p => ({
      faixa: formatarFaixa(p.paginas_min, p.paginas_max),
      preco: `R$ ${p.preco_por_pagina.toFixed(2)}/pág`
    }));

  const colorido = precos
    .filter(p => p.tipo_impressao === 'colorido')
    .map(p => ({
      faixa: formatarFaixa(p.paginas_min, p.paginas_max),
      preco: `R$ ${p.preco_por_pagina.toFixed(2)}/pág`
    }));

  return { pb, colorido };
}

/**
 * Descobre o menor volume (dinâmico no painel admin) em que o desconto começa a valer.
 */
export async function getRegraDescontoVolume(): Promise<RegraDescontoVolume> {
  const precos = await fetchPrecos();

  let minPaginas: number | null = null;

  for (const tipo of ['pb', 'colorido'] as const) {
    const faixas = precos
      .filter((p) => p.tipo_impressao === tipo)
      .sort((a, b) => a.paginas_min - b.paginas_min);

    if (faixas.length === 0) {
      continue;
    }

    const precoBase = faixas[0].preco_por_pagina;
    const faixaComDesconto = faixas.find((f) => f.preco_por_pagina < precoBase);

    if (!faixaComDesconto) {
      continue;
    }

    minPaginas = minPaginas === null
      ? faixaComDesconto.paginas_min
      : Math.min(minPaginas, faixaComDesconto.paginas_min);
  }

  return {
    ativo: minPaginas !== null,
    minPaginas,
  };
}
