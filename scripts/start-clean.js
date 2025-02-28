const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧹 Iniciando limpeza e iniciando o aplicativo...');

try {
  // Limpar o cache
  console.log('\n1️⃣ Limpando caches...');
  
  // Verificar se a pasta node_modules/.cache existe e removê-la
  const cachePath = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cachePath)) {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${cachePath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${cachePath}"`, { stdio: 'inherit' });
    }
    console.log('✅ Cache do Node removido');
  }
  
  // Verificar se a pasta .expo existe e removê-la
  const expoPath = path.join(process.cwd(), '.expo');
  if (fs.existsSync(expoPath)) {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${expoPath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${expoPath}"`, { stdio: 'inherit' });
    }
    console.log('✅ Cache do Expo removido');
  }
  
  // Iniciar a aplicação no Android com o cache limpo
  console.log('\n2️⃣ Iniciando aplicação no Android...');
  execSync('expo start --android --clear', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}
