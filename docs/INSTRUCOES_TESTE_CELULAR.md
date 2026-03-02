# 📱 INSTRUÇÕES PARA TESTE NO CELULAR

**Data:** 28/02/2026  
**Versão:** 1.0 - Correções Completas

---

## ✅ CORREÇÕES IMPLEMENTADAS

### **1. Contagem de Páginas PDF/Word/PowerPoint** ✅
- ✅ Instalado `pdf-lib` para contagem REAL de páginas
- ✅ PDF: Usa `PDFDocument.load()` e `getPageCount()` - **100% preciso**
- ✅ Word: Estimativa ~30KB/página
- ✅ PowerPoint: Estimativa ~50KB/slide
- ✅ Logs detalhados no console para debug

### **2. Padrão COLORIDO + PAPEL COMUM** ✅
- ✅ Padrão alterado: `colorido: true` e `papel: 'comum'`
- ✅ Tipos de papel implementados:
  - **Comum:** P&B R$ 1,00 | Colorido R$ 1,50
  - **Cartão:** P&B R$ 3,00 | Colorido R$ 3,50
  - **Fotográfico:** R$ 4,00

### **3. Mensagem de Erro Corrigida** ✅
- ✅ Removido: "devolução de valor" e "receber PDF"
- ✅ Nova mensagem lógica para Impressão Rápida

### **4. Busca de Parceiros** ✅
- ✅ Logs detalhados adicionados
- ✅ Localização simulada: Cubatão, SP (-23.8950, -46.4250)
- ✅ Raio: 10km
- ✅ SQL simplificado criado

### **5. Seleção de Páginas Específicas** ✅
- ✅ Campo de texto para cada documento
- ✅ Formato: "1-3, 5, 7-10"
- ✅ Validação completa
- ✅ Cálculo automático de preço

---

## 🚀 COMO TESTAR NO CELULAR

### **PASSO 1: EXECUTAR SQL DE PARCEIROS**

1. Abra **SQL Editor** no Supabase
2. Copie o conteúdo de: `docs/CRIAR_PARCEIROS_CUBATAO_SIMPLES.sql`
3. Execute
4. Verifique se retornou 3 parceiros

**Parceiros criados:**
- Copinet Cubatão Centro (Loja Própria) - Av. 9 de Abril, 1500
- Papelaria Vila Nova - Rua Armando Sales de Oliveira, 300
- Gráfica Rápida Cubatão - Av. Martins Fontes, 800

---

### **PASSO 2: CONECTAR CELULAR**

#### **Opção A: Expo Go (RECOMENDADO)**

1. **Instale Expo Go** no celular:
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Conecte na mesma rede Wi-Fi** que o PC

3. **Abra Expo Go** e escaneie o QR Code que aparecerá no terminal

4. **Aguarde carregar** (primeira vez pode demorar)

#### **Opção B: Modo LAN (se QR Code não aparecer)**

1. No terminal, procure por algo como:
   ```
   Metro waiting on exp://192.168.X.X:8081
   ```

2. Anote o IP (ex: 192.168.1.100)

3. No Expo Go, digite manualmente:
   ```
   exp://192.168.1.100:8081
   ```

---

### **PASSO 3: TESTAR FLUXO COMPLETO**

#### **Teste 1: Documentos PDF**

1. **Abra o app** no celular
2. **Clique:** Botão verde "IMPRESSÃO RÁPIDA"
3. **Escolha:** "📄 Documentos"
4. **Upload:** PDF com várias páginas (use um PDF de teste)
5. **VERIFICAR:**
   - ✅ Contagem de páginas está correta?
   - ✅ Mostra "X pág total • X pág a imprimir"?
6. **Configurar:**
   - ✅ Padrão é COLORIDO? (botão verde)
   - ✅ Padrão é PAPEL COMUM? (botão verde)
7. **Testar tipos de papel:**
   - Clique em "Cartão" → Preço muda?
   - Clique em "Fotográfico" → Preço muda?
8. **Testar seleção de páginas:**
   - Digite: "1-3, 5"
   - Preço atualiza?
9. **Clicar:** "Escolher Parceiro 🚀"
10. **VERIFICAR:**
    - ✅ Aparece mapa com 3 parceiros?
    - ✅ Copinet Cubatão Centro aparece primeiro?
