const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo problemas de módulos no projeto...');

// Caminho para o arquivo package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');

// Ler o arquivo package.json
try {
  console.log(`📝 Lendo ${packageJsonPath}...`);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Verificar se tem type: module
  if (packageJson.type === 'module') {
    console.log('🔍 Detectado "type": "module" no package.json');
    console.log('⚠️ Isto causa conflitos com algumas configurações do Metro Bundler');
    
    // Criar metro.config.cjs
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
    
    const metroConfigCjsPath = path.join(process.cwd(), 'metro.config.cjs');
    fs.writeFileSync(metroConfigCjsPath, metroConfigCjs);
    console.log(`✅ Criado arquivo ${metroConfigCjsPath}`);
    
    // Atualizar scripts no package.json
    packageJson.scripts.android = 'expo start --android --config metro.config.cjs';
    packageJson.scripts['android-clean'] = 'expo start --android --clear --config metro.config.cjs';
    packageJson.scripts.ios = 'expo start --ios --config metro.config.cjs';
    packageJson.scripts.web = 'expo start --web --config metro.config.cjs';
    packageJson.scripts.start = 'expo start --config metro.config.cjs';
    
    // Salvar package.json atualizado
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Scripts atualizados no package.json');
    
    // Remover metro.config.js
    const metroConfigJsPath = path.join(process.cwd(), 'metro.config.js');
    if (fs.existsSync(metroConfigJsPath)) {
      fs.unlinkSync(metroConfigJsPath);
      console.log(`✅ Removido arquivo incompatível ${metroConfigJsPath}`);
    }
    
    console.log('\n✅ Correções aplicadas com sucesso!');
    console.log('\n🚀 Agora você pode executar:');
    console.log('   npm run android');
    console.log('   ou');
    console.log('   npm run android-clean');
  } else {
    console.log('✅ Sua configuração de módulos parece correta (CommonJS)');
  }
} catch (error) {
  console.error('❌ Erro ao processar package.json:', error.message);
}
