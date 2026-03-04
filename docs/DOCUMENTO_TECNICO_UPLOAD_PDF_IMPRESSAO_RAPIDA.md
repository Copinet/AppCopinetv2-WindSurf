# Documento Técnico — Upload de PDF na tela de Impressão Rápida

## 1) Objetivo

Este documento descreve, em nível técnico e operacional, como o projeto implementa:

- Upload de arquivos na tela **Impressão Rápida**
- Detecção automática de quantidade de páginas
- Ajuste manual da quantidade de páginas detectadas
- Cálculo automático de subtotal por arquivo e total do pedido
- Atualização de preço em tempo real com base em:
  - número de páginas selecionadas
  - número de cópias
  - modo de impressão (P&B ou Colorido)

Também inclui um guia de replicação para que outro agente consiga reproduzir o mesmo comportamento em outro projeto.

---

## 2) Escopo técnico no código

### Frontend (Expo / React Native)

- Tela principal: `app/quick-print.tsx`
- Fonte da URL da API: `lib/query-client.ts`

### Backend (Express)

- Endpoint de contagem de páginas: `server/routes.ts`
- Configuração de CORS, bootstrap e servidor: `server/index.ts`

### Dependências-chave

- Seleção de arquivos:
  - `expo-document-picker`
  - `expo-image-picker`
  - `expo-file-system`
- Comunicação HTTP:
  - `expo/fetch`
- Parsing de documentos no servidor:
  - `pdf-lib` (PDF)
  - `adm-zip` (DOCX)
  - `multer` (upload multipart/form-data)

---

## 3) Modelo de dados usado na tela de Impressão Rápida

Na tela `app/quick-print.tsx`, cada arquivo selecionado é representado por:

```ts
interface PrintFile {
  id: string;
  uri: string;
  name: string;
  type: "pdf" | "image" | "word";
  mimeType: string;
  size: number;
  pageCount: number;
  colorMode: "pb" | "colorido";
  copies: number;
  paperType: "a4";
  pageRange: string;
  pagesToPrint: number;
  message: string;
  loading: boolean;
}
```

Pontos importantes:

- `pageCount`: total detectado do documento.
- `pageRange`: texto digitado pelo usuário (ex.: `1-3, 5, 8-10`).
- `pagesToPrint`: total efetivo que será cobrado/imprimido após interpretar `pageRange`.
- `loading`: indica que o arquivo ainda está em contagem de páginas.

---

## 4) Fluxo completo do upload até o preço final

## 4.1 Seleção de arquivo

1. Usuário toca em **PDF, Word ou Documento**.
2. `DocumentPicker.getDocumentAsync()` permite múltiplos arquivos.
3. Para cada arquivo:
   - o tipo é inferido (`pdf`, `word` ou `image`)
   - o estado inicial entra com `pageCount = 1`
   - `loading = true` para não-imagem
4. O arquivo aparece na lista imediatamente, mesmo antes da contagem terminar.

## 4.2 Contagem automática de páginas

1. Para arquivos não-imagem, o app chama `countPagesViaServer(uri, fileName)`.
2. O app envia `multipart/form-data` para `POST /api/count-pages`.
3. O backend identifica o tipo de arquivo por `mimetype` e extensão.
4. O backend retorna `pageCount`.
5. O frontend atualiza:
   - `pageCount`
   - `pagesToPrint = pageCount`
   - `loading = false`

## 4.3 Edição manual da contagem detectada

Após detectar páginas, a UI mostra:

- “X páginas detectadas. Corrija se necessário”
- Input numérico para correção manual

Ao editar:

- `handleUpdatePageCount` recalcula `pagesToPrint`
- Se houver `pageRange`, usa parser com base no novo total
- Se não houver `pageRange`, `pagesToPrint = pageCount`

## 4.4 Seleção de intervalo de páginas

O usuário pode inserir faixas como:

- `1-3`
- `2,5,9`
- `1-3, 5, 8-10`

A função `parsePagesToPrint`:

- aceita “todas” ou vazio => usa total do documento
- usa `Set<number>` para evitar contagem duplicada
- faz clamp dos limites para [1..totalPages]
- se entrada inválida total, usa fallback `totalPages`

## 4.5 Cálculo de preço

Preço por arquivo:

- P&B: `R$ 1,00` por página
- Colorido: `R$ 1,50` por página

Fórmula:

`subtotalArquivo = pagesToPrint * copies * pricePerPage`

Total do pedido:

- `totalPrice = soma(getFilePrice(file))`
- `totalPages = soma(file.pagesToPrint * file.copies)`

Ou seja, total de páginas exibido e preço final já consideram cópias.

---

## 5) Backend de contagem: regras por tipo de arquivo

Endpoint: `POST /api/count-pages` com `upload.single("file")`.

### PDF

1. Primeiro tenta `PDFDocument.load(buffer, { ignoreEncryption: true })`.
2. Se sucesso, usa `pdfDoc.getPageCount()`.
3. Se falha, usa fallback por regex no conteúdo:
   - busca ocorrências de `/Type /Page`
   - se nada encontrado => retorna 1

Motivo da solução:

- Aumenta robustez para PDFs com estruturas incomuns ou problemas de parsing.
- Mantém a experiência do usuário sem quebrar o fluxo.

### DOCX

1. Abre o arquivo com `AdmZip`.
2. Prioriza `docProps/app.xml` e extrai `<Pages>`.
3. Se não existir, analisa `word/document.xml`:
   - conta `<w:sectPr`
   - conta `<w:br w:type="page"`
4. Retorna no mínimo 1.

### DOC (legado)

- Usa heurística por tamanho:
  - `pageCount = max(1, round(sizeKB / 30))`

### Imagem

- `pageCount = 1`

### Limite de upload

