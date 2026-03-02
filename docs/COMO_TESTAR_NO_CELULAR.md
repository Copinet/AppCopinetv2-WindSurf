# 📱 COMO TESTAR NO CELULAR - SOLUÇÃO DEFINITIVA

**Última Atualização:** 28/02/2026  
**Status:** ✅ Testado e Funcionando

---

## 🎯 SOLUÇÃO RECOMENDADA: QR CODE HTML

Esta é a **melhor solução** para testar o app no celular. Não depende do terminal do Expo mostrar QR Code.

---

## 🚀 PASSO A PASSO

### **1. Iniciar Servidor Expo**

Execute o arquivo batch:
```
TESTAR_NO_CELULAR.bat
```

Ou manualmente:
```powershell
cd f:\COPINET\APPCopinet\WindSurf\AppCopinetv2
set EXPO_NO_DOCTOR=1
set EXPO_NO_TELEMETRY=1
npx expo start --port 8081
```

Aguarde até aparecer:
```
Waiting on http://localhost:8081
```

---

### **2. Abrir Página HTML com QR Code**

Abra no navegador:
```
f:\COPINET\APPCopinet\WindSurf\AppCopinetv2\qrcode-expo.html
```

Ou clique duas vezes no arquivo `qrcode-expo.html`

**A página mostra:**
- ✅ QR Code grande para escanear
- ✅ URL para copiar e colar: `exp://192.168.0.102:8081`
- ✅ Instruções passo a passo
- ✅ Botão para copiar URL

---

### **3. Instalar Expo Go no Celular**

**Android:**
- Google Play Store → Buscar "Expo Go" → Instalar

**iOS:**
- App Store → Buscar "Expo Go" → Instalar

---

### **4. Conectar na Mesma Rede Wi-Fi**

- Celular e PC devem estar na **mesma rede Wi-Fi**
- Verifique o IP do PC com: `ipconfig`

---

### **5. Escanear QR Code ou Colar URL**

**Opção A: Escanear QR Code (Mais Rápido)**
1. Abra Expo Go no celular
2. Toque em "Scan QR Code"
3. Escaneie o QR Code da página HTML
4. Aguarde carregar

**Opção B: Colar URL Manualmente**
1. Na página HTML, clique em "📋 Copiar URL"
2. Abra Expo Go no celular
3. Cole a URL: `exp://[SEU_IP]:8081`
4. Aguarde carregar

---

## 🔧 ATUALIZAR IP QUANDO NECESSÁRIO

Se o IP do PC mudar, edite o arquivo `qrcode-expo.html`:

```javascript
// Linha 127
const IP = '192.168.0.102'; // ← Altere aqui
```

Salve e recarregue a página no navegador.

---

## ✅ VANTAGENS DESTA SOLUÇÃO

1. ✅ **Não depende do terminal** mostrar QR Code
2. ✅ **QR Code sempre visível** na página HTML
3. ✅ **Pode copiar e colar** a URL facilmente
4. ✅ **Funciona em qualquer rede** Wi-Fi
5. ✅ **Reutilizável** - salve a página para sempre
6. ✅ **Visual bonito** e profissional

---

## 🐛 PROBLEMAS COMUNS

### **"QR Code não aparece na página"**
- Verifique se tem internet (usa CDN do qrcode.js)
- Abra Console do navegador (F12) e veja erros

### **"App não carrega no celular"**
- Confirme que celular e PC estão na mesma rede Wi-Fi
- Aguarde 2-3 minutos na primeira vez
- Verifique se o servidor Expo está rodando

### **"Erro de conexão"**
- Verifique o IP do PC: `ipconfig`
- Atualize o IP no arquivo `qrcode-expo.html`
- Recarregue a página

---

## 📁 ARQUIVOS IMPORTANTES

1. **TESTAR_NO_CELULAR.bat** - Inicia servidor Expo
2. **qrcode-expo.html** - Página com QR Code
3. **CRIAR_PARCEIROS_CUBATAO_SIMPLES.sql** - SQL de parceiros de teste

---

## 🎯 CHECKLIST DE TESTE

Antes de testar no celular:

- [ ] Servidor Expo rodando (`TESTAR_NO_CELULAR.bat`)
- [ ] Página HTML aberta com QR Code visível
- [ ] Expo Go instalado no celular
- [ ] Celular e PC na mesma rede Wi-Fi
- [ ] SQL de parceiros executado no Supabase
- [ ] IP do PC correto no `qrcode-expo.html`

---

## 💡 DICA PRO

Salve a página `qrcode-expo.html` nos favoritos do navegador para acesso rápido!

---

**Esta é a solução DEFINITIVA para testes no celular. Use sempre!** 🚀
