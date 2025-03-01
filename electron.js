const path = require('path');
const { app, BrowserWindow, screen, Menu, shell, dialog } = require('electron');
const isDev = require('electron-is-dev');

// Referência para a janela principal para evitar que seja coletada pelo garbage collector
let mainWindow;

function createWindow() {
  // Obtém o tamanho da tela
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // Calcula tamanho ideal para a janela (85% da tela, máximo de 1200x900)
  const windowWidth = Math.min(1200, width * 0.85);
  const windowHeight = Math.min(900, height * 0.85);
  
  // Cria a janela do aplicativo
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: isDev,
      webSecurity: !isDev
    },
    title: 'LazzFit',
    icon: path.join(__dirname, 'assets/icon.png'),
    backgroundColor: '#212121',
    show: false, // Inicialmente oculta para mostrar apenas quando tudo estiver carregado
  });

  // URL para carregar
  const startUrl = isDev
    ? 'http://localhost:19006'
    : `file://${path.join(__dirname, 'web-build/index.html')}`;

  // Carrega a aplicação
  mainWindow.loadURL(startUrl);
  
  // Mostra janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  
  // Abre links externos no navegador padrão
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Abre ferramentas de desenvolvimento em modo de desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  // Evento para quando a janela for fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Cria o menu da aplicação
  createMenu();
}

// Cria o menu da aplicação
function createMenu() {
  const isMac = process.platform === 'darwin';
  
  const template = [
    // Menu do App (apenas no macOS)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // Menu Arquivo
    {
      label: 'Arquivo',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit', label: 'Sair' }
      ]
    },
    // Menu Editar
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' }
      ]
    },
    // Menu Visualizar
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Recarregar Forçado' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' }
      ]
    },
    // Menu Ajuda
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre LazzFit',
          click: async () => {
            dialog.showMessageBox({
              title: 'Sobre LazzFit',
              message: 'LazzFit - Seu app de fitness',
              detail: 'Versão 1.0.0\nDesenvolvido com Electron e React Native Web',
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Visitar Site',
          click: async () => {
            await shell.openExternal('https://lazzfit.app');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Quando o aplicativo estiver pronto
app.whenReady().then(() => {
  createWindow();
  
  // No macOS, é comum recriar uma janela no aplicativo quando
  // o ícone do dock é clicado e não há outras janelas abertas.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Sair quando todas as janelas forem fechadas, exceto no macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
