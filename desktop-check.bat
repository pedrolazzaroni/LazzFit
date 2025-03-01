@echo off
echo ==================================================
echo         VERIFICAÇÃO DE AMBIENTE DESKTOP
echo ==================================================
echo.

echo Verificando requisitos para executar o LazzFit Desktop...

echo.
echo 1. Verificando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [X] Node.js não encontrado! Instale Node.js v14+ de:
  echo     https://nodejs.org/
  echo.
  goto :PROBLEMS
) else (
  echo [✓] Node.js instalado
  for /f "tokens=1" %%n in ('node --version') do set NODE_VERSION=%%n
  echo     Versão: %NODE_VERSION%
)

echo.
echo 2. Verificando NPM...
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [X] NPM não encontrado! Reinstale o Node.js
  echo.
  goto :PROBLEMS
) else (
  echo [✓] NPM instalado
  for /f "tokens=1" %%n in ('npm --version') do set NPM_VERSION=%%n
  echo     Versão: %NPM_VERSION%
)

echo.
echo 3. Verificando pacotes necessários...
if not exist "package.json" (
  echo [X] Arquivo package.json não encontrado!
  echo     Você está no diretório correto do projeto?
  echo.
  goto :PROBLEMS
) else (
  echo [✓] Arquivo package.json encontrado
)

echo.
echo 4. Verificando dependências do Electron...
if not exist "node_modules\electron" (
  echo [!] Electron não instalado
  echo     Execute: npm install --save-dev electron
) else (
  echo [✓] Electron instalado
)

echo.
echo 5. Verificando web-build...
if not exist "web-build" (
  echo [!] Pasta web-build não encontrada
  echo     Execute: npx expo export:web
) else (
  echo [✓] Build web encontrado
)

echo.
echo ==================================================
echo             RESUMO DA VERIFICAÇÃO
echo ==================================================
echo.
if exist "node_modules\electron" (
  if exist "web-build" (
    echo Tudo pronto! Você pode executar o app desktop com:
    echo.
    echo run-desktop.bat
    echo.
  ) else (
    echo Quase lá! Você precisa fazer o build web primeiro:
    echo.
    echo 1. Construa o app web:
    echo    npx expo export:web
    echo.
    echo 2. Execute o app desktop:
    echo    run-desktop.bat
    echo.
  )
) else (
  :PROBLEMS
  echo Você precisa resolver os problemas acima antes de
  echo executar a versão desktop do LazzFit.
  echo.
)

pause
