# 📱 Método Definitivo: Teste no Celular via HTML + QR Code

**Data:** 03/03/2026  
**Status:** ✅ Método Aprovado e Funcional

---

## ✅ POR QUE ESTE MÉTODO FUNCIONA

O Expo CLI no terminal CMD frequentemente **não exibe o QR Code** devido a:
- Problemas de encoding no terminal Windows
- Bugs do Expo CLI com Node.js 20
- Variáveis de ambiente `CI=1` que desabilitam interface interativa

**Solução:** Página HTML externa com QR Code gerado via JavaScript.

---

## 🚀 PASSO A PASSO (SEMPRE USE ESTE MÉTODO)

### **1. Matar Processos na Porta 8081**

```cmd
netstat -ano | findstr :8081
taskkill /F /PID [PID_ENCONTRADO]
```

### **2. Iniciar Servidor Expo**

```cmd
cd f:\COPINET\APPCopinet\WindSurf\AppCopinetv2
.\INICIAR_EXPO_WORKAROUND.bat
```

**Aguarde até ver:**
```
Waiting on http://localhost:8081
Logs for your project will appear below.
```

### **3. Obter IP do PC**

```cmd
ipconfig
```

Procure por **"Endereço IPv4"** (ex: `192.168.0.104`)

### **4. Atualizar qrcode-expo.html**

Edite o arquivo `qrcode-expo.html` na linha 145:

```javascript
const IP_LOCAL = '192.168.0.104'; // ← SEU IP AQUI
```

### **5. Abrir Página HTML no Navegador**

```cmd
start qrcode-expo.html
```

Ou abra manualmente: `f:\COPINET\APPCopinet\WindSurf\AppCopinetv2\qrcode-expo.html`

### **6. Escanear QR Code no Celular**

1. Abra **Expo Go** no celular
2. Escaneie o **QR Code** da tela do PC
3. Aguarde carregar (1-2 minutos na primeira vez)

---

## 📋 ARQUIVO: qrcode-expo.html

**Localização:** `f:\COPINET\APPCopinet\WindSurf\AppCopinetv2\qrcode-expo.html`

**Estrutura:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>QR Code - Expo Go</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
</head>
<body>
    <div class="container">
        <h1>📱 Teste no Celular</h1>
        <canvas id="qrcode"></canvas>
        <p id="expo-url"></p>
    </div>
    
    <script>
        const IP_LOCAL = '192.168.0.104'; // ← ATUALIZAR AQUI
        const PORT = '8081';
        const expoUrl = `exp://${IP_LOCAL}:${PORT}`;
        
        QRCode.toCanvas(expoUrl, {
            width: 300,
            margin: 2
        }, function (error, canvas) {
            if (error) console.error(error);
            document.getElementById('qrcode').appendChild(canvas);
        });
        
        document.getElementById('expo-url').textContent = expoUrl;
    </script>
</body>
</html>
```

---

## ⚙️ ARQUIVO: INICIAR_EXPO_WORKAROUND.bat

**Localização:** `f:\COPINET\APPCopinet\WindSurf\AppCopinetv2\INICIAR_EXPO_WORKAROUND.bat`

**Conteúdo:**
```batch
@echo off
cls
echo ========================================
echo EXPO - INICIANDO COM WORKAROUND
echo ========================================
echo.
echo Contornando bug do Expo CLI com Node.js 20...
echo.

cd /d "%~dp0"

REM Definir variáveis de ambiente para desabilitar validações problemáticas
set EXPO_NO_DOCTOR=1
set EXPO_NO_TELEMETRY=1
set EXPO_NO_DOTENV=1
set CI=1
set NODE_OPTIONS=--max-old-space-size=4096

echo Iniciando servidor Expo...
echo.

REM Usar npx diretamente com todas as flags necessárias
npx expo start --port 8081 --lan

pause
```

---

## 🔧 TROUBLESHOOTING

### **Erro: "Port 8081 is being used by another process"**

**Solução:**
```cmd
netstat -ano | findstr :8081
taskkill /F /PID [PID]
```

### **Erro: QR Code não aparece no navegador**

**Solução:**
1. Verifique se `qrcode-expo.html` está no diretório raiz do projeto
2. Verifique se o IP está correto na linha 145
3. Abra o Console do navegador (F12) e veja erros

### **Erro: App não carrega no celular**

**Solução:**
1. Verifique se PC e celular estão na **mesma rede Wi-Fi**
2. Verifique se o servidor Expo está rodando (`Waiting on http://localhost:8081`)
3. Tente recarregar no Expo Go (pressione **R** duas vezes)

### **Erro: "Failed to download remote update"**

**Solução:**
1. Limpe cache do Expo Go no celular
2. Reinicie o servidor Expo
3. Escaneie o QR Code novamente

---

## 📊 LOGS ESPERADOS

**No terminal CMD:**
```
========================================
EXPO - INICIANDO COM WORKAROUND
========================================

Contornando bug do Expo CLI com Node.js 20...

Iniciando servidor Expo...

Starting project at F:\COPINET\APPCopinet\WindSurf\AppCopinetv2
Metro is running in CI mode, reloads are disabled. Remove CI=true to enable watch mode.
Starting Metro Bundler
The following packages should be updated for best compatibility with the installed expo version:
  expo-document-picker@55.0.8 - expected version: ~14.0.8
  expo-file-system@18.0.12 - expected version: ~19.0.21
  react-native-maps@1.27.1 - expected version: 1.20.1
Your project may not work correctly until you install the expected versions of the packages.
Waiting on http://localhost:8081
Logs for your project will appear below.
```

**No navegador:**
- QR Code visível
- URL: `exp://192.168.0.104:8081`
- Status: ✅ Servidor Expo rodando na porta 8081

---

## ✅ VANTAGENS DESTE MÉTODO

1. ✅ **Sempre funciona** (não depende do terminal)
2. ✅ **QR Code sempre visível** (não desaparece)
3. ✅ **Fácil de compartilhar** (pode enviar link)
4. ✅ **Funciona em qualquer rede** Wi-Fi
5. ✅ **Não depende de ngrok** ou tunnel
6. ✅ **Rápido** (conexão LAN direta)

---

## 🎯 CHECKLIST DE TESTE

- [ ] Servidor Expo iniciado (`Waiting on http://localhost:8081`)
- [ ] IP do PC obtido via `ipconfig`
- [ ] `qrcode-expo.html` atualizado com IP correto
- [ ] Página HTML aberta no navegador
- [ ] QR Code visível na tela
- [ ] PC e celular na mesma rede Wi-Fi
- [ ] Expo Go instalado no celular
- [ ] QR Code escaneado
- [ ] App carregando no celular

---

## 📝 NOTAS IMPORTANTES

1. **Sempre use este método** para testes no celular
2. **Nunca confie** no QR Code do terminal CMD
3. **Sempre verifique** se o IP está correto
4. **Sempre confirme** que o servidor está rodando antes de escanear
5. **Sempre use** a mesma rede Wi-Fi

---

**Método aprovado e testado em 03/03/2026** ✅
