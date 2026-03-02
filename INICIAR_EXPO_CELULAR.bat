@echo off
echo ========================================
echo INICIANDO EXPO PARA TESTE NO CELULAR
echo ========================================
echo.
echo Aguarde o QR Code aparecer...
echo.
echo IMPORTANTE:
echo 1. Instale Expo Go no celular
echo 2. Conecte celular e PC na mesma rede Wi-Fi
echo 3. Escaneie o QR Code que aparecer
echo.
echo ========================================
echo.

cd /d "%~dp0"
set EXPO_NO_TELEMETRY=1
npx expo start --clear

pause
