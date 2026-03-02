@echo off
cls
echo ========================================
echo EXPO - TESTE NO CELULAR
echo ========================================
echo.
echo Seu IP: 192.168.0.102
echo.
echo PASSOS:
echo 1. Instale "Expo Go" no celular (Play Store/App Store)
echo 2. Conecte celular na mesma rede Wi-Fi
echo 3. Aguarde o servidor iniciar...
echo 4. Abra: http://192.168.0.102:19006 no navegador do PC
echo 5. Escaneie o QR Code com Expo Go
echo.
echo ========================================
echo.
echo Iniciando servidor...
echo.

cd /d "%~dp0"
set EXPO_NO_DOCTOR=1
set EXPO_NO_TELEMETRY=1
npx expo start --port 8081

pause
