@echo off
echo ===================================================
echo     INICIANDO LAZZFIT NO NAVEGADOR (JAVASCRIPT)
echo ===================================================
echo.

cd /d "%~dp0"

echo Verificando se os pacotes Node.js estão instalados...
if not exist "node_modules" (
    echo Os pacotes não estão instalados. Instalando agora...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Falha ao instalar os pacotes.
        goto :EXIT
    )
)

echo.
echo Inicializando o app no navegador...
echo.
echo ATENÇÃO: Quando o navegador abrir, clique em "Run on web browser"
echo ou adicione "/web" ao final da URL no seu navegador.
echo.

call npx expo start --web

:EXIT
pause
