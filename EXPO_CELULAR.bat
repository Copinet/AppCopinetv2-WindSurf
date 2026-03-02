@echo off
echo ========================================
echo EXPO - TESTE NO CELULAR
echo ========================================
echo.
echo Aguarde o QR Code aparecer (pode demorar 1-2 minutos)...
echo.

cd /d "%~dp0"
set EXPO_NO_DOCTOR=1
set EXPO_NO_TELEMETRY=1
npx expo start --clear --host lan

pause
