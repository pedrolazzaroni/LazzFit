@echo off
REM filepath: /C:/Users/phlaz/Documents/Projetos/LazzFit/executar_lazzfit.bat

echo ======================================
echo     INICIANDO LAZZFIT
echo ======================================
echo.

REM Ativar ambiente virtual
call venv\Scripts\activate

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Nao foi possivel ativar o ambiente virtual.
    echo.
    echo Verifique se o programa foi instalado corretamente
    echo executando o arquivo "setup_windows.bat" primeiro.
    echo.
    pause
    exit /b 1
)

echo Ambiente virtual ativado. Iniciando LazzFit...
echo.
echo (Esta janela se fechara automaticamente quando o programa iniciar)
echo.

REM Iniciar o programa
start pythonw main.py

REM Aguardar um momento e fechar
timeout /t 3 /nobreak >nul
exit