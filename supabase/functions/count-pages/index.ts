// Supabase Edge Function - Contagem de Páginas PDF/Word
// Implementação server-side conforme documento técnico de referência

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PDFDocument } from "npm:pdf-lib@1.17.1"
import JSZip from "npm:jszip@3.10.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📄 [COUNT-PAGES] Iniciando contagem de páginas')

    // Parse multipart/form-data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('❌ [COUNT-PAGES] Nenhum arquivo enviado')
      return new Response(
        JSON.stringify({ error: 'Nenhum arquivo enviado' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`📊 [COUNT-PAGES] Arquivo recebido: ${file.name} (${file.size} bytes)`)

    // Ler arquivo como ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    let pageCount = 1
    const mimeType = file.type
    const fileName = file.name
    const fileSize = file.size

    // Detectar tipo de arquivo
    if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      console.log('📄 [PDF] Processando PDF...')
      pageCount = await countPdfPages(uint8Array)
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.toLowerCase().endsWith('.docx')
    ) {
      console.log('📝 [WORD] Processando Word...')
      pageCount = await countWordPages(uint8Array, fileSize)
    } else if (
      mimeType === 'application/msword' ||
      fileName.toLowerCase().endsWith('.doc')
    ) {
      console.log('📝 [WORD] DOC legado detectado, usando fallback por tamanho...')
      pageCount = countLegacyWordPages(fileSize)
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileName.toLowerCase().endsWith('.pptx')
    ) {
      console.log('📊 [PPT] Processando PowerPoint...')
      pageCount = await countPowerPointPages(uint8Array, fileSize)
    } else if (
      mimeType === 'application/vnd.ms-powerpoint' ||
      fileName.toLowerCase().endsWith('.ppt')
    ) {
      console.log('📊 [PPT] PPT legado detectado, usando fallback por tamanho...')
      pageCount = countLegacyPowerPointPages(fileSize)
    } else if (mimeType.startsWith('image/')) {
      console.log('🖼️ [IMAGE] Arquivo de imagem')
      pageCount = 1
    } else {
      console.log('❓ [UNKNOWN] Tipo de arquivo desconhecido, usando estimativa')
      pageCount = Math.max(1, Math.round(fileSize / 50000)) // Fallback genérico
    }

    console.log(`✅ [COUNT-PAGES] Contagem concluída: ${pageCount} páginas`)

    return new Response(
      JSON.stringify({
        pageCount,
        fileName,
        fileSize,
        mimeType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ [COUNT-PAGES] Erro:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        pageCount: 1 // Fallback para evitar quebra do fluxo
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * SOLUÇÃO ROBUSTA: Conta páginas de PDF com fallback
 * Conforme documento técnico (p. 3)
 */
async function countPdfPages(uint8Array: Uint8Array): Promise<number> {
  try {
    // Tentativa 1: Usar pdf-lib (método principal)
    console.log('🔄 [PDF] Tentando pdf-lib...')
    const pdfDoc = await PDFDocument.load(uint8Array, { 
      ignoreEncryption: true,
      updateMetadata: false
    })
    const pageCount = pdfDoc.getPageCount()
    console.log(`✅ [PDF] pdf-lib sucesso: ${pageCount} páginas`)
    return pageCount

  } catch (error) {
    console.warn('⚠️ [PDF] pdf-lib falhou, usando fallback regex:', error.message)
    
    // Tentativa 2: Fallback com regex (para PDFs malformados)
    try {
      const text = new TextDecoder('latin1').decode(uint8Array)
      const matches = text.match(/\/Type\s*\/Page[^s]/g)
      const pageCount = matches ? matches.length : 1
      console.log(`✅ [PDF] Fallback regex: ${pageCount} páginas`)
      return Math.max(1, pageCount)

    } catch (fallbackError) {
      console.error('❌ [PDF] Fallback falhou:', fallbackError.message)
      
      // Tentativa 3: Estimativa por tamanho (último recurso)
      const estimatedPages = Math.max(1, Math.round(uint8Array.length / 11350))
      console.log(`⚠️ [PDF] Usando estimativa por tamanho: ${estimatedPages} páginas`)
      return estimatedPages
    }
  }
}

/**
 * SOLUÇÃO WORD: Análise de estrutura DOCX
 * Conforme documento técnico (p. 3)
 */
async function countWordPages(uint8Array: Uint8Array, fileSize: number): Promise<number> {
  try {
    // DOCX é ZIP. Primeiro tentar metadado real de páginas em docProps/app.xml.
    const zip = await JSZip.loadAsync(uint8Array)
    const appXml = await zip.file('docProps/app.xml')?.async('string')
    let wordsFromMetadata = 0
    let pagesFromMetadata = 0

    if (appXml) {
      const pagesMatch = appXml.match(/<Pages>(\d+)<\/Pages>/i)
      if (pagesMatch) {
        const pages = parseInt(pagesMatch[1], 10)
        if (!Number.isNaN(pages) && pages > 0) {
          pagesFromMetadata = pages
        }
      }

      const wordsMatch = appXml.match(/<Words>(\d+)<\/Words>/i)
      if (wordsMatch) {
        const words = parseInt(wordsMatch[1], 10)
        if (!Number.isNaN(words) && words > 0) {
          wordsFromMetadata = words
        }
      }

      if (pagesFromMetadata > 0) {
        console.log(`✅ [WORD] DOCX por app.xml: ${pagesFromMetadata} páginas`)
        return pagesFromMetadata
      }
    }

    // Fallback 1: Ler word/document.xml e inferir por quebras de página renderizadas.
    const documentXml = await zip.file('word/document.xml')?.async('string')

    if (documentXml) {
      const renderedBreaks = (documentXml.match(/<w:lastRenderedPageBreak\b/g) || []).length
      const manualPageBreaks = (documentXml.match(/<w:br\b[^>]*w:type=["']page["'][^>]*>/g) || []).length
      const pageByBreaks = Math.max(1, renderedBreaks + manualPageBreaks + 1)

      const sections = (documentXml.match(/<w:sectPr\b/g) || []).length
      const pageBySections = Math.max(1, sections)

      const paragraphs = (documentXml.match(/<w:p\b/g) || []).length
      const pageByParagraphs = paragraphs > 0 ? Math.max(1, Math.round(paragraphs / 12)) : 1

      const textoSemTags = documentXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const wordsFromContent = textoSemTags ? textoSemTags.split(' ').length : 0
      const baseWords = Math.max(wordsFromMetadata, wordsFromContent)
      const pageByWords = baseWords > 0 ? Math.max(1, Math.round(baseWords / 250)) : 1

      const pageBySize = Math.max(1, Math.round(fileSize / 48000))

      const pageCount = Math.max(
        pagesFromMetadata,
        pageByBreaks,
        pageBySections,
        pageByParagraphs,
        pageByWords,
        pageBySize,
      )

      console.log(
        `✅ [WORD] DOCX por XML: ${pageCount} páginas (breaks=${pageByBreaks}, sections=${pageBySections}, paragraphs=${paragraphs}, words=${baseWords}, size=${fileSize})`,
      )
      return pageCount
    }

    if (pagesFromMetadata > 0) {
      const pageByWords = wordsFromMetadata > 0 ? Math.max(1, Math.round(wordsFromMetadata / 250)) : 1
      const pageBySize = Math.max(1, Math.round(fileSize / 48000))
      const pageCount = Math.max(pagesFromMetadata, pageByWords, pageBySize)
      console.log(`✅ [WORD] DOCX por metadados: ${pageCount} páginas`)
      return pageCount
    }

    console.warn('⚠️ [WORD] word/document.xml não encontrado, usando fallback')
    return countLegacyWordPages(fileSize)

  } catch (error) {
    console.error('❌ [WORD] Erro:', error.message)
    return countLegacyWordPages(fileSize)
  }
}

/**
 * SOLUÇÃO POWERPOINT: contagem de slides via ZIP (PPTX)
 */
async function countPowerPointPages(uint8Array: Uint8Array, fileSize: number): Promise<number> {
  try {
    // PPTX é ZIP. Primeiro tentar metadado de total de slides em docProps/app.xml.
    const zip = await JSZip.loadAsync(uint8Array)

    const appXml = await zip.file('docProps/app.xml')?.async('string')
    if (appXml) {
      const slidesMatch = appXml.match(/<Slides>(\d+)<\/Slides>/i)
      if (slidesMatch) {
        const slides = parseInt(slidesMatch[1], 10)
        if (!Number.isNaN(slides) && slides > 0) {
          console.log(`✅ [PPT] PPTX por app.xml: ${slides} slides`)
          return slides
        }
      }
    }

    // Fallback 1: contar arquivos ppt/slides/slideX.xml.
    const slideFiles = Object.keys(zip.files).filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    if (slideFiles.length > 0) {
      console.log(`✅ [PPT] PPTX por XML: ${slideFiles.length} slides`)
      return slideFiles.length
    }

    console.warn('⚠️ [PPT] Nenhum slide XML encontrado, usando fallback')
    return countLegacyPowerPointPages(fileSize)

  } catch (error) {
    console.error('❌ [PPT] Erro:', error.message)
    return countLegacyPowerPointPages(fileSize)
  }
}

function countLegacyWordPages(fileSize: number): number {
  // Fallback para DOC legado / DOCX inválido (estimativa calibrada)
  const BYTES_POR_PAGINA = 125610
  return Math.max(1, Math.round(fileSize / BYTES_POR_PAGINA))
}

function countLegacyPowerPointPages(fileSize: number): number {
  // Fallback para PPT legado / PPTX inválido (estimativa calibrada)
  const BYTES_POR_SLIDE = 204800
  return Math.max(1, Math.round(fileSize / BYTES_POR_SLIDE))
}
