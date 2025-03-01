// Script auxiliar para adicionar mais funcionalidades ao npm

const { series, rimraf } = require('nps-utils');

module.exports = {
  scripts: {
    // Limpa a cache e reinicia
    clean: {
      default: rimraf('node_modules/.cache'),
      full: series(
        'npx expo prebuild --clean',
        rimraf('node_modules'),
        'npm install'
      )
    },
    
    // Inicia o app para desenvolvimento
    start: {
      default: 'npx expo start',
      web: 'npx expo start --web',
      android: 'npx expo start --android',
      ios: 'npx expo start --ios',
      clear: 'npx expo start --clear',
      tunnel: 'npx expo start --tunnel'
    },
    
    // Ferramentas de desenvolvimento
    dev: {
      ports: 'npx kill-port 19000 19001 19002 19006',
      info: 'npx expo diagnostics',
      update: 'npx expo install expo'
    },
    
    // Preparação para build
    build: {
      web: 'npx expo export:web',
      apk: 'npx expo build:android'
    }
  }
};
