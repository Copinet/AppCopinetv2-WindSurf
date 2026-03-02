@echo off
cls
echo ========================================
echo    COPINET - SERVIDOR DE DESENVOLVIMENTO
echo ========================================
echo.
echo [1/3] Verificando ambiente...
echo.

REM Define variavel para desabilitar telemetria e validacao
set EXPO_NO_TELEMETRY=1
set EXPO_NO_DOCTOR=1

echo [2/3] Seu IP local: 192.168.0.102
echo.
echo IMPORTANTE - LEIA ANTES DE CONTINUAR:
echo.
echo 1. Conecte seu CELULAR na mesma WiFi que o computador
echo 2. Abra o app EXPO GO no celular
echo 3. Aguarde o QR Code aparecer abaixo
echo 4. Escaneie o QR Code com o Expo Go
echo.
echo ========================================
echo.
echo [3/3] Iniciando servidor...
echo.

cd /d "%~dp0"
call npx expo start --lan

pause
