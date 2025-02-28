const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo conexão USB e configuração do Expo Development Client...');

try {
  // Verificar se o ADB está presente e funcionando
  console.log('\n1️⃣ Verificando conexão ADB...');
  try {
    const adbDevices = execSync('adb devices').toString().trim();
    console.log(adbDevices);
    
    if (!adbDevices.includes('device')) {
      console.log('\n⚠️ Nenhum dispositivo detectado ou dispositivo não autorizado.');
      console.log('Verifique se:');
      console.log('1. O dispositivo está conectado via USB');
      console.log('2. A depuração USB está habilitada');
      console.log('3. Você autorizou este computador no dispositivo');
      console.log('4. O driver USB está instalado corretamente');
    } else {
      console.log('✅ Dispositivo(s) conectado(s) e pronto(s)');
    }
  } catch (adbError) {
    console.error('❌ Erro ao executar ADB. Verifique se o Android SDK está instalado e no PATH.');
  }

  // Reiniciar o servidor ADB
  console.log('\n2️⃣ Reiniciando servidor ADB...');
  try {
    execSync('adb kill-server', { stdio: 'inherit' });
    execSync('adb start-server', { stdio: 'inherit' });
    console.log('✅ Servidor ADB reiniciado');
  } catch (adbRestartError) {
    console.error('❌ Erro ao reiniciar ADB:', adbRestartError.message);
  }

  // Atualizar o app.json para corrigir o problema de runtime
  console.log('\n3️⃣ Atualizando configuração do app.json...');
  const appJsonPath = path.join(process.cwd(), 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

    // Modificar a configuração de runtime
    if (appConfig.expo) {
      appConfig.expo.runtimeVersion = {
        policy: "appVersion"
      };
      
      // Certificar-se de que updates está configurado (mas desativado para desenvolvimento)
      appConfig.expo.updates = appConfig.expo.updates || {};
      appConfig.expo.updates.enabled = false;
      
      // Remover development client para testes
      delete appConfig.expo.developmentClient;
    }

    fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));
    console.log('✅ app.json atualizado');
  } else {
    console.error('❌ app.json não encontrado');
  }

  // Limpar cache do Expo/Metro
  console.log('\n4️⃣ Limpando cache do Expo/Metro...');
  try {
    const expoPath = path.join(process.cwd(), '.expo');
    if (fs.existsSync(expoPath)) {
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${expoPath}"`, { stdio: 'inherit' });
      } else {
        execSync(`rm -rf "${expoPath}"`, { stdio: 'inherit' });
      }
    }
    console.log('✅ Cache do Expo removido');
  } catch (cacheError) {
    console.error('❌ Erro ao limpar cache:', cacheError.message);
  }

  console.log('\n✅ Configuração completa!');
  console.log('\n🚀 Agora execute:');
  console.log('   npx expo start --clear');
  console.log('   ou');
  console.log('   npx expo run:android');

} catch (error) {
  console.error('\n❌ Erro:', error.message);
  process.exit(1);
}
