@echo off
echo ===================================================
echo     INSTALANDO DEPENDENCIAS WEB PARA LAZZFIT
echo ===================================================
echo.

cd /d "%~dp0"

echo Instalando dependencias necessarias para web...
call npx expo install react-dom@18.3.1 react-native-web@~0.19.13 @expo/metro-runtime@~4.0.1

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Falha ao instalar dependencias web.
    echo.
    echo Tentando uma abordagem alternativa...
    call npm install react-dom@18.3.1 react-native-web@~0.19.13 @expo/metro-runtime@~4.0.1 --save
)

echo.
echo Instalacao concluida. Tentando iniciar o app web...
echo.

echo Limpando cache do expo...
call npx expo start --clear --no-dev --web

echo.
echo Se o app ainda nao iniciar, tente executar:
echo iniciar_web.bat
echo.
echo ===================================================

pause
