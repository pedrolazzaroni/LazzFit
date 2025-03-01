const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function(env, argv) {
  // Configuração base do Expo
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@ui-kitten/components',
          'react-native-vector-icons',
          '@expo/vector-icons',
          'expo-linear-gradient',
        ]
      }
    },
    argv
  );
  
  // Resolução de módulos para web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-maps': 'react-native-web-maps',
    'react-native-linear-gradient': 'react-native-web-linear-gradient',
  };

  // Polyfills para ambiente web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "path": require.resolve("path-browserify"),
    "fs": false,
    "net": false,
    "tls": false,
    "child_process": false,
    "zlib": false,
  };

  // Melhorias para desenvolvimento
  if (env.mode === 'development') {
    config.devServer = {
      ...config.devServer,
      historyApiFallback: true,
    };
  }

  // Melhoria para a build de produção
  if (env.mode === 'production') {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 30000,
        maxSize: 250000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
      }
    };
  }

  return config;
};
