@echo off
echo ================================================
echo      INICIANDO LAZZFIT VERSÃO DESKTOP
echo ================================================
echo.

cd /d "%~dp0"

echo 1. Instalando dependências necessárias...
call npm install --save electron electron-is-dev
call npm install --save-dev electron-builder concurrently wait-on

echo.
echo 2. Verificando a existência de package.electron.js...

if not exist "%~dp0\electron.js" (
  echo Criando arquivo electron.js...
  (
    echo const path = require('path'^);
    echo const { app, BrowserWindow, screen } = require('electron'^);
    echo const isDev = require('electron-is-dev'^);
    echo.
    echo function createWindow(^) {
    echo   // Pegar o tamanho da tela
    echo   const { width, height } = screen.getPrimaryDisplay(^).workAreaSize;
    echo.  
    echo   // Criar janela
    echo   const mainWindow = new BrowserWindow({
    echo     width: Math.min(1200, width * 0.85^),
    echo     height: Math.min(900, height * 0.85^),
    echo     webPreferences: {
    echo       nodeIntegration: true,
    echo       contextIsolation: false
    echo     },
    echo     title: 'LazzFit',
    echo     icon: path.join(__dirname, 'assets/icon.png'^),
    echo     backgroundColor: '#212121',
    echo   }^);
    echo.
    echo   // Carregar a aplicação
    echo   const startUrl = isDev
    echo     ? 'http://localhost:19006'
    echo     : `file://${path.join(__dirname, 'web-build/index.html'^)}`;
    echo.  
    echo   mainWindow.loadURL(startUrl^);
    echo.
    echo   // Abrir DevTools se estiver em desenvolvimento
    echo   if (isDev^) {
    echo     mainWindow.webContents.openDevTools({ mode: 'detach' }^);
    echo   }
    echo }
    echo.
    echo app.whenReady(^).then(createWindow^);
    echo.
    echo app.on('window-all-closed', (^) =^> {
    echo   if (process.platform !== 'darwin'^) {
    echo     app.quit(^);
    echo   }
    echo }^);
    echo.
    echo app.on('activate', (^) =^> {
    echo   if (BrowserWindow.getAllWindows(^).length === 0^) {
    echo     createWindow(^);
    echo   }
    echo }^);
  ) > electron.js
)

echo.
echo 3. Adicionando scripts para Electron ao package.json...

echo.
echo 4. Iniciando o servidor web e o Electron...
echo.
echo [1] Iniciar aplicação em modo desenvolvimento
echo [2] Construir aplicação e executar em modo produção
echo.
set /p option="Digite a opção (1 ou 2): "

if "%option%"=="1" (
  echo.
  echo Iniciando em modo desenvolvimento...
  echo.
  echo Primeiro a aplicação web será iniciada, aguarde...
  start /b cmd /c "npx expo start --web --port 19006"
  echo.
  echo Aguardando 10 segundos para o servidor web iniciar...
  timeout /t 10
  echo.
  echo Iniciando aplicação desktop Electron...
  npx electron .
) else if "%option%"=="2" (
  echo.
  echo Construindo aplicação web para produção...
  call npx expo export:web --clear
  echo.
  echo Iniciando aplicação desktop em modo produção...
  npx electron .
) else (
  echo.
  echo Opção inválida! Execute o script novamente.
)

echo.
echo ================================================
pause
