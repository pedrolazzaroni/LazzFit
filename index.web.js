import { registerRootComponent } from 'expo';
import App from './App';

// Garantir que o app se adapte bem ao ambiente web
if (typeof document !== 'undefined') {
  // Detectar problemas de renderização
  const consoleError = console.error;
  console.error = (...args) => {
    // Filtrar erros específicos do React Native Web
    const skipErrorMessages = [
      'Warning: Extra attributes from the server',
      'Warning: The tag <',
      'Warning: React does not recognize the',
    ];
    
    if (!args[0] || typeof args[0] !== 'string' || 
        !skipErrorMessages.some(msg => args[0].includes(msg))) {
      consoleError(...args);
    }
  };

  // Configurar a raiz do aplicativo web
  const rootTag = document.getElementById('root');
  if (rootTag) {
    rootTag.style.display = 'flex';
    rootTag.style.flexDirection = 'column';
    rootTag.style.minHeight = '100vh';
    rootTag.style.maxWidth = '100%';
  }
}

registerRootComponent(App);
