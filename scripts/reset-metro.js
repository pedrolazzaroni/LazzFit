const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧹 Iniciando limpeza completa do cache do Metro Bundler...');

try {
  // Limpar cache do npm
  console.log('\n1️⃣ Limpando cache do npm...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Limpar cache do Expo/Metro
  console.log('\n2️⃣ Limpando cache do Expo/Metro...');
  execSync('npx expo start --clear', { stdio: 'inherit', timeout: 5000 });
  
  // Forçar interrupção do processo após timeout
  console.log('\nInterrompendo processo de limpeza inicial...');
  
  // Remover pasta node_modules/.cache
  console.log('\n3️⃣ Removendo pasta de cache...');
  const cachePath = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cachePath)) {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${cachePath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${cachePath}"`, { stdio: 'inherit' });
    }
    console.log('✅ Pasta de cache removida com sucesso');
  } else {
    console.log('⚠️ Pasta de cache não encontrada');
  }
  
  // Remover arquivo .expo
  console.log('\n4️⃣ Removendo arquivos de cache do Expo...');
  const expoCachePath = path.join(process.cwd(), '.expo');
  if (fs.existsSync(expoCachePath)) {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${expoCachePath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${expoCachePath}"`, { stdio: 'inherit' });
    }
    console.log('✅ Cache do Expo removido com sucesso');
  } else {
    console.log('⚠️ Cache do Expo não encontrado');
  }

  console.log('\n✅ Limpeza concluída com sucesso!');
  console.log('\n🚀 Tente executar o aplicativo novamente com:');
  console.log('   npm run android-clean');
} catch (error) {
  console.error('\n❌ Erro durante a limpeza:', error.message);
  process.exit(1);
}
