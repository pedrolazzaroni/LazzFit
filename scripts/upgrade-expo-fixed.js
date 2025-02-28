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

  console.log('\n2️⃣ Preparando atualização para SDK 52...');
  console.log('⚠️ ATENÇÃO: Este processo pode levar alguns minutos.');
  console.log('⚠️ Não interrompa o processo até que seja concluído.\n');

  // Método manual de atualização (mais seguro que usar expo upgrade)
  console.log('📦 Atualizando para o SDK 52 diretamente...');
  
  // Modificar package.json para usar SDK 52
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Atualizar as dependências principais
  packageJson.dependencies = {
    ...packageJson.dependencies,
    "expo": "~52.0.1",
    "expo-constants": "~15.4.0",
    "expo-location": "~16.5.2",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.4",
    "react-native-maps": "1.10.0",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    "react-native-gesture-handler": "~2.14.0"
  };
  
  // Salvar as alterações do package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json atualizado para o SDK 52');

  // Instalar as dependências atualizadas
  console.log('\n3️⃣ Instalando dependências...');
  execSync('npm install', { stdio: 'inherit' });

  // Limpar cache
  console.log('\n4️⃣ Limpando cache...');
  const cachePath = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cachePath)) {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${cachePath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${cachePath}"`, { stdio: 'inherit' });
    }
  }
  
  const expoPath = path.join(process.cwd(), '.expo');
  if (fs.existsSync(expoPath)) {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${expoPath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${expoPath}"`, { stdio: 'inherit' });
    }
  }
  
  console.log('\n✅ Atualização para SDK 52 concluída!');
  console.log('\n🚀 Agora você pode executar o app com:');
  console.log('   npm run device');
  
} catch (error) {
  console.error('\n❌ Erro durante a atualização:', error.message);
  console.error('\nCaso a atualização tenha falhado, você pode:');
  console.error('1. Restaurar o backup do package.json:');
  console.error('   copy package.json.backup package.json');
  console.error('2. Tentar a solução alternativa usando o modo de compatibilidade:');
  console.error('   npm run device-compat');
  process.exit(1);
}
