@echo off
REM filepath: /C:/Users/phlaz/Documents/Projetos/LazzFit/setup_windows.bat
SETLOCAL EnableDelayedExpansion

echo ====================================================
echo            CONFIGURACAO DO LAZZFIT
echo ====================================================
echo.

REM Verificar se está sendo executado como administrador
REM (Alguns usuários podem precisar disso para instalar pacotes)
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo Este script nao esta sendo executado como administrador.
    echo Alguns recursos podem nao funcionar corretamente.
    echo.
    echo Pressione qualquer tecla para continuar mesmo assim ou feche
    echo esta janela e execute novamente como administrador.
    pause > nul
)

REM Verificar se Python está instalado
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python nao encontrado no PATH! Verificando instalacoes comuns...
    
    REM Verificar instalações comuns do Python
    set "PYTHON_PATH="
    
    REM Verificar caminhos comuns
    if exist "%LOCALAPPDATA%\Programs\Python\Python3*\python.exe" (
        for /d %%i in ("%LOCALAPPDATA%\Programs\Python\Python3*") do (
            set "PYTHON_PATH=%%i\python.exe"
        )
    ) else if exist "C:\Python3*\python.exe" (
        for /d %%i in ("C:\Python3*") do (
            set "PYTHON_PATH=%%i\python.exe"
        )
    ) else if exist "C:\Program Files\Python3*\python.exe" (
        for /d %%i in ("C:\Program Files\Python3*") do (
            set "PYTHON_PATH=%%i\python.exe"
        )
    )
    
    if "!PYTHON_PATH!" NEQ "" (
        echo Python encontrado em: !PYTHON_PATH!
        set "PYTHON=!PYTHON_PATH!"
    ) else (
        echo.
        echo Python nao encontrado no sistema!
        echo.
        echo Por favor, instale o Python 3.7 ou superior antes de continuar.
        echo Voce pode baixar Python em: https://www.python.org/downloads/
        echo.
        echo Recomendamos instalar com a opcao "Add Python to PATH" marcada.
        echo.
        echo Apos a instalacao, execute este script novamente.
        echo.
        pause
        exit /b 1
    )
) else (
    set "PYTHON=python"
    echo Python encontrado no PATH.
)

REM Verificar versão do Python
%PYTHON% -c "import sys; print(f'Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')"
%PYTHON% -c "import sys; sys.exit(0 if sys.version_info >= (3, 7) else 1)"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo AVISO: Foi detectada uma versao do Python anterior a 3.7.
    echo O LazzFit requer Python 3.7 ou superior.
    echo.
    echo Por favor, atualize sua instalacao do Python.
    pause
    exit /b 1
)

echo.
echo Python verificado com sucesso!
echo.

REM Verificar ou criar ambiente virtual
if not exist "venv" (
    echo Criando ambiente virtual...
    %PYTHON% -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERRO: Falha ao criar o ambiente virtual.
        echo Verifique se o módulo venv está disponível.
        echo.
        echo Tente instalar com: %PYTHON% -m pip install virtualenv
        pause
        exit /b 1
    )
) else (
    echo Ambiente virtual ja existe.
)

echo.
echo Ativando ambiente virtual...
call venv\Scripts\activate

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Falha ao ativar o ambiente virtual.
    pause
    exit /b 1
)

echo.
echo Instalando dependencias necessarias...

REM Atualizar pip primeiro
python -m pip install --upgrade pip

REM Instalar dependências
python -m pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Falha ao instalar as dependencias.
    echo Verifique seu acesso a internet e tente novamente.
    pause
    exit /b 1
)

REM Verificar se o banco de dados existe
if not exist "lazzfit.db" (
    echo.
    echo Criando banco de dados inicial...
    python -c "from database import create_tables; create_tables()"
)

REM Criar arquivo de execução fácil
echo @echo off > executar_lazzfit.bat
echo call venv\Scripts\activate >> executar_lazzfit.bat
echo start python main.py >> executar_lazzfit.bat
echo exit >> executar_lazzfit.bat

echo.
echo ====================================================
echo            INSTALACAO CONCLUIDA!
echo ====================================================
echo.
echo Para iniciar o LazzFit, voce pode:
echo.
echo 1. Executar o arquivo 'executar_lazzfit.bat' (criado agora)
echo 2. Ou ativar manualmente o ambiente e executar o script:
echo    - call venv\Scripts\activate
echo    - python main.py
echo.
echo ====================================================

REM Perguntar se deseja iniciar agora
set /p start_now="Deseja iniciar o LazzFit agora? (S/N): "
if /i "%start_now%"=="S" (
    echo.
    echo Iniciando o LazzFit...
    python main.py
)

echo.
echo Obrigado por instalar o LazzFit!
pause