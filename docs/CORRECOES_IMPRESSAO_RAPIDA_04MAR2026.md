# Correcoes Impressao Rapida e Pedidos - 04/03/2026

## Objetivo
Consolidar as correcoes funcionais e de UX do fluxo de Impressao Rapida sem alterar a identidade visual, incluindo contagem de paginas, desconto por volume, progresso de pedidos e roteiro de validacao mobile.

---

## 1) Contagem de paginas (PDF, Word, PowerPoint)

### 1.1 PDF (app)
Arquivo: `lib/pdfUtils.ts`

Implementacao em camadas para reduzir falso "1 pagina":
1. Leitura real com `pdf-lib`.
2. Fallback por assinatura de bytes (`/Type /Page`, ignorando `/Pages`).
3. Fallback por tamanho de arquivo (estimativa calibrada).

Beneficio:
- PDFs grandes no mobile deixam de depender de regex/text decoder e passam a contar com estrategia robusta em bytes.

### 1.2 Word/PPT (Edge Function)
Arquivo: `supabase/functions/count-pages/index.ts`

#### DOCX
- Le metadados de `docProps/app.xml` (`<Pages>`, `<Words>`).
- Analisa `word/document.xml` para:
  - `w:lastRenderedPageBreak`
  - `w:br w:type="page"`
  - Heuristica por volume de palavras.
- Usa maior valor confiavel entre metadados, quebras e palavras.

#### PPTX
- Le metadado de slides em `docProps/app.xml` (`<Slides>`).
- Fallback para contagem de `ppt/slides/slideX.xml`.
- Se necessario, fallback por tamanho para legados (`.ppt`).

### 1.3 Protecao anti-subcontagem Office no app
Arquivo: `lib/uploadUtils.ts`

Ajuste adicional implementado:
- Mesmo com retorno da Edge Function, se arquivo Office (`doc/docx/ppt/pptx`) vier com `pageCount <= 1`, o app valida com fallback local.
- Se fallback local retornar valor maior, ele substitui o valor do servidor.

Resultado esperado:
- Reduz casos de Word/PPT aparecendo incorretamente como 1 pagina por falha intermitente ou retorno subestimado.

---

## 2) UX de preco/desconto (sem quebrar design)

Arquivo: `app/impressao-rapida.tsx`

Implementado no bloco de resumo:
- Card "Vantagem por volume" exibindo:
  - preco base por pagina (PB e Colorido)
  - preco aplicado por volume
  - quantidade de paginas por modo
  - total sem volume x com volume
  - economia total do pedido

Tambem mantido:
- configuracao inicial de documentos com `colorido: true` e papel `comum` por padrao.

---

## 3) Parceiros: distancia e raio

Arquivo: `components/MapaParceiros.tsx`

Implementacoes ja integradas:
- raio configuravel ate 30 km
- uso de geolocalizacao real como origem
- fallback local para distancia quando RPC nao retornar
- texto de distancia/tempo mais claro no card
- URL de rota com origem atual e modo de deslocamento

---

## 4) Preview de documento

Arquivo: `components/PreviewDocumento.tsx`

Ajuste:
- botao de preview passou a abrir o arquivo real em app externo (Linking), em vez de apenas alerta.

---

## 5) Tela de pedidos com andamento real

Arquivo: `app/(tabs)/orders.tsx`

Implementado:
- mapeamento visual de status com label, cor e icone
- calculo de progresso por fluxo de status (`STATUS_FLOW`)
- tratamento especial para pedido pago ainda em `aguardando_pagamento`
- card de pedido com barra de progresso (%) + etapa atual
- selo visual de pagamento aprovado
- toque no card navega para detalhes do pedido (`/pedido/detalhes?id=...`)

Objetivo atendido:
- cliente passa a enxergar andamento do pedido pago/aceito de forma clara e acionavel.

---

## 6) Arquivos alterados nesta rodada

- `app/impressao-rapida.tsx`
- `lib/uploadUtils.ts`
- `app/(tabs)/orders.tsx`

(Outras melhorias relacionadas ja estavam aplicadas em rodada anterior: `lib/pdfUtils.ts`, `supabase/functions/count-pages/index.ts`, `components/MapaParceiros.tsx`, `components/PreviewDocumento.tsx`.)

---

## 7) Checklist de validacao funcional (mobile)

### Impressao Rapida
- [ ] Enviar PDF grande e confirmar pagina total correta.
- [ ] Enviar DOCX multi-pagina e confirmar que nao cai em 1 pagina incorretamente.
- [ ] Enviar PPTX com varios slides e validar contagem.
- [ ] Alterar intervalo de paginas e confirmar recalc de total.
- [ ] Confirmar defaults: colorido + papel comum.
- [ ] Conferir card de "Vantagem por volume" e economia.

### Parceiros
- [ ] Ajustar raio para 5/10/20/30 km e validar lista.
- [ ] Confirmar exibicao de distancia (km) e tempo estimado.
- [ ] Abrir rota e validar origem/destino corretos.

### Pedidos
- [ ] Criar pedido e pagar.
- [ ] Verificar card na aba Pedidos com barra de progresso e percentual.
- [ ] Confirmar selo "PAGO" quando pagamento aprovado.
- [ ] Abrir detalhes do pedido tocando no card.

---

## 8) Reinicio recomendado para teste limpo

Antes da rodada final de teste no celular:
1. Encerrar processos Expo antigos na 8081.
2. Subir Expo com cache limpo.
3. Testar via QR HTML (`qrcode-expo.html`) na mesma rede local.

Comando sugerido:
- `npx expo start --port 8081 --lan --clear`

---

## 9) Notas para proximos agentes

- Priorizar correcoes de causa-raiz em contagem (evitar apenas forcar `1`).
- Sempre preservar visual base da tela; ajustes devem ser incrementais.
- Em instabilidade de rede/Edge Function, manter fallback local silencioso e confiavel.
- Ao concluir lote de correcoes, reiniciar Expo com cache limpo antes de validar no celular.
