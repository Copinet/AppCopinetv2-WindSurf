import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system';

function parseNumericTag(xml: string, tagName: string): number | null {
  const match = xml.match(new RegExp(`<${tagName}>(\\d+)</${tagName}>`, 'i'));
  if (!match) {
    return null;
  }

  const value = Number.parseInt(match[1], 10);
  if (!Number.isFinite(value) || value < 1) {
    return null;
  }

  return value;
}

function normalizeText(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function loadZipFromUri(uri: string): Promise<JSZip> {
  if (uri.startsWith('file://') || uri.startsWith('/')) {
    // React Native: fetch() não lê file:// de forma confiável no Android.
    // Usa expo-file-system em Base64 para garantir leitura correta.
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return JSZip.loadAsync(base64, { base64: true });
    } catch (fsError) {
      console.warn('⚠️ [OPENXML] FileSystem falhou, tentando fetch...', fsError);
    }
  }
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
}

export async function getDocxPagesFromAppXml(uri: string): Promise<number | null> {
  try {
    const zip = await loadZipFromUri(uri);
    const appXml = await zip.file('docProps/app.xml')?.async('string');
    if (!appXml) {
      return null;
    }

    return parseNumericTag(appXml, 'Pages');
  } catch (error) {
    console.warn('⚠️ [OPENXML] Falha ao ler Pages de docProps/app.xml:', error);
    return null;
  }
}

export async function estimateDocxPagesFromContent(uri: string): Promise<number | null> {
  try {
    const text = await getDocxTextPreview(uri, 12000);
    if (!text) return null;
    return Math.max(1, Math.ceil(text.length / 1800));
  } catch {
    return null;
  }
}

export async function getPdfTextPreview(uri: string, maxChars = 900): Promise<string | null> {
  try {
    const text = await (await fetch(uri)).text();
    const cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .trim();

    if (!cleaned) {
      return null;
    }

    return cleaned.length > maxChars ? `${cleaned.slice(0, maxChars)}...` : cleaned;
  } catch (error) {
    console.warn('⚠️ [OPENXML] Falha ao extrair preview de PDF:', error);
    return null;
  }
}

export async function getPptxSlidesFromAppXml(uri: string): Promise<number | null> {
  try {
    const zip = await loadZipFromUri(uri);
    const appXml = await zip.file('docProps/app.xml')?.async('string');
    if (!appXml) {
      return null;
    }

    return parseNumericTag(appXml, 'Slides');
  } catch (error) {
    console.warn('⚠️ [OPENXML] Falha ao ler Slides de docProps/app.xml:', error);
    return null;
  }
}

export async function getDocxTextPreview(uri: string, maxChars = 1100): Promise<string | null> {
  try {
    const zip = await loadZipFromUri(uri);
    const documentXml = await zip.file('word/document.xml')?.async('string');
    if (!documentXml) {
      return null;
    }

    const text = normalizeText(documentXml);
    if (!text) {
      return null;
    }

    return text.length > maxChars ? `${text.slice(0, maxChars)}...` : text;
  } catch (error) {
    console.warn('⚠️ [OPENXML] Falha ao extrair preview de DOCX:', error);
    return null;
  }
}

export async function getPptxTextPreview(uri: string, maxChars = 1100): Promise<string | null> {
  try {
    const zip = await loadZipFromUri(uri);
    const slideNames = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const aNum = Number.parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
        const bNum = Number.parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
        return aNum - bNum;
      });

    if (slideNames.length === 0) {
      return null;
    }

    const previewParts: string[] = [];

    for (const slideName of slideNames) {
      const slideXml = await zip.file(slideName)?.async('string');
      if (!slideXml) {
        continue;
      }

      const textMatches = [...slideXml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/gi)];
      const line = textMatches
        .map((match) => match[1])
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (line) {
        previewParts.push(line);
      }

      const current = previewParts.join('\n\n');
      if (current.length >= maxChars) {
        break;
      }
    }

    const preview = previewParts.join('\n\n').trim();
    if (!preview) {
      return null;
    }

    return preview.length > maxChars ? `${preview.slice(0, maxChars)}...` : preview;
  } catch (error) {
    console.warn('⚠️ [OPENXML] Falha ao extrair preview de PPTX:', error);
    return null;
  }
}
