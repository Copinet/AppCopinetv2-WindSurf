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