- `multer` em memória com limite de **50 MB** por arquivo.

---

## 6) Soluções implementadas para o problema original

Aqui estão as soluções aplicadas no projeto para resolver upload + contagem + preço dinâmico:

1. **Contagem server-side em vez de client-side**
   - Evita dependência de parser pesado no app.
   - Garante consistência entre plataformas.

2. **Fallback em múltiplas camadas**
   - Frontend: se endpoint falhar, retorna 1 e segue o fluxo.
   - Backend PDF: fallback regex após tentativa com `pdf-lib`.
   - DOCX: fallback para análise de `document.xml`.

3. **UX assíncrona com estado de loading por arquivo**
   - Arquivo entra na lista imediatamente.
   - Usuário vê “Contando páginas...” por item, sem travar a tela.

4. **Correção manual da contagem detectada**
   - Mitiga inconsistências de arquivos malformados.
   - Recalcula automaticamente `pagesToPrint`.

5. **Parser de intervalos com deduplicação**
   - Evita cobrar página duplicada quando usuário repete números/faixas.

6. **Cálculo de preço acoplado ao estado efetivo**
   - Sempre usa `pagesToPrint`, `copies` e `colorMode`.
   - Atualização em tempo real no subtotal e total.

---

## 7) Contrato técnico do endpoint

## Request

- Método: `POST`
- URL: `/api/count-pages`
- Content-Type: `multipart/form-data`
- Campo de arquivo: `file`

## Response (200)

```json
{
  "pageCount": 12,
  "fileName": "exemplo.pdf",
  "fileSize": 345678,
  "mimeType": "application/pdf"
}
```

## Erros

- `400` se não houver arquivo
- `500` em erro interno de processamento

---

## 8) Configuração obrigatória para funcionar

A comunicação app -> API depende de `EXPO_PUBLIC_DOMAIN`.

No projeto atual:

- `getApiUrl()` monta `https://${EXPO_PUBLIC_DOMAIN}`
- `quick-print` cria URL final com `new URL("/api/count-pages", apiUrl)`

Sem `EXPO_PUBLIC_DOMAIN`, `getApiUrl()` lança erro.

Script de desenvolvimento já injeta variável:

- `npm run expo:dev` define `EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN:5000`

Também é necessário subir o servidor Express:

- `npm run server:dev`

---

## 9) Passo a passo para duplicar em outro projeto

## Passo 1 — Endpoint de contagem

Implementar backend com:

- `multer.memoryStorage()`
- limite de upload (ex.: 50MB)
- rota `POST /api/count-pages`
- lógica por tipo:
  - PDF via `pdf-lib` + fallback regex
  - DOCX via `adm-zip` lendo `docProps/app.xml`
  - DOC por heurística
  - imagem => 1

## Passo 2 — Cliente envia multipart/form-data

No app:

- montar `FormData()`
- anexar arquivo no campo `file`
- enviar para `/api/count-pages`
- retornar `pageCount` com fallback para 1 em caso de erro

## Passo 3 — Estado do arquivo no frontend

Manter por arquivo:

- `pageCount`
- `pagesToPrint`
- `pageRange`
- `copies`
- `colorMode`
- `loading`

## Passo 4 — Parser de intervalo

Implementar parser com:

- suporte a vírgulas e ranges
- validação de limites
- deduplicação com `Set`
- fallback para “todas”

## Passo 5 — Preço reativo

Aplicar fórmula:

- `pricePerPage = pb ? 1.0 : 1.5`
- `subtotal = pagesToPrint * copies * pricePerPage`
- `total = sum(subtotais)`

## Passo 6 — UX resiliente

Garantir:

- loading visual por arquivo
- campo para corrigir página detectada
- atualização instantânea de subtotal/total

---

## 10) Checklist de validação manual

1. Upload de PDF de múltiplas páginas.
2. Confirmar indicador “Contando páginas...”.
3. Confirmar total detectado correto.
4. Trocar para colorido e validar aumento de preço.
5. Aumentar cópias e validar total de páginas e valor.
6. Inserir range `1-3,5` e validar `pagesToPrint`.
7. Corrigir manualmente `pageCount` e validar recálculo.
8. Upload de imagem e confirmar `1` página.
9. Upload de DOCX e validar retorno >1 em documento multipágina.
10. Derrubar endpoint e confirmar fallback para `1` sem crash.

---

## 11) Limitações atuais e cuidados

- DOC (legado) usa estimativa por tamanho, não leitura real de páginas.
- PDFs muito fora do padrão podem cair no fallback e gerar contagem aproximada.
- O processamento usa memória (`multer.memoryStorage`), então arquivos grandes exigem cuidado operacional.
- O endpoint está aberto para a origem permitida por CORS; ajuste domínios conforme ambiente.

---

## 12) Referência rápida de arquivos

- `app/quick-print.tsx`  
  Fluxo de upload, estado dos arquivos, parser de range, cálculo de preço e UI de correção.

- `server/routes.ts`  
  Endpoint `/api/count-pages`, parsing por tipo e limites de upload.

- `lib/query-client.ts`  
  Resolução da base URL da API via `EXPO_PUBLIC_DOMAIN`.

- `server/index.ts`  
  CORS e inicialização do servidor HTTP.

- `package.json`  
  Scripts `expo:dev`, `server:dev`, `lint` e dependências usadas no fluxo.

---

## 13) Resultado prático da solução no projeto

Com a implementação atual, o sistema:

- recebe arquivos para impressão na tela de Impressão Rápida
- detecta páginas automaticamente no servidor
- permite correção manual quando necessário
- permite seleção de páginas específicas
- recalcula preço em tempo real conforme páginas/cópias/tipo de impressão
- mantém operação resiliente com fallback para evitar falha total do pedido

