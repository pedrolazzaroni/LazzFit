@echo off
echo ================================================
echo      CONSTRUINDO LAZZFIT PARA WEB - OTIMIZADO
echo ================================================
echo.

cd /d "%~dp0"

echo Instalando todas as dependências necessárias...
echo (Isso pode demorar um pouco)
call npm install --save react-dom react-native-web @expo/metro-runtime react-native-web-maps react-native-web-linear-gradient
call npm install --save-dev crypto-browserify path-browserify stream-browserify webpack webpack-cli webpack-dev-server

echo.
echo Criando diretório para ícones web...
if not exist "web\icons" mkdir "web\icons"

echo.
echo Criando pasta para build web...
if exist "web-build" rmdir /s /q web-build

echo.
echo Construindo projeto para web (versão otimizada)...
call npx expo export:web --clear

echo.
echo Copiando arquivos personalizados...
copy "%~dp0\web\index.html" "%~dp0\web-build\index.html"
copy "%~dp0\web\manifest.json" "%~dp0\web-build\manifest.json"
if exist "web\icons" xcopy /E /I /Y "%~dp0\web\icons" "%~dp0\web-build\icons"

echo.
echo ================================================
echo Build completo! Para testar, execute:
echo serve-web.bat
echo ================================================
echo.
echo Se a aplicação não funcionar corretamente, 
echo verifique os logs de erro no console do navegador.
echo.

pause
