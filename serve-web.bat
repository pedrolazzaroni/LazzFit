@echo off
echo ================================================
echo         SERVINDO LAZZFIT WEB
echo ================================================
echo.

cd /d "%~dp0"

echo Verificando se npx serve está instalado...
npx serve --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Instalando servidor web 'serve'...
  call npm install -g serve
)

echo.
echo Iniciando servidor na porta 3000...
echo.
echo Acesse: http://localhost:3000
echo.
echo Pressione Ctrl+C para encerrar o servidor.
echo.

npx serve web-build -l 3000
