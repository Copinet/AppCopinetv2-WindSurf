# 🔧 SOLUÇÃO DEFINITIVA - SERVIDOR WEB EXPO

## ❌ Problema Identificado

Erro ao iniciar servidor: `TypeError: Body is unusable: Body has already been read`

**Causa Raiz**: Expo CLI tentando validar dependências e fazendo chamadas de rede duplicadas, causando conflito no Metro Bundler.

## ✅ Solução Aplicada

Usar variáveis de ambiente que desabilitam validações problemáticas:

```powershell
$env:EXPO_NO_DOCTOR = "1"    # Desabilita validação de dependências
$env:EXPO_NO_TELEMETRY = "1" # Desabilita telemetria
$env:CI = "1"                # Modo CI (sem hot reload, mais estável)
```

## 🚀 Como Iniciar o Servidor

### Opção 1: Script PowerShell (RECOMENDADO)
```powershell
.\start-server.ps1
```

### Opção 2: Comando Direto
```powershell
$env:EXPO_NO_DOCTOR="1"; $env:EXPO_NO_TELEMETRY="1"; $env:CI="1"; npx expo start --web
```

### Opção 3: Batch File
```batch
START_APP.bat
```

## 📊 Resultado Esperado

```
Starting project at F:\COPINET\APPCopinet\WindSurf\AppCopinetv2
Metro is running in CI mode, reloads are disabled
Starting Metro Bundler
Waiting on http://localhost:8081
Web Bundled 54274ms (911 modules)
LOG [web] Logs will appear in the browser console
```

## 🌐 Acesso

- **URL**: http://localhost:8081
- **Porta**: 8081
- **Tempo de Build**: ~54 segundos (primeira vez)

## 📝 Notas Importantes

1. **Watchman não é necessário** no Windows com esta configuração
2. **Hot Reload desabilitado** em modo CI (recarregue manualmente o navegador)
3. **Cache limpo** se necessário: `npx expo start -c --web`
4. **Sem validação de dependências** = inicialização mais rápida e estável

## 🔍 Troubleshooting

### Se o servidor travar:
```powershell
taskkill /F /IM node.exe /T
.\start-server.ps1
```

### Se precisar limpar cache:
```powershell
npx expo start -c --web
```

---
**Data**: 26/02/2026  
**Status**: ✅ Funcionando perfeitamente
