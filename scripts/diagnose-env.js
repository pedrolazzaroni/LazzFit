const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando diagnóstico do ambiente de desenvolvimento...\n');

// Informações do sistema
console.log('📊 INFORMAÇÕES DO SISTEMA:');
console.log(`Sistema Operacional: ${os.platform()} ${os.release()}`);
console.log(`Arquitetura: ${os.arch()}`);
console.log(`Memória Total: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`);
console.log(`Memória Livre: ${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`);
console.log(`CPUs: ${os.cpus().length}\n`);

// Verificar Node.js e npm
console.log('📦 VERSÕES DE NODE.JS E NPM:');
try {
  const nodeVersion = execSync('node --version').toString().trim();
  console.log(`Node.js: ${nodeVersion}`);
  
  const npmVersion = execSync('npm --version').toString().trim();
  console.log(`npm: ${npmVersion}`);
  
  // Verificar se as versões são compatíveis com Expo
  const nodeVersionNum = parseFloat(nodeVersion.replace('v', ''));
  if (nodeVersionNum < 14 || nodeVersionNum >= 21) {
    console.warn('⚠️ AVISO: A versão do Node.js pode não ser ideal para o Expo. Recomendado: Node.js 14.x - 20.x');
  } else {
    console.log('✅ Versão do Node.js compatível com Expo');
  }
} catch (error) {
  console.error('❌ Erro ao verificar versões de Node/npm:', error.message);
}

// Verificar Expo CLI
console.log('\n📱 VERSÃO DO EXPO:');
try {
  const expoVersionOutput = execSync('npx expo --version').toString().trim();
  console.log(`Expo CLI: ${expoVersionOutput}`);
  
  // Verificar dependências do projeto
  console.log('\n📋 DEPENDÊNCIAS PRINCIPAIS:');
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    console.log('- React Native:', packageJson.dependencies['react-native']);
    console.log('- React:', packageJson.dependencies.react);
    console.log('- Expo:', packageJson.dependencies.expo);
    console.log('- React Navigation:', packageJson.dependencies['@react-navigation/native']);
    
    // Verificar compatibilidade
    if (packageJson.dependencies.expo.includes('49.') && 
        !packageJson.dependencies['react-native'].includes('0.72.')) {
      console.warn('⚠️ AVISO: Versão do React Native possivelmente incompatível com Expo 49');
    } else {
      console.log('✅ Versões de Expo e React Native parecem compatíveis');
    }
  }
} catch (error) {
  console.error('❌ Erro ao verificar Expo:', error.message);
}

// Verificar ambiente Android
console.log('\n🤖 AMBIENTE ANDROID:');
try {
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (androidHome) {
    console.log(`ANDROID_HOME: ${androidHome}`);
    if (fs.existsSync(androidHome)) {
      console.log('✅ Diretório do Android SDK encontrado');
    } else {
      console.warn('⚠️ AVISO: ANDROID_HOME definido mas diretório não encontrado');
    }
  } else {
    console.warn('⚠️ AVISO: ANDROID_HOME/ANDROID_SDK_ROOT não definido');
  }
  
  try {
    const adbDevices = execSync('adb devices').toString().trim();
    console.log('\nDispositivos ADB conectados:');
    console.log(adbDevices);
  } catch (e) {
    console.warn('⚠️ AVISO: Não foi possível listar dispositivos ADB');
  }
} catch (error) {
  console.error('❌ Erro ao verificar ambiente Android:', error.message);
}

console.log('\n📝 RECOMENDAÇÕES:');
console.log('1. Execute `npm run reset-cache` para limpar o cache do Metro Bundler');
console.log('2. Verifique se há versões incompatíveis de pacotes com `npx expo-doctor`');
console.log('3. Certifique-se de que o emulador Android está em execução');
console.log('4. Tente executar com `npm run android-clean`');

console.log('\n✅ Diagnóstico concluído!');
