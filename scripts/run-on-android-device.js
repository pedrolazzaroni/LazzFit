const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Preparando e executando no dispositivo Android...');

try {
  // 1. Aplicar patch para o arquivo problemático
  console.log('\n1️⃣ Aplicando patch para o React Native...');
  const patchSource = path.join(process.cwd(), 'src', 'patches', 'NativeAnimatedHelper.js');
  const targetPath = path.join(process.cwd(), 'node_modules', 'react-native', 'src', 'private', 'animated', 'NativeAnimatedHelper.js');
  
  // Verificar se o patch existe
  if (!fs.existsSync(patchSource)) {
    console.log('⚠️ Arquivo de patch não encontrado, criando diretório...');
    
    // Criar diretório de patches se não existir
    const patchDir = path.join(process.cwd(), 'src', 'patches');
    if (!fs.existsSync(patchDir)) {
      fs.mkdirSync(patchDir, { recursive: true });
    }
    
    // Não temos o arquivo, vamos usar o script de correção
    console.log('🔧 Executando script de correção...');
    execSync('node scripts/fix-react-native.js', { stdio: 'inherit' });
  } else {
    // Temos o arquivo de patch, vamos copiá-lo
    fs.copyFileSync(patchSource, targetPath);
    console.log('✅ Patch aplicado ao NativeAnimatedHelper.js');
  }

  // 2. Limpar cache
  console.log('\n2️⃣ Limpando cache...');
  const cachePath = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cachePath)) {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${cachePath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${cachePath}"`, { stdio: 'inherit' });
    }
    console.log('✅ Cache limpo');
  }
  
  // 3. Verificar conexão com dispositivo
  console.log('\n3️⃣ Verificando dispositivos Android conectados...');
  const devices = execSync('adb devices').toString();
  console.log(devices);
  
  if (!devices.includes('device')) {
    console.log('⚠️ Nenhum dispositivo Android conectado ou autorizado.');
    console.log('Por favor, conecte um dispositivo ou inicie um emulador.');
    process.exit(1);
  }
  
  // 4. Executar no dispositivo Android
  console.log('\n4️⃣ Executando no dispositivo Android...');
  console.log('⏳ Este processo pode levar alguns minutos...');
  
  // Usar o comando de execução direta
  execSync('npx expo run:android --device', { stdio: 'inherit' });
  
} catch (error) {
  console.error('\n❌ Erro:', error.message);
  console.log('\n💡 Tente estas etapas alternativas:');
  console.log('1. Execute: node scripts/fix-react-native.js');
  console.log('2. Em seguida: npx expo start --clear');
  process.exit(1);
}
