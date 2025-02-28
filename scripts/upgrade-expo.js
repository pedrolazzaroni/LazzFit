const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Atualizando o projeto LazzFit para o SDK 52 do Expo...');

try {
  console.log('\n1️⃣ Criando backup do package.json atual...');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const backupPath = path.join(process.cwd(), 'package.json.backup');
  fs.copyFileSync(packageJsonPath, backupPath);
  console.log(`✅ Backup criado em ${backupPath}`);

  console.log('\n2️⃣ Executando atualização para SDK 52...');
  console.log('⚠️ ATENÇÃO: Este processo pode levar alguns minutos.');
  console.log('⚠️ Não interrompa o processo até que seja concluído.\n');

  // Instalar expo-cli globalmente para garantir que temos as ferramentas de upgrade
  execSync('npm install -g expo-cli', { stdio: 'inherit' });

  // Executar o comando de upgrade
  execSync('npx expo-cli upgrade --no-install', { stdio: 'inherit' });

  // Instalar o pacote SDK 52 específico
  execSync('npm install expo@~52.0.0', { stdio: 'inherit' });

  // Atualizar dependências relacionadas ao Expo para versões compatíveis
  console.log('\n3️⃣ Atualizando dependências relacionadas...');
  
  const dependencias = [
    'expo-location@~16.5.0',
    'expo-constants@~15.4.0',
    'expo-status-bar@~1.11.0',
    'react-native-maps@1.10.0',
    'react@18.2.0',
    'react-native@0.73.4'
  ];
  
  execSync(`npm install ${dependencias.join(' ')}`, { stdio: 'inherit' });

  // Limpar cache
  console.log('\n4️⃣ Limpando cache...');
  execSync('npm run reset-cache', { stdio: 'inherit' });

  console.log('\n✅ Atualização para SDK 52 concluída!');
  console.log('\n🚀 Agora você pode executar o app com:');
  console.log('   npm run device');
  
} catch (error) {
  console.error('\n❌ Erro durante a atualização:', error.message);
  console.error('\nCaso a atualização tenha falhado, você pode:');
  console.error('1. Restaurar o backup do package.json');
  console.error('2. Tentar a solução alternativa usando o modo de compatibilidade');
  process.exit(1);
}
