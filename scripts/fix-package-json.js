const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo arquivo package.json...');

// Caminho para o arquivo package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');

try {
  // Criar um novo objeto package.json corrigido
  const packageJson = {
    "name": "lazzfit",
    "version": "1.0.0",
    "main": "node_modules/expo/AppEntry.js",
    "scripts": {
      "start": "expo start --config metro.config.cjs",
      "android": "expo start --android --config metro.config.cjs",
      "android-clean": "expo start --android --clear --config metro.config.cjs",
      "reset-cache": "node scripts/reset-metro.js",
      "ios": "expo start --ios --config metro.config.cjs",
      "web": "expo start --web --config metro.config.cjs",
      "verify-firebase": "node scripts/verify-firebase.js",
      "test": "node tests/run-tests.js"
    },
    "dependencies": {
      "@react-navigation/bottom-tabs": "^6.6.1",
      "@react-navigation/native": "^6.1.18",
      "@react-navigation/stack": "^6.4.1",
      "expo": "~49.0.0",
      "expo-constants": "~14.4.2",
      "expo-location": "~16.1.0",
      "expo-status-bar": "~1.6.0",
      "firebase": "^10.14.1",
      "react": "18.2.0",
      "react-native": "0.72.10",
      "react-native-gesture-handler": "~2.12.0",
      "react-native-maps": "1.7.1",
      "react-native-safe-area-context": "4.6.3",
      "react-native-screens": "~3.22.0",
      "react-native-vector-icons": "^10.0.0"
    },
    "devDependencies": {
      "@babel/core": "^7.20.0",
      "metro-config": "^0.76.9",
      "metro-minify-terser": "^0.81.2"
    },
    "private": true
  };

  // Fazer backup do arquivo original
  const packageJsonBackupPath = path.join(process.cwd(), 'package.json.backup');
  if (fs.existsSync(packageJsonPath)) {
    fs.copyFileSync(packageJsonPath, packageJsonBackupPath);
    console.log(`✅ Backup do package.json original criado em ${packageJsonBackupPath}`);
  }

  // Escrever o novo arquivo package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Arquivo package.json corrigido com sucesso!');
  
  // Verificar se o arquivo metro.config.cjs existe
  const metroConfigCjsPath = path.join(process.cwd(), 'metro.config.cjs');
  if (!fs.existsSync(metroConfigCjsPath)) {
    // Criar metro.config.cjs se não existir
    const metroConfigCjs = `// Configuração personalizada do Metro Bundler
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações adicionais para resolver problemas comuns
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json']; // Adiciona extensões suportadas
config.resolver.assetExts = [...config.resolver.assetExts, 'pem', 'crt']; // Adiciona tipos de assets
config.transformer.minifierPath = 'metro-minify-terser'; // Usa um minificador alternativo
config.maxWorkers = 2; // Reduz o número de workers para evitar problemas de memória

// Aumenta o limite de memória
config.cacheStores = [];

module.exports = config;`;
    
    fs.writeFileSync(metroConfigCjsPath, metroConfigCjs);
    console.log(`✅ Criado arquivo ${metroConfigCjsPath}`);
  }

  console.log('\n🚀 Agora você pode executar:');
  console.log('   npm run android');
  console.log('   ou');
  console.log('   npm run android-clean');
} catch (error) {
  console.error('❌ Erro ao corrigir package.json:', error.message);
}
