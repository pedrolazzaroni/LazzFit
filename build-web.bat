@echo off
echo ================================================
echo         CONSTRUINDO LAZZFIT PARA WEB
echo ================================================
echo.

cd /d "%~dp0"

echo Instalando dependencias necessárias...
call npm install --save react-dom react-native-web @expo/metro-runtime react-native-web-maps crypto-browserify path-browserify stream-browserify

echo.
echo Limpando build anterior...
if exist "web-build" rmdir /s /q web-build

echo.
echo Construindo projeto para web...
call npx expo export:web

echo.
echo Copiando arquivos index.html personalizados...
copy "%~dp0\web\index.html" "%~dp0\web-build\index.html"

echo.
echo ================================================
echo Build concluído! Para testar, execute:
echo serve-web.bat
echo ================================================

pause
