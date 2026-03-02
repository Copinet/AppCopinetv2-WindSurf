# Script PowerShell para iniciar o servidor Expo sem validação de dependências

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   COPINET - SERVIDOR WEB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Desabilita validação de dependências e telemetria
$env:EXPO_NO_DOCTOR = "1"
$env:EXPO_NO_TELEMETRY = "1"
$env:CI = "1"

Write-Host "[1/2] Configurando ambiente..." -ForegroundColor Yellow
Write-Host "  - Validação de dependências: DESABILITADA" -ForegroundColor Green
Write-Host "  - Telemetria: DESABILITADA" -ForegroundColor Green
Write-Host ""

Write-Host "[2/2] Iniciando servidor web..." -ForegroundColor Yellow
Write-Host "  O navegador abrirá automaticamente" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Inicia o servidor
npx expo start --web

Write-Host ""
Write-Host "Servidor encerrado." -ForegroundColor Red
pause
