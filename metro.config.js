// Configuração do Metro Bundler otimizada

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuração para resolver problemas com o Firebase e idb
config.resolver.extraNodeModules = {
  // Este é um "mock" para o módulo idb que o Firebase tenta importar
  idb: require.resolve('./src/mocks/idbMock.js'),
};

// Adicionamos as extensões que o Metro deve resolver
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Ignorar avisos do Metro para tipos Flow
config.resolver.blockList = [
  // Adicionar padrões para arquivos problemáticos se necessário
  /\.\(native\|ios\|android\)\.js$/,
];

// Melhorar performance
config.maxWorkers = 2;
config.transformer.minifierPath = 'metro-minify-terser';

module.exports = config;