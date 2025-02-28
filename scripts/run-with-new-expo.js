// Este script usa diretamente o novo Expo CLI através de npx
const { execSync } = require('child_process');

console.log('🚀 Iniciando o aplicativo com o novo Expo CLI...');
console.log('Resolvendo problemas de compatibilidade...\n');

try {
  // Executa o aplicativo com npx expo diretamente
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erro ao iniciar o Expo:', error.message);
  
  // Tenta corrigir dependências se houver erro
  console.log('\n🔧 Tentando corrigir dependências...');
  try {
    execSync('npx expo doctor --fix-dependencies', { stdio: 'inherit' });
    console.log('\n🔄 Tentando iniciar novamente...');
    execSync('npx expo start --clear', { stdio: 'inherit' });
  } catch (repairError) {
    console.error('❌ Não foi possível reparar automaticamente:', repairError.message);
    console.log('\n💡 Recomendações:');
    console.log('1. Execute manualmente: npx expo doctor --fix-dependencies');
    console.log('2. Depois: npx expo start --clear');
  }
}
