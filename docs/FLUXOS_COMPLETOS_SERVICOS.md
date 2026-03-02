# 📋 FLUXOS COMPLETOS DE SERVIÇOS - COPINET

**Documento de Referência para Implementação**  
**Data:** 27/02/2026  
**Versão:** 1.0

---

## 🎯 ÍNDICE

1. [Fluxo "Fazemos pra Você"](#fluxo-fazemos-pra-você)
2. [Fluxo "Cliente Faz Sozinho"](#fluxo-cliente-faz-sozinho)
3. [Fluxo Impressão Rápida](#fluxo-impressão-rápida)
4. [Fluxo Impressão de Fotos](#fluxo-impressão-de-fotos)
5. [Fluxo Foto 3x4](#fluxo-foto-3x4)
6. [Fluxo Escaneamento para PDF](#fluxo-escaneamento-para-pdf)
7. [Fluxo Envio de Email Simples](#fluxo-envio-de-email-simples)
8. [Sistema de Parceiros e Impressão](#sistema-de-parceiros-e-impressão)

---

## 📌 FLUXO "FAZEMOS PRA VOCÊ"

**Aplicável a:** Certidões, Inscrições, MEI, INSS, Detran, etc.

### **Etapas do Fluxo:**

#### 1. **Coleta de Dados**
- Coletar dados necessários para o serviço específico
- Exemplos: CPF, RG, data nascimento, edital/link
- Dados variam por serviço (ver projeto_completo.txt)

#### 2. **Escolha de Modalidade**
- Cliente escolhe: **"Só PDF"** ou **"PDF + Impressão"**

#### 3. **Verificação de Parceiros (Silenciosa)**
- **SE** cliente escolher "PDF + Impressão":
  - App verifica (em background) se há parceiros impressores disponíveis
  - Considera: horário de funcionamento, final de semana, parceiros online
  - **SE NÃO** houver parceiros disponíveis:
    - Mostrar: "Impressão não disponível no momento"
    - Desabilitar opção de impressão
  - **OPCIONAL:** Desabilitar impressão se geolocalização não detectar parceiros próximos

#### 4. **Tela de Pagamento**
- Mostrar resumo com:
  - Preço para "Só PDF" OU
  - Preço para "PDF + Impressão"
- Método: PIX

#### 5. **Após Pagamento Confirmado**
- Criar pedido no sistema
- Direcionar para parceiros cadastrados naquele serviço

#### 6. **Parceiro Aceita e Emite**
- Parceiro aceita via dashboard
- Emite documento no site oficial
- Faz upload do PDF/comprovante no app

#### 7. **Notificação ao Cliente**
- Notificar: **"PDF pronto! Disponível por 3 dias para baixar ou compartilhar"**

#### 8. **SE Impressão Foi Escolhida:**

##### 8.1. Mostrar Mapa de Parceiros
- Raio: 5 a 15 km (geolocalização)
- Cliente seleciona um parceiro
- Mostrar tela de espera:
  ```
  "Aguardando aceite da impressão...
  Tempo estimado: 5 min.
  Você será notificado quando aceito."
  ```

##### 8.2. Timeout ou Recusa (5 min)
- **SE** parceiro recusa OU não responde em 5 min:
  - Atualizar mapa (remover parceiro que recusou/não respondeu)
  - Mostrar: "Desculpe pelo inconveniente, escolha outro parceiro para retirar sua impressão"
  - Reenviar para novo parceiro selecionado

##### 8.3. Nenhum Parceiro Responde
- **SE** nenhum parceiro no raio de 5-15km responder:
  - Notificar: "Impressão não está disponível no momento"
  - Oferecer: Só PDF emitido
  - **Devolução automática** do valor da impressão pago

##### 8.4. Impressão Aceita
- Gerar QR Code automático com:
  - Número do pedido
  - Horário estimado de pronto (considerando fila do parceiro)
  - Nome/endereço do parceiro

#### 9. **Tela de Sucesso Final**
- PDF liberado para download
- QR Code (se impressão)
- Botão "Baixar/Compartilhar PDF"

#### 10. **Ranking de Parceiros**
- Registrar aceitações/recusas
- Penalizar recusa frequente

#### 11. **Observação Importante**
- **SE** não houver parceiro online (finais de semana, fora do horário):
  - Mostrar: "Impressão indisponível no momento, nenhum parceiro disponível"

---

## 📌 FLUXO "CLIENTE FAZ SOZINHO"

**Aplicável a:** Currículos, Contratos, Trabalhos Escolares, Declarações, etc.

### **Etapas do Fluxo:**

#### 1. **Incentivo com Desconto**
- Mostrar: **Desconto de 20%** no preço base
- Exibir: Preço normal ~~R$ X,XX~~ → Preço com desconto **R$ Y,YY**

#### 2. **Coleta de Dados**
- Coletar dados necessários para o serviço específico
- Exemplos:
  - Currículos: experiências, formação, habilidades
  - Contratos: dados das partes, valores, prazos
- Dados variam por serviço (ver projeto_completo.txt)

#### 3. **Escolha de Modalidade**
- Cliente escolhe: **"Só PDF"** ou **"PDF + Impressão"**

#### 4. **Verificação de Parceiros (Silenciosa)**
- **SE** cliente escolher "PDF + Impressão":
  - App verifica (em background) se há parceiros impressores disponíveis
  - Considera: horário de funcionamento, final de semana, parceiros online
  - **SE NÃO** houver parceiros disponíveis:
    - Mostrar: "Impressão não disponível no momento"
    - Desabilitar opção de impressão
  - **OPCIONAL:** Desabilitar impressão se geolocalização não detectar parceiros próximos

#### 5. **Tela de Pagamento**
- Mostrar resumo com:
  - Preço para "Só PDF" (com desconto 20%) OU
  - Preço para "PDF + Impressão" (com desconto 20%)
- Método: PIX

#### 6. **Após Pagamento Confirmado**
- **Gerar PDF imediatamente no app** (sem parceiro)
- Notificar: **"PDF pronto! Disponível por 3 dias para baixar ou compartilhar"**

#### 7. **SE Impressão Foi Escolhida:**

##### 7.1. Mostrar Mapa de Parceiros
- Raio: 5 a 15 km (geolocalização)
- Cliente seleciona um parceiro
- Mostrar tela de espera:
  ```
  "Aguardando aceite da impressão...
  Tempo estimado: 5 min.
  Você será notificado quando aceito."
  ```

##### 7.2. Timeout ou Recusa (5 min)
- **SE** parceiro recusa OU não responde em 5 min:
  - Atualizar mapa (remover parceiro que recusou/não respondeu)
  - Mostrar: "Desculpe pelo inconveniente, escolha outro parceiro para retirar sua impressão"
  - Reenviar para novo parceiro selecionado

##### 7.3. Nenhum Parceiro Responde
- **SE** nenhum parceiro no raio de 5-15km responder:
  - Notificar: "Impressão não está disponível no momento"
  - Oferecer: Só PDF emitido
  - **Devolução automática** do valor da impressão pago

##### 7.4. Impressão Aceita
- Gerar QR Code automático com:
  - Número do pedido
  - Horário estimado de pronto (considerando fila do parceiro)
  - Nome/endereço do parceiro

#### 8. **Tela de Sucesso Final**
- PDF liberado para download
- QR Code (se impressão)
- Botão "Baixar/Compartilhar PDF"

#### 9. **Ranking de Parceiros**
- Registrar aceitações/recusas
- Penalizar recusa frequente

#### 10. **Observação Importante**
- **SE** não houver parceiro online (finais de semana, fora do horário):
  - Mostrar: "Impressão indisponível no momento, nenhum parceiro disponível"

---

## 📌 FLUXO IMPRESSÃO RÁPIDA

**Tipo:** Fluxo Único - Cliente Faz Sozinho  
**Localização:** Botão grande na página inicial

### **Etapas do Fluxo:**

#### 1. **Tela de Upload**
- Permitir upload de:
  - PDF
  - Word (.doc, .docx)
  - PowerPoint (.ppt, .pptx)
  - Imagens (JPG, PNG)
- **Permitir múltiplos arquivos**

#### 2. **Conversão Automática**
- **SE** arquivo for Word/PowerPoint:
  - Converter para PDF no momento do upload
  - Garantir contagem exata de páginas

#### 3. **Opções por Arquivo** (para cada arquivo separado)
- **Cor:** Preto & Branco OU Colorido
- **Quantidade de Cópias:** 1, 2, 3... (botões +/-)
- **Tipo de Papel:**
  - Papel Comum A4
  - Papel Cartão
  - Papel Fotográfico
- **Páginas Específicas** (se documento com mais de 1 folha):
  - Opção para selecionar quais páginas imprimir
  - Ex: "1-3, 5, 7-10"

#### 4. **Mensagem para Parceiro**
- Caixa de texto curta
- Exemplo: "Arquivo com senha 1234"

#### 5. **Cálculo Automático**
- Mostrar quantidade de folhas do documento
- Calcular preço automaticamente:
  - **P&B:** R$ 1,00 por página
  - **Colorido (papel comum):** R$ 1,50 por página
  - Preços conforme Tabela de Preços (Painel Admin)

#### 6. **Preview de Documentos**
- Botão "Visualizar" para cada arquivo
- Permitir conferir o que será impresso

#### 7. **Tela de Pagamento**
- Resumo com valor total
- Método: PIX

#### 8. **Após Pagamento Confirmado:**

##### 8.1. Mostrar Mapa de Parceiros
- Raio: 5 a 15 km (geolocalização)
- Cliente seleciona um parceiro
- Mostrar tela de espera:
  ```
  "Aguardando aceite da impressão...
  Tempo estimado: 5 min.
  Você será notificado quando aceito."
  ```

##### 8.2. Timeout ou Recusa (5 min)
- **SE** parceiro recusa OU não responde em 5 min:
  - Atualizar mapa (remover parceiro que recusou/não respondeu)
  - Mostrar: "Desculpe pelo inconveniente, escolha outro parceiro para retirar sua impressão"
  - Reenviar para novo parceiro selecionado

##### 8.3. Nenhum Parceiro Responde
- **SE** nenhum parceiro no raio de 5-15km responder:
  - Notificar: "Impressão não está disponível no momento"
  - **Reembolso automático**

##### 8.4. Impressão Aceita
- Gerar QR Code automático com:
  - Número do pedido
  - Horário estimado de pronto (considerando fila)
  - Nome/endereço do parceiro

#### 9. **Ranking de Parceiros**
- Registrar aceitações/recusas
- Penalizar recusa frequente

#### 10. **Observação Importante**
- **SE** não houver parceiro online (finais de semana, fora do horário):
  - Mostrar: "Impressão indisponível no momento, nenhum parceiro disponível"

### **Funcionalidade Extra: Sharing Intent**

#### **Receber Arquivos de Outros Apps**
- Integração com WhatsApp, Email, Galeria, etc.
- Quando usuário compartilha arquivo para Copinet:
  - Abrir tela "Impressão Rápida"
  - Arquivo recebido pré-anexado
  - Mostrar thumbnail/preview
  - Texto: "Arquivo recebido! Vamos imprimir ou gerar PDF rapidamente"
- Suportar múltiplos arquivos compartilhados de uma vez
- Seguir fluxo normal de impressão rápida

---

## 📌 FLUXO IMPRESSÃO DE FOTOS

**Tipo:** Fluxo Único - Cliente Faz Sozinho  
**Localização:** Seção separada na página inicial

### **Etapas do Fluxo:**

#### 1. **Tela de Upload**
- Permitir upload de:
  - Imagens (JPG, PNG)
  - PDF (se contiver fotos)
- **Permitir múltiplos arquivos**

#### 2. **Opções por Foto**
- **Tamanho:**
  - 10x15 cm → R$ 3,00 por foto
  - 13x18 cm → R$ 5,00 por foto
  - 15x21 cm → R$ 7,00 por foto
  - 21x29 cm → R$ 9,00 por foto
- **Quantidade de Cópias:** 1, 2, 3... (botões +/-)
- **Papel:** Fotográfico (fixo)

#### 3. **Cálculo Automático**
- Mostrar quantidade de fotos
- Calcular preço automaticamente
- Preços conforme Tabela de Preços (Painel Admin)

#### 4. **Tela de Pagamento**
- Resumo com valor total
- Método: PIX

#### 5. **Após Pagamento Confirmado:**

##### 5.1. Mostrar Mapa de Parceiros
- Raio: 5 a 15 km (geolocalização)
- Cliente seleciona um parceiro
- Mostrar tela de espera:
  ```
  "Aguardando aceite da impressão...
  Tempo estimado: 5 min.
  Você será notificado quando aceito."
  ```

##### 5.2. Timeout ou Recusa (5 min)
- **SE** parceiro recusa OU não responde em 5 min:
  - Atualizar mapa (remover parceiro que recusou/não respondeu)
  - Mostrar: "Desculpe pelo inconveniente, escolha outro parceiro para retirar sua impressão"
  - Reenviar para novo parceiro selecionado

##### 5.3. Nenhum Parceiro Responde
- **SE** nenhum parceiro no raio de 5-15km responder:
  - Notificar: "Impressão não está disponível no momento"
  - **Reembolso automático**

##### 5.4. Impressão Aceita
- Gerar QR Code automático com:
  - Número do pedido
  - Horário estimado de pronto (considerando fila)
  - Nome/endereço do parceiro

#### 6. **Ranking de Parceiros**
- Registrar aceitações/recusas
- Penalizar recusa frequente

#### 7. **Observação Importante**
- **SE** não houver parceiro online (finais de semana, fora do horário):
  - Mostrar: "Impressão indisponível no momento, nenhum parceiro disponível"

---

## 📌 FLUXO FOTO 3x4

**Tipo:** Fluxo Único - Cliente Faz Sozinho  
**Localização:** Categoria separada

### **Etapas do Fluxo:**

#### 1. **Captura de Foto**
- Abrir câmera do dispositivo
- Permitir tirar **múltiplas fotos**
- Cliente seleciona qual foto deseja usar

#### 2. **Edição Automática**
- **Fundo branco** automático
- Tamanho padrão: 3x4 cm
- Rosto centralizado
- Ajuste de iluminação

#### 3. **Edição Manual (Opcional)**
- Permitir cliente manipular:
  - Zoom (aproximar/afastar)
  - Centralizar rosto
  - Ajustar posição
  - Ajustar brilho/contraste

#### 4. **Gerar JPG**
- Criar arquivo JPG otimizado
- Pronto para download ou impressão

#### 5. **Opções de Preço**
- **Só PDF/JPG:** R$ 5,00
- **Impressão folha inteira sem corte:** R$ 8,00
- **PDF/JPG + Impressão com corte (6 fotos 3x4):** R$ 14,00
- Preços conforme Tabela de Preços (Painel Admin)

#### 6. **Tela de Pagamento**
- Cliente escolhe modalidade
- Método: PIX

#### 7. **Após Pagamento Confirmado:**

##### 7.1. SE "Só PDF/JPG"
- Gerar arquivo imediatamente
- Disponibilizar para download
- Notificar: "Arquivo pronto! Disponível por 3 dias"

##### 7.2. SE "Impressão"
- Mostrar Mapa de Parceiros (raio 5-15 km)
- Cliente seleciona parceiro
- Tela de espera (5 min)
- Timeout/Recusa: atualizar mapa
- Nenhum responde: reembolso
- Aceito: gerar QR Code

#### 8. **Formato de Impressão**
- Papel fotográfico 10x15 cm
- 6 fotos 3x4 dispostas na folha
- **SE** "com corte": parceiro corta as 6 fotos
- **SE** "sem corte": cliente recebe folha inteira

---

## 📌 FLUXO ESCANEAMENTO PARA PDF

**Tipo:** Fluxo Único - Cliente Faz Sozinho  
**Localização:** Seção no menu principal

### **Etapas do Fluxo:**

#### 1. **Tela Inicial - Escolha de Modo**
- **Opção 1:** "Um PDF por documento" (cada documento = 1 arquivo separado)
- **Opção 2:** "Documentos em PDF único" (todos documentos = 1 arquivo)

#### 2. **Captura de Imagens**
- **Modo Contínuo:** Tirar várias fotos seguidas
- **Upload da Galeria:** Múltiplo upload
- Sem limite de páginas

#### 3. **Edição Automática por Página**
- Corte de bordas automático
- Correção de perspectiva
- Melhora de contraste (P&B perfeito para documentos)
- Nitidez otimizada

#### 4. **Organização de Páginas**
- Drag-and-drop para reordenar
- Exemplos:
  - Mover primeira página para segunda posição
  - Mover terceira página para primeira posição
- Interface visual com thumbnails

#### 5. **Preview do Documento**
- Visualizar documento escaneado completo
- **Proteção:** Preview com marca d'água antes do pagamento
- Após pagamento: preview completo sem marca d'água

#### 6. **Geração de PDF**
- **SE** "Um PDF por documento": gerar múltiplos PDFs
- **SE** "PDF único": gerar 1 PDF com todas as páginas
- Alta qualidade (300 DPI mínimo)

#### 7. **Opções de Preço**
- **Só PDF Digital:** R$ 0,50 por documento
- **PDF + Impressão:** Preço por página (P&B ou Colorido)
- Preços conforme Tabela de Preços (Painel Admin)

#### 8. **Tela de Pagamento**
- Cliente escolhe modalidade
- Método: PIX

#### 9. **Após Pagamento Confirmado:**

##### 9.1. SE "Só PDF"
- Gerar PDF(s) imediatamente
- Disponibilizar para download
- Opções de compartilhamento:
  - **Email:** Enviar por email diretamente do app
  - **WhatsApp:** Compartilhar via WhatsApp
  - **Download:** Salvar no dispositivo

##### 9.2. SE "PDF + Impressão"
- Mostrar Mapa de Parceiros (raio 5-15 km)
- Cliente seleciona parceiro
- Tela de espera (5 min)
- Timeout/Recusa: atualizar mapa
- Nenhum responde: oferecer só PDF + reembolso
- Aceito: gerar QR Code

---

## 📌 FLUXO ENVIO DE EMAIL SIMPLES

**Tipo:** Fluxo Único - Serviço Interno  
**Localização:** Seção no menu principal  
**Ícone:** Envelope

### **Objetivo:**
Permitir que pessoas com dificuldade em tecnologia enviem emails facilmente, sem usar Gmail.

### **Etapas do Fluxo:**

#### 1. **Tela de Composição**

##### Campo "Para" (Destinatário)
- Input com máscara de email
- Validação automática de formato
- Placeholder: "exemplo@email.com"

##### Campo "Assunto"
- Input de texto simples
- Placeholder: "Digite o assunto do email"

##### Campo "Mensagem"
- Textarea grande (múltiplas linhas)
- Teclado simples (sem formatação complexa)
- Placeholder: "Digite sua mensagem aqui..."

##### Botão "Anexar Arquivos"
- Abre opções:
  - 📷 Câmera
  - 🖼️ Galeria
  - 📁 Arquivos do dispositivo
- **Múltiplo upload:** Até 5 arquivos
- Mostrar thumbnails com:
  - Nome do arquivo
  - Tamanho
  - Botão "Remover" (X)

#### 2. **Interface Amigável**
- **Botões grandes** (fácil de tocar)
- **Texto claro** e legível
- **Cores contrastantes**
- **Ícones intuitivos**

#### 3. **Validação Antes de Enviar**
- Verificar se campo "Para" está preenchido
- Verificar se email é válido
- Alertar se "Assunto" ou "Mensagem" estão vazios (opcional)

#### 4. **Envio**
- Botão grande: "Enviar Email 📧"
- Mostrar loading durante envio
- Confirmação: "Email enviado com sucesso! ✅"

#### 5. **Histórico (Opcional)**
- Salvar emails enviados
- Permitir reenviar ou editar

---

## 🔧 SISTEMA DE PARCEIROS E IMPRESSÃO

### **Regras Gerais para Todos os Fluxos com Impressão:**

#### 1. **Verificação de Disponibilidade**
- Verificar parceiros **antes** de cobrar impressão
- Considerar:
  - Horário de funcionamento
  - Finais de semana
  - Parceiros online/offline
  - Geolocalização (raio 5-15 km)

#### 2. **Timeout de Aceite**
- Tempo máximo: **5 minutos**
- Após timeout: remover parceiro da lista e mostrar outros

#### 3. **Recusa de Parceiro**
- Atualizar mapa imediatamente
- Remover parceiro que recusou
- Permitir cliente escolher outro

#### 4. **Nenhum Parceiro Disponível**
- Oferecer apenas PDF (se aplicável)
- **Reembolso automático** do valor da impressão
- Mensagem clara ao cliente

#### 5. **QR Code**
- Gerar automaticamente quando impressão aceita
- Conter:
  - Número do pedido
  - Horário estimado de pronto
  - Nome do parceiro
  - Endereço do parceiro
  - Fila de espera (se houver)

#### 6. **Ranking de Parceiros**
- Registrar todas aceitações e recusas
- Penalizar recusas frequentes:
  - Diminuir score
  - Reduzir visibilidade no mapa
  - Alertar parceiro sobre baixo desempenho

#### 7. **Priorização de Lojas Próprias**
- **SE** houver Loja Copinet disponível:
  - Priorizar automaticamente
  - Destacar no mapa
  - Comissão: 100% para o app

---

## 📊 INTEGRAÇÃO COM SUPABASE

### **Tabelas Necessárias:**

#### `pedidos`
- Rastrear todos os pedidos
- Status: pending, accepted, in_progress, completed, cancelled
- Timestamps de cada etapa

#### `pedidos_impressao`
- Pedidos específicos de impressão
- Parceiro selecionado
- Status de aceite/recusa
- Tempo de resposta

#### `qr_codes`
- Códigos gerados
- Validade
- Pedido associado
- Parceiro associado

#### `disponibilidade_parceiros`
- Horários de funcionamento
- Status online/offline
- Última atualização

#### `ranking_parceiros`
- Score de cada parceiro
- Total de aceitações
- Total de recusas
- Tempo médio de resposta

---

## ⚙️ CONFIGURAÇÕES GLOBAIS

### **Raio de Busca de Parceiros:**
- Padrão: 5 km
- Máximo: 15 km
- Configurável no Painel Admin

### **Timeout de Aceite:**
- Padrão: 5 minutos
- Configurável no Painel Admin

### **Validade de PDFs:**
- Padrão: 3 dias
- Configurável no Painel Admin

### **Limite de Arquivos:**
- Impressão Rápida: Ilimitado
- Email Simples: 5 arquivos
- Configurável no Painel Admin

---

## 📝 NOTAS IMPORTANTES

1. **Todos os preços** devem vir da Tabela de Preços (Painel Admin)
2. **Geolocalização** é essencial para funcionamento do sistema
3. **Notificações Push** devem ser implementadas para todos os status
4. **PDFs expiram** após 3 dias (configurável)
5. **Reembolsos** devem ser automáticos quando impressão não disponível
6. **Ranking** afeta diretamente a visibilidade dos parceiros

---

**Documento criado em:** 27/02/2026  
**Última atualização:** 27/02/2026  
**Versão:** 1.0