11. **Selecionar parceiro**
12. **VERIFICAR:**
    - ✅ Vai para tela "Aguardando Aceite"?
    - ✅ Mostra contador de 5 minutos?

#### **Teste 2: Fotos**

1. **Voltar** e escolher "📸 Fotos"
2. **Upload:** Imagens JPG/PNG
3. **VERIFICAR:**
   - ✅ Tamanhos disponíveis: 10x15, 13x18, 15x21, 21x29?
   - ✅ Preços corretos?
4. **Prosseguir** com fluxo

---

## 🐛 LOGS PARA DEBUG

Abra o **console do Expo** no celular (sacudir o celular → "Debug Remote JS")

**Logs esperados:**

```
📄 Contando páginas do PDF: file://...
✅ PDF tem 27 páginas

🔍 Buscando parceiros próximos...
📍 Localização: { lat: -23.8950, lng: -46.4250, raio_km: 10 }
✅ Encontrados 3 parceiros
📋 Parceiros: [...]
```

---

## ❌ PROBLEMAS COMUNS

### **"Nenhum parceiro disponível"**

**Causa:** SQL não foi executado ou função do Supabase não existe

**Solução:**
1. Execute `CRIAR_PARCEIROS_CUBATAO_SIMPLES.sql`
2. Verifique se a função `buscar_parceiros_proximos` existe no Supabase
3. Execute a query de teste no final do SQL

### **"Contagem de páginas sempre 1"**

**Causa:** Biblioteca pdf-lib não carregou

**Solução:**
1. Verifique logs no console
2. Se erro, tente recarregar o app
3. Verifique se `pdf-lib` foi instalado: `npm list pdf-lib`

### **"Expo Go não conecta"**

**Causa:** PC e celular em redes diferentes

**Solução:**
1. Conecte ambos na **mesma rede Wi-Fi**
2. Desative VPN se tiver
3. Use modo LAN manual (digite IP)

### **"App não carrega no celular"**

**Causa:** Metro Bundler não iniciou

**Solução:**
1. Verifique se o servidor está rodando
2. Procure por erros no terminal
3. Reinicie: `Ctrl+C` e `npx expo start --lan`

---

## 📊 CHECKLIST DE VALIDAÇÃO

### **Contagem de Páginas:**
- [ ] PDF de 27 páginas → mostra 27
- [ ] PDF de 51 páginas → mostra 51
- [ ] Word de 51 páginas → mostra estimativa próxima
- [ ] Preço atualiza baseado em páginas

### **Tipos de Papel:**
- [ ] Padrão: Comum + Colorido ✅
- [ ] Papel Comum P&B: R$ 1,00/pág
- [ ] Papel Comum Colorido: R$ 1,50/pág
- [ ] Papel Cartão P&B: R$ 3,00/pág
- [ ] Papel Cartão Colorido: R$ 3,50/pág
- [ ] Papel Fotográfico: R$ 4,00/pág

### **Seleção de Páginas:**
- [ ] Campo aparece para documentos com > 1 página
- [ ] Aceita formato: "1-3, 5, 7-10"
- [ ] Valida entrada
- [ ] Atualiza preço corretamente

### **Busca de Parceiros:**
- [ ] Encontra 3 parceiros em Cubatão
- [ ] Copinet Cubatão Centro aparece primeiro
- [ ] Mostra distância, ranking, fila

### **Fluxo Completo:**
- [ ] Upload → Config → Parceiro → Aceite → QR Code
- [ ] Mensagens corretas
- [ ] Sem erros no console

---

## 🎯 PRÓXIMOS PASSOS APÓS TESTES

1. **Reportar resultados** dos testes
2. **Corrigir bugs** encontrados
3. **Implementar aceite real** do parceiro (dashboard)
4. **Integrar pagamento PIX** real
5. **Upload de arquivos** para Supabase Storage
6. **Notificações push** quando parceiro aceitar

---

## 📞 SUPORTE

Se encontrar problemas:
1. Tire **screenshot** do erro
2. Copie **logs do console**
3. Descreva **passo a passo** o que fez
4. Reporte para correção

---

**Última Atualização:** 28/02/2026 18:10
