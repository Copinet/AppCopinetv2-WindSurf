@echo off
echo ========================================
echo COPINET - INICIANDO SERVIDOR
echo ========================================
echo.
echo Seu IP local: 192.168.0.102
echo.
echo IMPORTANTE:
echo 1. Conecte seu celular na MESMA WiFi
echo 2. Abra o Expo Go no celular
echo 3. Escaneie o QR Code que vai aparecer
echo.
echo ========================================
echo.

cd /d "%~dp0"
npx expo start --lan --clear

pause
