@echo off
echo ===================================
echo    LazzFit - Iniciando aplicativo
echo ===================================
echo.

REM Verificar se o Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python não encontrado! Por favor, instale Python 3.8 ou mais recente.
    echo        Visite: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

REM Verificar se o diretório da UI web existe
if not exist "webui" (
    echo [AVISO] Pasta webui não encontrada! Criando estrutura de diretórios...
    mkdir webui\css webui\js
)

REM Verificar dependências
echo Verificando dependências...
pip show pywebview >nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando dependências necessárias...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar as dependências!
        echo        Tente executar manualmente: pip install -r requirements.txt
        echo.
        pause
        exit /b 1
    )
    echo Dependências instaladas com sucesso!
    echo.
)

REM Perguntar sobre o modo de interface
echo Escolha o modo de interface:
echo 1. Interface moderna (PyWebView) [padrão]
echo 2. Interface clássica (CustomTkinter)
echo.
set /p interface_mode="Digite o número da opção (ou Enter para padrão): "

if "%interface_mode%"=="2" (
    echo.
    echo Iniciando LazzFit no modo clássico...
    python main.py --classic
) else (
    echo.
    echo Iniciando LazzFit no modo moderno...
    python main.py
)

pause
