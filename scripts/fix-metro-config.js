const fs = require('fs');
const path = require('path');

console.log('🔧 Ajustando a configuração do Metro Bundler...');

// Caminho para os arquivos de configuração
const metroConfigCjsPath = path.join(process.cwd(), 'metro.config.cjs');
const metroConfigJsPath = path.join(process.cwd(), 'metro.config.js');

try {
  // Verificar se o arquivo metro.config.cjs existe
  if (fs.existsSync(metroConfigCjsPath)) {
    console.log('📝 Encontrado arquivo metro.config.cjs');
    
    // Criar conteúdo para o novo arquivo metro.config.js
    const metroConfigJs = `// Configuração personalizada do Metro Bundler
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
    
    // Escrever o novo arquivo metro.config.js
    fs.writeFileSync(metroConfigJsPath, metroConfigJs);
    console.log(`✅ Criado arquivo ${metroConfigJsPath}`);
    
    // Opcional: renomear o arquivo .cjs para evitar confusão
    const backupPath = path.join(process.cwd(), 'metro.config.cjs.backup');
    fs.renameSync(metroConfigCjsPath, backupPath);
    console.log(`✅ Arquivo antigo renomeado para ${backupPath}`);
  } else {
    // Se não existir, criar o arquivo metro.config.js diretamente
    const metroConfigJs = `// Configuração personalizada do Metro Bundler
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
    
    fs.writeFileSync(metroConfigJsPath, metroConfigJs);
    console.log(`✅ Criado novo arquivo ${metroConfigJsPath}`);
  }
  
  console.log('\n✅ Configuração do Metro Bundler ajustada com sucesso!');
  console.log('\n🚀 Agora você pode executar:');
  console.log('   npm run android-clean');
} catch (error) {
  console.error('❌ Erro ao ajustar a configuração do Metro:', error.message);
}
