const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo problemas de sintaxe no React Native...');

try {
  // Limpar cache
  console.log('\n1️⃣ Limpando cache do Metro...');
  const cachePath = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cachePath)) {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${cachePath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${cachePath}"`, { stdio: 'inherit' });
    }
  }
  
  // Corrigir o arquivo problemático
  console.log('\n2️⃣ Aplicando patch para o arquivo NativeAnimatedHelper.js...');
  const filePath = path.join(process.cwd(), 'node_modules', 'react-native', 'src', 'private', 'animated', 'NativeAnimatedHelper.js');
  
  if (fs.existsSync(filePath)) {
    // Fazer backup do arquivo original
    fs.copyFileSync(filePath, `${filePath}.backup`);
    console.log('✅ Backup do arquivo original criado');
    
    // Ler o conteúdo do arquivo
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substituir o código problemático
    console.log('Aplicando correções...');
    
    // Corrigir a sintaxe de tipagem que está causando problemas
    content = content.replace(
      /\) as \$NonMaybeType<typeof NativeAnimatedModule>\['getValue'\],/g, 
      '), // Fixed type annotation'
    );
    
    // Remover outras anotações Flow problemáticas
    content = content.replace(
      /: \$ReadOnly<\{[^}]*\}>/g,
      ''
    );
    
    // Salvar o arquivo corrigido
    fs.writeFileSync(filePath, content);
    console.log('✅ Arquivo corrigido com sucesso');
  } else {
    console.log('⚠️ Arquivo NativeAnimatedHelper.js não encontrado no caminho esperado');
  }
  
  console.log('\n3️⃣ Limpando cache do Watchman se disponível...');
  try {
    execSync('watchman watch-del-all', { stdio: 'inherit' });
    console.log('✅ Cache do Watchman limpo');
  } catch (e) {
    console.log('⚠️ Watchman não disponível, pulando...');
  }
  
  console.log('\n4️⃣ Atualizando metro.config.js para melhor compatibilidade...');
  const metroConfigPath = path.join(process.cwd(), 'metro.config.js');
  const metroConfig = `// Configuração do Metro Bundler otimizada

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
  /\\.\\(native\\|ios\\|android\\)\\.js$/,
];

// Melhorar performance
config.maxWorkers = 2;
config.transformer.minifierPath = 'metro-minify-terser';

module.exports = config;`;
  
  fs.writeFileSync(metroConfigPath, metroConfig);
  console.log('✅ metro.config.js atualizado');

  console.log('\n✅ Correções aplicadas com sucesso!');
  console.log('\n🚀 Agora execute:');
  console.log('   npx expo start --clear');
} catch (error) {
  console.error('\n❌ Erro durante a correção:', error.message);
  process.exit(1);
}
